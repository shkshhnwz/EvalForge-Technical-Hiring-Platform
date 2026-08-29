import React from 'react';

export default function AssessmentLanding({ assessment, onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-white mb-2">{assessment.title}</h1>
        <p className="text-slate-400 mb-6">{assessment.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Time Limit</span>
            <span className="text-xl font-bold text-sky-400">{assessment.duration} Minutes</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Total Questions</span>
            <span className="text-xl font-bold text-emerald-400">{assessment.questions?.length} Questions</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-md font-semibold text-slate-300 mb-3">Rules & Guidelines:</h3>
          <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Do not close or refresh the tab once the test starts.</li>
            <li>Make sure you submit your code for each question before timing out.</li>
            <li>Your test will be automatically submitted when the countdown reaches 0:00.</li>
            <li>Plagiarism or switching tabs might trigger a flag on your attempt.</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-sky-500 hover:bg-sky-400 transition-colors text-slate-950 font-bold rounded-lg shadow-lg hover:shadow-sky-500/20"
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
}
