import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  X, 
  User, 
  Clock, 
  Code2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Terminal, 
  Cpu 
} from 'lucide-react';

export default function CandidateDetailModel({ assessmentId, candidateId, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(0);

  useEffect(() => {
    if (assessmentId && candidateId && isOpen) {
      fetchDetail();
    }
  }, [assessmentId, candidateId, isOpen]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/analytics/assessment/${assessmentId}/candidate/${candidateId}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !candidateId || !assessmentId) return null;

  const candidate = data?.candidate;
  const attempt = data?.attempt;
  const submissions = data?.submissions || [];
  const currentSub = submissions[activeSubIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs">
      <div className="w-full max-w-2xl h-full bg-[#FCFFF7] border-l-2 border-[#00100B] p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#00100B]/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00100B] text-[#52B788] flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#00100B]">{candidate?.name || 'Candidate Review'}</h2>
                <p className="text-xs text-[#2E2D4D] font-medium">{candidate?.email}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#2E2D4D] hover:bg-black/5 rounded-xl hover:text-[#00100B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#00100B] border-t-[#52B788] rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-[#2E2D4D]">Loading Submissions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Attempt Metric Chips */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/5 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E2D4D] block">Status</span>
                  <span className={`text-xs font-black capitalize ${
                    attempt?.status === 'submitted' ? 'text-[#52B788]' : 'text-[#2E2D4D]'
                  }`}>
                    {attempt?.status || 'started'}
                  </span>
                </div>
                <div className="bg-black/5 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E2D4D] block">Score</span>
                  <span className="text-xs font-black text-[#00100B]">
                    {attempt?.totalScore || 0} pts
                  </span>
                </div>
                <div className="bg-black/5 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E2D4D] block">Time Spent</span>
                  <span className="text-xs font-black text-[#00100B]">
                    {attempt?.submittedAt && attempt?.startedAt
                      ? `${Math.max(1, Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000))} mins`
                      : 'In Progress'}
                  </span>
                </div>
              </div>

              {/* Submission Selector Tabs */}
              {submissions.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-[#00100B]/20 rounded-2xl">
                  <p className="text-xs font-bold text-[#2E2D4D]">No code runs or submissions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {submissions.map((sub, idx) => (
                      <button
                        key={sub._id || idx}
                        onClick={() => setActiveSubIndex(idx)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          activeSubIndex === idx
                            ? 'bg-[#00100B] text-[#FCFFF7]'
                            : 'bg-black/5 text-[#2E2D4D] hover:bg-black/10'
                        }`}
                      >
                        {sub.questionId?.title || `Question #${idx + 1}`}
                      </button>
                    ))}
                  </div>

                  {currentSub && (
                    <div className="space-y-4">
                      {/* Sub Header */}
                      <div className="flex items-center justify-between p-3 bg-white border border-[#00100B]/10 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-[#52B788] text-[#00100B] px-2 py-0.5 rounded-md uppercase">
                            {currentSub.language}
                          </span>
                          <span className="text-xs font-bold text-[#00100B]">
                            Score: {currentSub.score || 0} pts
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold capitalize ${
                          currentSub.status === 'accepted' ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {currentSub.status}
                        </span>
                      </div>

                      {/* Code Box */}
                      <div className="bg-[#00100B] text-[#FCFFF7] rounded-2xl p-4 font-mono text-xs overflow-x-auto border-2 border-[#00100B]">
                        <pre className="whitespace-pre-wrap">{currentSub.code}</pre>
                      </div>

                      {/* Test Case Execution Output */}
                      {currentSub.testCaseResults && currentSub.testCaseResults.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#00100B] block">
                            Executed Test Results
                          </span>
                          <div className="space-y-2">
                            {currentSub.testCaseResults.map((tc, tcIdx) => (
                              <div
                                key={tcIdx}
                                className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                                  tc.passed
                                    ? 'bg-green-50/50 border-green-200 text-green-900'
                                    : 'bg-red-50/50 border-red-200 text-red-900'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {tc.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  <span>Test #{tcIdx + 1}: {tc.status}</span>
                                </div>
                                <span className="text-[10px] text-neutral-500 font-sans">
                                  {tc.runtime ? `${tc.runtime}ms` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#00100B]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#00100B] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
}
