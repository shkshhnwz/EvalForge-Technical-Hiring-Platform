// src/modules/CodeExecution/judge0.config.js
module.exports = {
  // Mapping frontend language strings to Judge0 language IDs
  languageMap: {
    'javascript': 63,
    'node': 63,
    'python': 71,
    'python3': 71,
    'java': 62,
    'cpp': 54,
    'cplusplus': 54,
  },
  // Default execution configurations
  defaultLimits: {
    cpuTimeLimit: 2.0,     // 2 seconds
    memoryLimit: 512000,   // 512,000 KB (~500MB)
  }
};
