import React from 'react';
import { CheckCircle2, Trophy, Clock, ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssessmentResult({ resultData, onGoHome }) {
  if (!resultData) return null;

  const { resultsHidden, summary, questionBreakdown, feedbackMessage } = resultData;

  return (
    <div className="min-h-screen bg-[#FCFFF7] text-[#00100B] flex flex-col justify-between selection:bg-[#FFE900] selection:text-[#00100B]">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00100B] flex items-center justify-center text-[#52B788]">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#00100B]">EvalForge</span>
        </div>
        <span className="text-xs font-bold text-[#52B788] bg-[#52B788]/20 px-3 py-1 rounded-full uppercase tracking-wider">
          Session Completed
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 md:p-10 neo-card space-y-8"
        >
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#52B788] text-[#00100B] mb-2 neo-button">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-[#00100B] tracking-tight">Assessment Submitted!</h1>
            <p className="text-xs font-semibold text-[#2E2D4D]">
              Thank you for completing your technical evaluation on EvalForge.
            </p>
          </div>

          {/* Hidden vs Immediate Feedback */}
          {resultsHidden ? (
            <div className="bg-[#00100B] text-[#FCFFF7] rounded-2xl p-6 text-center space-y-2 neo-card">
              <div className="text-[#FFE900] font-black text-sm uppercase tracking-wider">Results Under Review</div>
              <p className="text-neutral-300 text-xs leading-relaxed max-w-md mx-auto">
                {feedbackMessage || "Your code solutions have been securely stored. The hiring team will review your submission and communicate the next steps."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/5 border border-[#00100B]/10 rounded-2xl p-4 text-center">
                  <span className="text-[10px] text-[#2E2D4D] uppercase tracking-wider font-bold block">Total Score</span>
                  <div className="text-2xl font-black text-[#00100B] mt-1 font-mono">
                    {summary?.totalScore || 0} <span className="text-xs font-normal text-[#2E2D4D]">/ {summary?.maxPossibleScore || 100}</span>
                  </div>
                </div>

                <div className="bg-black/5 border border-[#00100B]/10 rounded-2xl p-4 text-center">
                  <span className="text-[10px] text-[#2E2D4D] uppercase tracking-wider font-bold block">Percentage</span>
                  <div className="text-2xl font-black text-[#52B788] mt-1 font-mono">
                    {summary?.percentage || 0}%
                  </div>
                </div>

                <div className="bg-black/5 border border-[#00100B]/10 rounded-2xl p-4 text-center">
                  <span className="text-[10px] text-[#2E2D4D] uppercase tracking-wider font-bold block">Time Spent</span>
                  <div className="text-2xl font-black text-[#00100B] mt-1 font-mono">
                    {summary?.timeTakenMinutes || 0} min
                  </div>
                </div>
              </div>

              {/* Per-Question Breakdown */}
              {questionBreakdown && questionBreakdown.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#00100B]">
                    Question Performance Breakdown
                  </h3>
                  <div className="space-y-2">
                    {questionBreakdown.map((q, idx) => (
                      <div 
                        key={q.questionId || idx}
                        className="bg-white border border-[#00100B]/20 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-[#00100B]">
                            {idx + 1}. {q.title}
                          </p>
                          <span className="text-[10px] text-[#2E2D4D] font-mono">
                            Cases Passed: {q.passedTestCases}/{q.totalTestCases}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-[#00100B]">
                            {q.scoreObtained} / {q.maxScore} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exit CTA */}
          <button
            onClick={onGoHome}
            className="w-full py-4 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] font-extrabold text-sm rounded-2xl neo-button flex items-center justify-center gap-2 transition-all"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4 text-[#FFE900]" />
          </button>
        </motion.div>
      </div>

      <footer className="text-center py-6 text-xs text-[#2E2D4D]/60 font-medium">
        © 2026 EvalForge • Automated Code Sandboxing Platform
      </footer>
    </div>
  );
}
