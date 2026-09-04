import React from 'react';
import { Clock, Code2, AlertTriangle, ShieldCheck, ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssessmentLanding({ assessment, onStart }) {
  const duration = assessment?.duration || assessment?.timeLimit || 60;
  const questionsCount = assessment?.questions?.length || 0;
  const languages = assessment?.allowedLanguages || ['JavaScript', 'Python', 'C++', 'Java'];

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
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse"></span>
          <span className="text-xs font-bold text-[#2E2D4D] uppercase tracking-wider">Candidate Environment Ready</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl w-full bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 md:p-10 neo-card"
        >
          {/* Header */}
          <div className="space-y-2 mb-6">
            <span className="inline-block bg-[#52B788] text-[#00100B] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              Technical Assessment
            </span>
            <h1 className="text-3xl font-black text-[#00100B] tracking-tight">{assessment?.title || 'Coding Evaluation'}</h1>
            <p className="text-xs font-medium text-[#2E2D4D] leading-relaxed">
              {assessment?.description || 'Demonstrate your problem solving, algorithm design, and code optimization skills.'}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-black/5 p-4 rounded-2xl border border-[#00100B]/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#2E2D4D] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00100B]" />
                Duration
              </span>
              <span className="text-xl font-black text-[#00100B] block mt-1">{duration} Mins</span>
            </div>

            <div className="bg-black/5 p-4 rounded-2xl border border-[#00100B]/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#2E2D4D] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#52B788]" />
                Problems
              </span>
              <span className="text-xl font-black text-[#00100B] block mt-1">{questionsCount} Challenges</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-black/5 p-4 rounded-2xl border border-[#00100B]/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#2E2D4D] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE900]" />
                Auto-Graded
              </span>
              <span className="text-xl font-black text-[#00100B] block mt-1">Judge0 Sandboxed</span>
            </div>
          </div>

          {/* Permitted Languages */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00100B] block mb-2">
              Allowed Coding Languages:
            </span>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <span
                  key={l}
                  className="px-3 py-1 bg-white border border-[#00100B] rounded-lg text-xs font-mono font-bold text-[#00100B]"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Rules & Integrity Notice */}
          <div className="mb-8 p-5 bg-[#00100B]/5 border border-[#00100B]/15 rounded-2xl space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#00100B] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#FFE900]" />
              Rules & Guidelines:
            </h3>
            <ul className="space-y-1.5 text-xs text-[#2E2D4D] list-disc list-inside font-medium leading-relaxed">
              <li>The countdown timer starts as soon as you click <strong>Begin Assessment</strong>.</li>
              <li>You can test your code against visible sample cases prior to full submission.</li>
              <li>Your solutions are automatically submitted when the timer reaches 0:00.</li>
              <li>Maintain a stable internet connection for code execution requests.</li>
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            className="w-full py-4 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] font-extrabold text-sm rounded-2xl neo-button flex items-center justify-center gap-2 transition-all"
          >
            <span>Begin Assessment</span>
            <ArrowRight className="w-4 h-4 text-[#52B788]" />
          </button>
        </motion.div>
      </div>

      <footer className="text-center py-6 text-xs text-[#2E2D4D]/60 font-medium">
        © 2026 EvalForge • Automated Code Sandboxing Platform
      </footer>
    </div>
  );
}
