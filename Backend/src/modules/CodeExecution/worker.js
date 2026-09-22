// src/modules/CodeExecution/worker.js
const { Worker } = require('bullmq');
const axios = require('axios');
const mongoose = require('mongoose');
const Submission = require('../../models/Submissions');
const Question = require('../../models/Question');
const { redisConnection } = require('./queue');
const { languageMap, defaultLimits } = require('./judge0.config');

// Load environment variables for Judge0
const getJudge0Config = () => {
  const rapidKey = process.env.JUDGE0_API_KEY || process.env['X-RAPIDAPI-KEY'];
  const rapidHost = process.env['X-RAPIDAPI-HOST'];
  let apiUrl = process.env.JUDGE0_API_URL;

  if (!apiUrl) {
    if (rapidHost && rapidKey) {
      apiUrl = `https://${rapidHost}`;
    } else {
      apiUrl = 'https://ce.judge0.com';
    }
  }

  apiUrl = apiUrl.replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };
  if (rapidKey && (apiUrl.includes('rapidapi.com') || rapidHost)) {
    headers['X-RapidAPI-Key'] = rapidKey.trim();
    headers['X-RapidAPI-Host'] = rapidHost ? rapidHost.trim() : new URL(apiUrl).hostname;
  }

  return { apiUrl, headers };
};

/**
 * Automatically wrap candidate code if starter template signature is used (e.g. function solution(input))
 */
const wrapCodeForExecution = (code, language) => {
  const lang = (language || '').toLowerCase();
  if (lang === 'javascript' || lang === 'node') {
    if (!code.includes('readFileSync') && !code.includes('process.stdin') && !code.includes('readline')) {
      return `${code}
const fs = require('fs');
try {
  const raw = fs.readFileSync(0, 'utf-8').trim();
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
  const res = solution(parsed);
  if (res !== undefined) {
    console.log(typeof res === 'object' ? JSON.stringify(res) : res);
  }
} catch (e) {
  console.error(e);
}
`;
    }
  } else if (lang === 'python' || lang === 'python3') {
    if (!code.includes('sys.stdin') && !code.includes('input(')) {
      return `${code}
import sys, json
try:
    raw = sys.stdin.read().strip()
    try:
        parsed = json.loads(raw)
    except:
        parsed = raw
    res = solution(parsed)
    if res is not None:
        print(json.dumps(res) if isinstance(res, (dict, list)) else res)
except Exception as e:
    import traceback
    traceback.print_exc()
`;
    }
  }
  return code;
};

/**
 * Base64 helper methods (Judge0 recommends Base64 to bypass special characters and spacing bugs)
 */
const encodeBase64 = (str) => Buffer.from(str || '').toString('base64');
const decodeBase64 = (str) => Buffer.from(str || '', 'base64').toString('utf8').trim();

/**
 * Evaluate Judge0 status code and translate to App submission status
 */
const evaluateSubmissionStatus = (results) => {
  // Check if any test case has errors
  for (const res of results) {
    if (res.status === 'compile_error') return 'compile_error';
    if (res.status === 'time_limit_exceeded') return 'time_limit_exceeded';
    if (res.status === 'memory_limit_exceeded') return 'memory_limit_exceeded';
    if (res.status === 'runtime_error') return 'runtime_error';
    if (res.status === 'wrong_answer') return 'wrong_answer';
  }
  return 'accepted';
};

/**
 * Worker Main Job Handler
 */
const processSubmissionJob = async (job) => {
  const { submissionId } = job.data;
  console.log(`[Worker] Started processing submission: ${submissionId}`);

  // 1. Fetch submission data
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    console.error(`[Worker] Submission not found: ${submissionId}`);
    return;
  }

  // Update status to 'running'
  submission.status = 'running';
  await submission.save();

  // 2. Fetch the corresponding question
  const question = await Question.findById(submission.questionId);
  if (!question) {
    submission.status = 'runtime_error';
    await submission.save();
    console.error(`[Worker] Question not found for submission: ${submissionId}`);
    return;
  }

  const judge0LangId = languageMap[submission.language.toLowerCase()];
  if (!judge0LangId) {
    submission.status = 'runtime_error';
    submission.testCaseResults = [];
    await submission.save();
    console.error(`[Worker] Unsupported language: ${submission.language}`);
    return;
  }

  const testCases = question.testCases || [];
  if (testCases.length === 0) {
    submission.status = 'accepted';
    submission.score = question.scoreWeight;
    await submission.save();
    return;
  }

  const results = [];
  let passedCount = 0;

  try {
    const { apiUrl, headers } = getJudge0Config();
    const finalSourceCode = wrapCodeForExecution(submission.code, submission.language);

    // 3. Submit all test cases to Judge0 via Batch Submission Endpoint
    const submissionsPayload = testCases.map(testCase => ({
      language_id: judge0LangId,
      source_code: encodeBase64(finalSourceCode),
      stdin: encodeBase64(testCase.input),
      expected_output: encodeBase64(testCase.expectedOutput),
      cpu_time_limit: question.cpuLimit || defaultLimits.cpuTimeLimit,
      memory_limit: question.memoryLimit || defaultLimits.memoryLimit,
    }));

    let batchPostRes;
    let activeApiUrl = apiUrl;
    let activeHeaders = headers;

    try {
      batchPostRes = await axios.post(
        `${activeApiUrl}/submissions/batch?base64_encoded=true`,
        { submissions: submissionsPayload },
        { headers: activeHeaders, timeout: 15000 }
      );
    } catch (apiErr) {
      // If primary endpoint failed (e.g. RapidAPI 403 or localhost refused), fallback to public ce.judge0.com
      if (activeApiUrl !== 'https://ce.judge0.com') {
        console.warn(`[Worker] Primary Judge0 (${activeApiUrl}) failed: ${apiErr.message}. Falling back to https://ce.judge0.com`);
        activeApiUrl = 'https://ce.judge0.com';
        activeHeaders = { 'Content-Type': 'application/json' };
        batchPostRes = await axios.post(
          `${activeApiUrl}/submissions/batch?base64_encoded=true`,
          { submissions: submissionsPayload },
          { headers: activeHeaders, timeout: 15000 }
        );
      } else {
        throw apiErr;
      }
    }

    // 4. Poll Judge0 batch tokens until execution completes
    const tokens = (batchPostRes.data || []).map(item => item.token).filter(Boolean).join(',');
    let executedSubmissions = [];

    if (tokens) {
      for (let pollAttempt = 0; pollAttempt < 15; pollAttempt++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollRes = await axios.get(
          `${activeApiUrl}/submissions/batch?tokens=${tokens}&base64_encoded=true`,
          { headers: activeHeaders, timeout: 10000 }
        );
        executedSubmissions = pollRes.data.submissions || pollRes.data || [];
        const allFinished = executedSubmissions.every(s => s.status && s.status.id > 2);
        if (allFinished) break;
      }
    }

    for (let i = 0; i < testCases.length; i++) {
      const execResult = executedSubmissions[i] || {};
      const testCase = testCases[i];

      const runtime = execResult.time ? parseFloat(execResult.time) * 1000 : 0; // seconds to ms
      const memory = execResult.memory || 0; // in KB
      const stdout = decodeBase64(execResult.stdout);
      const stderr = decodeBase64(execResult.stderr || execResult.compile_output);

      // Judge0 Status ID maps:
      // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compilation Error, 7-12 = Runtime Errors
      const statusId = execResult.status ? execResult.status.id : 4;

      let testCaseStatus = 'wrong_answer';
      let passed = false;

      if (statusId === 3) {
        testCaseStatus = 'accepted';
        passed = true;
        passedCount++;
      } else if (statusId === 4) {
        testCaseStatus = 'wrong_answer';
      } else if (statusId === 5) {
        testCaseStatus = 'time_limit_exceeded';
      } else if (statusId === 6) {
        testCaseStatus = 'compile_error';
      } else {
        testCaseStatus = 'runtime_error';
      }

      results.push({
        passed,
        runtime,
        memory,
        status: testCaseStatus,
        stdout: testCase.isHidden ? 'Hidden testcase output' : stdout,
        stderr: testCase.isHidden ? 'Hidden testcase output' : stderr
      });
    }

    // 5. Evaluate overall submission grade
    const overallStatus = evaluateSubmissionStatus(results);
    const weight = question.scoreWeight || 10;
    const finalScore = testCases.length > 0
      ? Number(((passedCount / testCases.length) * weight).toFixed(2))
      : 0;

    submission.status = overallStatus;
    submission.testCaseResults = results;
    submission.score = finalScore;
    await submission.save();

    console.log(`[Worker] Submission ${submissionId} graded successfully: ${overallStatus}`);

  } catch (error) {
    // 6. Handle hosted service unavailability
    console.error(`[Worker] Error running code execution for submission ${submissionId}:`, error.message);

    // Check if it's a network availability issue
    if (!error.response || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      submission.status = 'Execution Service Unavailable';
    } else {
      submission.status = 'runtime_error'; // API returned bad request or JSON parse error
    }

    await submission.save();
  }
};

// Initialize BullMQ Worker
const mongoUri = process.env.MONGO_URI;
let worker;

const startWorker = async () => {
  // Ensure DB connection is open in background process
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log('[Worker] Connected to MongoDB');
  }

  worker = new Worker('submission-queue', processSubmissionJob, {
    connection: redisConnection,
    concurrency: 4, // Process up to 4 submissions in parallel
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job failed: ${job.id}. Error: ${err.message}`);
  });

  console.log('[Worker] Submission background worker started successfully');
};

module.exports = {
  startWorker,
};
