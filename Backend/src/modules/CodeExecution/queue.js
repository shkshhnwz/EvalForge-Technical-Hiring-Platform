const {Queue} = require('bullmq');
const Redis = require('ioredis');

// Connect to Redis (supports both REDIS_URL and REDIS_URI, with rediss:// TLS support)
const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://127.0.0.1:6379';

const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}),
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection Error:', err.message);
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

// Initialize the submission queue
const submissionQueue = new Queue('submission-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,                 // Retry 3 times if worker crashes
    backoff: {
      type: 'exponential',
      delay: 5000,               // Start with 5s delay
    },
    removeOnComplete: true,      // Clean up completed jobs to save memory
    removeOnFail: false,         // Keep failed jobs for debugging
  }
});
/**
 * Enqueue a code submission for grading
 * @param {string} submissionId - MongoDB submission document ID
 */
const enqueueSubmission = async (submissionId) => {
  await submissionQueue.add('grade-submission', { submissionId });
};
module.exports = {
  submissionQueue,
  enqueueSubmission,
  redisConnection,
};










