import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import AssessmentTimer from './AssesmentTimer';
import { 
  Play, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Clock, 
  Terminal, 
  Sparkles, 
  Check 
} from 'lucide-react';

import { getFullUrl } from '../../services/api';

export default function AssessmentDashboard({ 
  assessment, 
  questions = [], 
  initialTime, 
  onFinalSubmit 
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime || 3600);
  const [language, setLanguage] = useState('javascript');
  
  // Track drafts for each question ID
  const [codeDrafts, setCodeDrafts] = useState({});
  // Track status per question: 'unsolved', 'attempted', 'solved'
  const [statusMap, setStatusMap] = useState({});
  // Track test results per question
  const [resultsMap, setResultsMap] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const activeQuestion = questions[activeIdx] || {
    _id: 'sample',
    title: 'Loading Challenge...',
    description: 'Please wait while question details are loaded.',
    testCases: []
  };

  const getStarterCode = (q, lang) => {
    if (q.starterCode && typeof q.starterCode === 'object') {
      return q.starterCode[lang] || q.starterCode.javascript || '';
    }
    return typeof q.starterCode === 'string' ? q.starterCode : '';
  };

  const currentCode = codeDrafts[activeQuestion._id] !== undefined
    ? codeDrafts[activeQuestion._id]
    : getStarterCode(activeQuestion, language);

  const handleEditorChange = (value) => {
    setCodeDrafts(prev => ({ ...prev, [activeQuestion._id]: value }));
    if (statusMap[activeQuestion._id] !== 'solved') {
      setStatusMap(prev => ({ ...prev, [activeQuestion._id]: 'attempted' }));
    }
  };

  const handleSelectQuestion = (idx) => {
    setActiveIdx(idx);
    setIsRunning(false);
    const nextQId = questions[idx]?._id;
    setTestResults(resultsMap[nextQId] || null);
  };

  // Triggers when time runs out
  const handleTimeout = () => {
    alert("Time is up! Submitting your assessment automatically.");
    onFinalSubmit(codeDrafts);
  };

  // Run against sample cases or submit to backend
  const handleRunCode = async (isSubmit = false) => {
    setIsRunning(true);
    setTestResults(null);

    try {
      const response = await fetch(getFullUrl('/api/submissions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          assessmentId: assessment._id,
          questionId: activeQuestion._id,
          language,
          code: currentCode,
          isSubmit,
        })
      });

      const data = await response.json();
      
      if (response.status === 202 && data.submissionId) {
        pollSubmissionStatus(data.submissionId, activeQuestion._id);
      } else if (response.ok && data._id) {
        setTestResults(data);
        setResultsMap(prev => ({ ...prev, [activeQuestion._id]: data }));
        setIsRunning(false);
      } else {
        const errResult = { status: 'error', stderr: data.message || 'Execution error' };
        setTestResults(errResult);
        setResultsMap(prev => ({ ...prev, [activeQuestion._id]: errResult }));
        setIsRunning(false);
      }
    } catch (err) {
      console.error(err);
      const errResult = { status: 'error', stderr: 'Network or execution service error' };
      setTestResults(errResult);
      setResultsMap(prev => ({ ...prev, [activeQuestion._id]: errResult }));
      setIsRunning(false);
    }
  };

  const pollSubmissionStatus = async (subId, questionId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 30) { // 45 seconds timeout
        clearInterval(interval);
        const timeoutResult = { status: 'timeout', stderr: 'Execution took too long. Please try again.' };
        setTestResults(timeoutResult);
        setResultsMap(prev => ({ ...prev, [questionId]: timeoutResult }));
        setIsRunning(false);
        return;
      }

      try {
        const response = await fetch(getFullUrl(`/api/submissions/${subId}`), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.status !== 'pending' && data.status !== 'running') {
          clearInterval(interval);
          setTestResults(data);
          setResultsMap(prev => ({ ...prev, [questionId]: data }));
          setIsRunning(false);
          
          if (data.status === 'accepted') {
            setStatusMap(prev => ({ ...prev, [questionId]: 'solved' }));
          }
        }
      } catch (err) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FCFFF7] text-[#00100B] overflow-hidden selection:bg-[#FFE900]">
      {/* Top Header */}
      <header className="h-16 border-b-2 border-[#00100B] bg-[#FCFFF7] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00100B] flex items-center justify-center text-[#52B788]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-sm text-[#00100B] tracking-tight">{assessment?.title}</h2>
            <span className="text-[10px] uppercase font-bold text-[#2E2D4D]">Candidate Assessment Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AssessmentTimer timeLeft={timeLeft} setTimeLeft={setTimeLeft} onTimeout={handleTimeout} />
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to finish and submit your entire assessment?")) {
                onFinalSubmit(codeDrafts);
              }
            }}
            className="px-5 py-2 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] font-extrabold rounded-xl text-xs neo-button transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Finish Test</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Questions Drawer & Active Problem Details */}
        <div className="w-5/12 flex flex-col border-r-2 border-[#00100B] bg-[#FCFFF7] overflow-hidden">
          {/* Question Tabs Bar */}
          <div className="p-3 border-b-2 border-[#00100B] bg-black/5 flex items-center gap-2 overflow-x-auto">
            {questions.map((q, idx) => {
              const status = statusMap[q._id] || 'unsolved';
              const isActive = idx === activeIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#00100B] text-[#FCFFF7] border-[#00100B]'
                      : 'bg-white text-[#2E2D4D] border-[#00100B]/20 hover:border-[#00100B]'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {status === 'solved' ? (
                    <Check className="w-3 h-3 text-[#52B788]" />
                  ) : (
                    <span className="text-[9px] font-mono opacity-80">{q.scoreWeight || 10}p</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Problem Details Scrollable Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`pill-badge text-[9px] ${
                  activeQuestion.difficulty === 'easy' ? 'bg-[#52B788] text-[#00100B]' :
                  activeQuestion.difficulty === 'medium' ? 'bg-[#FFE900] text-[#00100B]' : 'bg-[#2E2D4D] text-[#FCFFF7]'
                }`}>
                  {activeQuestion.difficulty || 'medium'}
                </span>
                <span className="text-xs font-mono font-bold text-[#2E2D4D]">
                  {activeQuestion.scoreWeight || 10} Points
                </span>
              </div>
              <h1 className="text-xl font-black text-[#00100B]">{activeQuestion.title}</h1>
            </div>

            <div className="prose prose-sm text-[#2E2D4D] font-medium leading-relaxed">
              <p className="whitespace-pre-wrap">{activeQuestion.description}</p>
            </div>

            {activeQuestion.constraints && (
              <div className="p-4 rounded-2xl bg-black/5 border border-[#00100B]/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00100B] block mb-1">
                  Constraints & Edge Cases
                </span>
                <p className="text-xs font-mono text-[#2E2D4D]">{activeQuestion.constraints}</p>
              </div>
            )}

            {/* Public Sample Test Cases */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00100B] block">
                Sample Test Cases
              </span>
              {activeQuestion.testCases?.filter(tc => !tc.isHidden).map((tc, idx) => (
                <div key={idx} className="bg-white border-2 border-[#00100B] rounded-2xl p-4 font-mono text-xs space-y-2 neo-card">
                  <div>
                    <span className="text-[10px] text-[#2E2D4D] font-bold uppercase block font-sans">Input:</span>
                    <pre className="text-[#00100B] bg-black/5 p-2 rounded-lg mt-1 overflow-x-auto">{tc.input}</pre>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#2E2D4D] font-bold uppercase block font-sans">Expected Output:</span>
                    <pre className="text-[#52B788] bg-[#00100B] p-2 rounded-lg mt-1 overflow-x-auto font-bold">{tc.expectedOutput}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Monaco Editor & Output Console */}
        <div className="w-7/12 flex flex-col bg-[#FCFFF7] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-12 border-b-2 border-[#00100B] px-4 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#00100B]">Language:</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#FCFFF7] border border-[#00100B] rounded-lg px-2.5 py-1 text-xs font-bold text-[#00100B] outline-hidden cursor-pointer"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="java">Java</option>
                <option value="cpp">C++ (GCC)</option>
              </select>
            </div>

            <span className="text-[11px] font-mono text-[#2E2D4D]">Auto-save enabled</span>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-0 relative border-b-2 border-[#00100B]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
              theme="vs-dark"
              value={currentCode}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Test Runner & Console */}
          <div className="p-4 bg-[#FCFFF7] space-y-3 shrink-0 flex flex-col justify-end">
            {/* Output Display */}
            {testResults && (
              <div className={`p-3 rounded-xl border-2 text-xs font-mono max-h-36 overflow-y-auto ${
                testResults.status === 'accepted' 
                  ? 'bg-green-50 border-[#52B788] text-green-900' 
                  : 'bg-red-50 border-red-500 text-red-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 uppercase">
                    {testResults.status === 'accepted' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    Outcome: {testResults.status}
                  </span>
                  {testResults.score !== undefined && (
                    <span>Score Awarded: {testResults.score} pts</span>
                  )}
                </div>
                {testResults.stderr && (
                  <pre className="mt-2 text-red-700 text-[11px] p-2 bg-white rounded-lg border border-red-200 overflow-x-auto whitespace-pre-wrap">
                    {testResults.stderr}
                  </pre>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[11px] font-medium text-[#2E2D4D]">
                Run sample test cases or submit code for full validation
              </span>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  disabled={isRunning}
                  onClick={() => handleRunCode(false)}
                  className="px-4 py-2 bg-white border-2 border-[#00100B] hover:bg-black/5 rounded-xl text-xs text-[#00100B] font-bold disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isRunning ? 'Running Sandbox...' : 'Run Code'}</span>
                </button>

                <button
                  disabled={isRunning}
                  onClick={() => handleRunCode(true)}
                  className="px-5 py-2 bg-[#00100B] hover:bg-[#2E2D4D] rounded-xl text-xs text-[#FCFFF7] font-extrabold neo-button disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
