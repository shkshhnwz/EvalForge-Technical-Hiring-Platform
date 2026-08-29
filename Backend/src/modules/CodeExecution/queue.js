const {Queue} = require('bullmq');
const Redis = require('ioredis');

// Connect to Redis
const redisConnection = new Redis(process.env.REDIS_URI || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // Required by BullMQ
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










