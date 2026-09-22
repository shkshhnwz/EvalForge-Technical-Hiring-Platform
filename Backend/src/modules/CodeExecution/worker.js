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
 * Safely get starter code string from question map or object
 */
const getStarterCodeString = (starterCodeMap, language) => {
  if (!starterCodeMap) return '';
  const langKey = (language || '').toLowerCase();
  if (typeof starterCodeMap.get === 'function') {
    return starterCodeMap.get(langKey) || starterCodeMap.get(language) || '';
  }
  return starterCodeMap[langKey] || starterCodeMap[language] || '';
};

/**
 * Dynamically extract function name from starterCode or candidate code
 */
const extractFunctionName = (code, starterCode, language) => {
  const lang = (language || '').toLowerCase();
  const sources = [starterCode, code];

  if (lang === 'javascript' || lang === 'node') {
    for (const src of sources) {
      if (!src) continue;
      const funcMatch = src.match(/(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (funcMatch && funcMatch[1]) return funcMatch[1];
      const varMatch = src.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[a-zA-Z_$][a-zA-Z0-9_$]*\s*=>)/);
      if (varMatch && varMatch[1]) return varMatch[1];
    }
  } else if (lang === 'python' || lang === 'python3') {
    for (const src of sources) {
      if (!src) continue;
      const match = src.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (match && match[1]) return match[1];
    }
  }
  return 'solution';
};

/**
 * Normalize output values (JSON, whitespace, newlines) for deterministic comparison
 */
const normalizeOutput = (val) => {
  if (val === undefined || val === null) return '';
  const trimmed = String(val).trim();
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed);
  } catch {
    return trimmed.replace(/\r\n/g, '\n').trim();
  }
};

/**
 * Automatically wrap candidate code with stdin parser, dynamic function invocation, and output serialization
 */
const wrapCodeForExecution = (code, language, starterCode = '') => {
  const lang = (language || '').toLowerCase();
  if (lang === 'javascript' || lang === 'node') {
    if (!code.includes('readFileSync') && !code.includes('process.stdin') && !code.includes('readline')) {
      const fnName = extractFunctionName(code, starterCode, 'javascript');
      return `${code}
const fs = require('fs');
try {
  const raw = fs.readFileSync(0, 'utf-8');
  function parseInputToArgs(text) {
    if (!text || text.trim() === '') return [];
    const trimmed = text.trim();
    const lines = trimmed.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
    const parseVal = (str) => {
      try { return JSON.parse(str); } catch {
        if (!isNaN(str) && str !== '') return Number(str);
        if (str === 'true') return true;
        if (str === 'false') return false;
        if (str === 'null') return null;
        return str;
      }
    };
    if (lines.length > 1) {
      return lines.map(parseVal);
    }
    return [parseVal(trimmed)];
  }
  const args = parseInputToArgs(raw);
  const targetFn = (typeof ${fnName} === 'function') ? ${fnName} : (typeof solution === 'function' ? solution : null);
  if (!targetFn) {
    throw new Error('Function ${fnName} or solution not found');
  }
  const res = targetFn(...args);
  if (res !== undefined) {
    console.log(typeof res === 'object' && res !== null ? JSON.stringify(res) : res);
  }
} catch (e) {
  console.error(e);
}
`;
    }
  } else if (lang === 'python' || lang === 'python3') {
    if (!code.includes('sys.stdin') && !code.includes('input(')) {
      const fnName = extractFunctionName(code, starterCode, 'python');
      return `${code}
import sys, json

def parse_input_to_args(text):
    if not text or not text.strip():
        return []
    trimmed = text.strip()
    lines = [l.strip() for l in trimmed.splitlines() if l.strip()]
    def parse_val(s):
        try:
            return json.loads(s)
        except:
            if s == 'true': return True
            if s == 'false': return False
            if s == 'null': return None
            try:
                if '.' in s: return float(s)
                return int(s)
            except:
                return s
    if len(lines) > 1:
        return [parse_val(l) for l in lines]
    return [parse_val(trimmed)]

try:
    raw = sys.stdin.read()
    args = parse_input_to_args(raw)
    target_fn = globals().get('${fnName}') or globals().get('solution')
    if not target_fn:
        raise Exception("Function '${fnName}' or 'solution' not found")
    res = target_fn(*args)
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
    const starterCodeStr = getStarterCodeString(question.starterCode, submission.language);
    const finalSourceCode = wrapCodeForExecution(submission.code, submission.language, starterCodeStr);

    console.log(`[Worker Debug] Submission ID: ${submissionId}, Language: ${submission.language}`);
    console.log(`[Worker Debug] Detected starterCode exists: ${Boolean(starterCodeStr)}`);

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

      const normalizedActual = normalizeOutput(stdout);
      const normalizedExpected = normalizeOutput(testCase.expectedOutput);
      const isOutputMatch = normalizedActual === normalizedExpected && normalizedActual !== '';

      let testCaseStatus = 'wrong_answer';
      let passed = false;

      if (statusId === 3 || (statusId === 4 && isOutputMatch)) {
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

      console.log(`[Worker Debug] Test Case ${i + 1}/${testCases.length}:`);
      console.log(`  Raw Input: ${JSON.stringify(testCase.input)}`);
      console.log(`  Expected Output: ${JSON.stringify(testCase.expectedOutput)}`);
      console.log(`  Normalized Expected: ${JSON.stringify(normalizedExpected)}`);
      console.log(`  Judge0 Status: ${statusId} (${execResult.status?.description || 'Unknown'})`);
      console.log(`  Raw Stdout: ${JSON.stringify(stdout)}`);
      console.log(`  Normalized Actual: ${JSON.stringify(normalizedActual)}`);
      console.log(`  Match: ${isOutputMatch}`);
      console.log(`  Final Status: ${testCaseStatus}`);

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
  wrapCodeForExecution,
  extractFunctionName,
  normalizeOutput,
  processSubmissionJob,
};
