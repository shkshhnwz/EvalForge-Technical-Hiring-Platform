import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import AssessmentTimer from './AssessmentTimer';

export default function AssessmentDashboard({ 
  assessment, 
  questions, 
  initialTime, 
  onFinalSubmit 
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [language, setLanguage] = useState('javascript');
  
  // Track drafts for each question ID
  const [codeDrafts, setCodeDrafts] = useState({});
  // Track status per question: 'unsolved', 'attempted', 'solved'
  const [statusMap, setStatusMap] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const activeQuestion = questions[activeIdx];
  const currentCode = codeDrafts[activeQuestion._id] || activeQuestion.starterCode || '';

  const handleEditorChange = (value) => {
    setCodeDrafts(prev => ({ ...prev, [activeQuestion._id]: value }));
    if (statusMap[activeQuestion._id] !== 'solved') {
      setStatusMap(prev => ({ ...prev, [activeQuestion._id]: 'attempted' }));
    }
  };

  // Triggers when time runs out
  const handleTimeout = () => {
    alert("Time is up! Submitting your work automatically.");
    onFinalSubmit(codeDrafts);
  };

  // Run against sample cases locally or submit to backend
  const handleRunCode = async (isSubmit = false) => {
    setIsRunning(true);
    setTestResults(null);

    try {
      // POST request to the API we completed earlier: /api/submissions
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // authentication
        },
        body: JSON.stringify({
          assessmentId: assessment._id,
          questionId: activeQuestion._id,
          language,
          code: currentCode,
          isSubmit, // flag if running visible vs full suite
        })
      });

      const data = await response.json();
      
      if (response.status === 202) {
        // Poll for submission status using getSubmissionStatus endpoint
        pollSubmissionStatus(data.submissionId);
      }
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  const pollSubmissionStatus = async (subId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/submissions/${subId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.status !== 'pending' && data.status !== 'running') {
          clearInterval(interval);
          setTestResults(data);
          setIsRunning(false);
          
          if (data.status === 'accepted') {
            setStatusMap(prev => ({ ...prev, [activeQuestion._id]: 'solved' }));
          }
        }
      } catch (err) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <h2 className="font-bold text-lg text-white">{assessment.title}</h2>
        <div className="flex items-center gap-4">
          <AssessmentTimer timeLeft={timeLeft} setTimeLeft={setTimeLeft} onTimeout={handleTimeout} />
          <button 
            onClick={() => onFinalSubmit(codeDrafts)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm"
          >
            Finish Test
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer / Nav */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-800 font-semibold text-sm text-slate-400">
            QUESTIONS
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {questions.map((q, idx) => {
              const status = statusMap[q._id] || 'unsolved';
              const isActive = idx === activeIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                    isActive ? 'bg-sky-505/10 border border-sky-500/30 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate text-sm font-medium">{idx + 1}. {q.title}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                    status === 'solved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    status === 'attempted' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {status}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 flex overflow-hidden">
          {/* Question details Panel */}
          <section className="flex-1 border-r border-slate-800 p-6 overflow-y-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">{activeQuestion.title}</h1>
            <div className="prose prose-invert text-slate-300">
              <p>{activeQuestion.description}</p>
            </div>
            
            {/* Sample Cases */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-slate-200">Sample Test Cases</h3>
              {activeQuestion.testCases?.filter(tc => !tc.isHidden).map((tc, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm space-y-2">
                  <div>
                    <span className="text-slate-500 block text-xs">Input:</span>
                    <pre className="text-slate-300 mt-1">{tc.input}</pre>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Expected Output:</span>
                    <pre className="text-emerald-400 mt-1">{tc.expectedOutput}</pre>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Monaco Editor Pane */}
          <section className="flex-1 flex flex-col bg-slate-900">
            {/* Editor Top Bar */}
            <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sm font-semibold text-slate-300"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={currentCode}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                }}
              />
            </div>

            {/* Editor Action Console */}
            <div className="border-t border-slate-800 p-4 bg-slate-950/60 space-y-4">
              {/* Test results display */}
              {testResults && (
                <div className={`p-4 rounded-lg border text-sm font-mono ${
                  testResults.status === 'accepted' 
                    ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' 
                    : 'bg-rose-950/20 border-rose-900/50 text-rose-400'
                }`}>
                  <span className="font-bold">Status: {testResults.status.toUpperCase()}</span>
                  {testResults.stderr && <pre className="mt-2 text-rose-300 text-xs">{testResults.stderr}</pre>}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  disabled={isRunning}
                  onClick={() => handleRunCode(false)}
                  className="px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-lg text-sm text-slate-300 font-medium disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  disabled={isRunning}
                  onClick={() => handleRunCode(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                >
                  Submit Code
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
