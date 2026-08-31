import React from 'react';

export default function AssessmentResult({ resultData, onGoHome }) {
  if (!resultData) return null;

  const { resultsHidden, summary, questionBreakdown, feedbackMessage } = resultData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-3xl mb-2">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold text-white">Assessment Completed!</h1>
          <p className="text-slate-400 text-sm">
            Thank you for taking the time to complete this assessment.
          </p>
        </div>

        {/* Case 1: Recruiter has HIDDEN results */}
        {resultsHidden ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 text-center space-y-3">
            <div className="text-sky-400 font-semibold text-lg">Results Pending Review</div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
              {feedbackMessage || "Your submission has been securely recorded. The recruiter will release the grading report after the assessment window ends."}
            </p>
          </div>
        ) : (
          /* Case 2: IMMEDIATE Feedback Enabled */
          <div className="space-y-6">
            {/* Score Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Score</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {summary.totalScore} <span className="text-sm font-normal text-slate-500">/ {summary.maxPossibleScore}</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Percentage</span>
                <div className="text-2xl font-black text-sky-400 mt-1">
                  {summary.percentage}%
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Time Spent</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {summary.timeTakenMinutes} min
                </div>
              </div>
            </div>

            {/* Per-Question Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-300 text-sm tracking-wider uppercase">Question Breakdown & Partial Credit</h3>
              <div className="space-y-2">
                {questionBreakdown?.map((q, idx) => (
                  <div 
                    key={q.questionId || idx}
                    className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {idx + 1}. {q.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex gap-3">
                        <span>Test Cases Passed: <strong className="text-slate-200">{q.passedTestCases}/{q.totalTestCases}</strong></span>
                        <span>•</span>
                        <span className="capitalize text-slate-400">Difficulty: {q.difficulty}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {q.scoreObtained} / {q.maxScore} pts
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        q.scoreObtained === q.maxScore ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        q.scoreObtained > 0 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {q.scoreObtained === q.maxScore ? '100% Passed' : q.scoreObtained > 0 ? 'Partial Credit' : '0 Passed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Home / Exit Button */}
        <button
          onClick={onGoHome}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
        >
          Exit Assessment
        </button>
      </div>
    </div>
  );
}
