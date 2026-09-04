import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RecruiterLayout from '../../components/layouts/RecruiterLayout';
import CandidateDetailModel from './CandidateDetailModel';
import api from '../../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  Trophy, 
  Users, 
  CheckCircle2, 
  Flame, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';

export default function RecruiterAnalyticsDashboard() {
  const { assessmentId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Candidate Inspection Drawer
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      fetchAnalytics();
    }
  }, [assessmentId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/analytics/assessment/${assessmentId}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch assessment analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await api.download(`/api/analytics/assessment/${assessmentId}/export-csv`, `assessment_${assessmentId}_leaderboard.csv`);
    } catch (err) {
      alert('Failed to export CSV results');
    } finally {
      setExporting(false);
    }
  };

  const overview = data?.overview;
  const scoreDistribution = data?.charts?.scoreDistribution || [];
  const questionAnalytics = data?.questionAnalytics || [];
  const leaderboard = data?.leaderboard || [];

  return (
    <RecruiterLayout
      title="Performance & Hiring Analytics"
      subtitle="Examine score distribution, question benchmarks, and candidate leaderboards"
      actions={
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2E2D4D] hover:text-[#00100B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Assessments</span>
          </Link>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#52B788]" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={fetchAnalytics} className="underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#00100B] border-t-[#52B788] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#2E2D4D] uppercase tracking-wider">Aggregating Candidate Metrics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Candidates */}
            <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl p-5 neo-card">
              <div className="flex items-center justify-between text-[#2E2D4D]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Candidates</span>
                <Users className="w-4 h-4 text-[#00100B]" />
              </div>
              <p className="text-3xl font-black text-[#00100B] mt-2">{overview?.totalCandidates || 0}</p>
              <span className="text-[11px] font-medium text-[#2E2D4D] block mt-1">
                {overview?.completedCount || 0} completed submissions
              </span>
            </div>

            {/* Card 2: Pass Rate */}
            <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl p-5 neo-card">
              <div className="flex items-center justify-between text-[#2E2D4D]">
                <span className="text-xs font-bold uppercase tracking-wider">Passing Rate</span>
                <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
              </div>
              <p className="text-3xl font-black text-[#00100B] mt-2">{overview?.passRate || 0}%</p>
              <span className="text-[11px] font-medium text-[#52B788] font-bold block mt-1">
                Above 60% benchmark
              </span>
            </div>

            {/* Card 3: Avg Score */}
            <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl p-5 neo-card">
              <div className="flex items-center justify-between text-[#2E2D4D]">
                <span className="text-xs font-bold uppercase tracking-wider">Average Grade</span>
                <Trophy className="w-4 h-4 text-[#FFE900]" />
              </div>
              <p className="text-3xl font-black text-[#00100B] mt-2">{overview?.avgPercentage || 0}%</p>
              <span className="text-[11px] font-medium text-[#2E2D4D] block mt-1">
                {overview?.avgScore || 0} avg points scored
              </span>
            </div>

            {/* Card 4: Avg Duration & Hardest Question */}
            <div className="bg-[#00100B] text-[#FCFFF7] rounded-2xl p-5 neo-card">
              <div className="flex items-center justify-between text-[#FFE900]">
                <span className="text-xs font-bold uppercase tracking-wider">Hardest Challenge</span>
                <Flame className="w-4 h-4 text-[#FFE900]" />
              </div>
              <p className="text-base font-black text-[#FCFFF7] mt-2 truncate">
                {overview?.hardestQuestion?.title || 'Balanced tests'}
              </p>
              <span className="text-[11px] font-medium text-neutral-400 block mt-1">
                Avg completion: {overview?.avgTimeMinutes || 0} mins
              </span>
            </div>
          </div>

          {/* Charts & Funnel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Score Distribution Chart */}
            <div className="lg:col-span-8 bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-6 md:p-8 neo-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#52B788] block">Histogram</span>
                  <h3 className="text-lg font-black text-[#00100B]">Candidate Score Distribution</h3>
                </div>
                <span className="text-xs font-semibold bg-black/5 px-3 py-1 rounded-full text-[#2E2D4D]">
                  5 Score Buckets
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00100B15" />
                    <XAxis dataKey="range" tick={{ fill: '#2E2D4D', fontSize: 12, fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#2E2D4D', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#00100B', 
                        borderRadius: '12px', 
                        color: '#FCFFF7', 
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="count" fill="#52B788" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Candidate Funnel */}
            <div className="lg:col-span-4 bg-[#00100B] text-[#FCFFF7] rounded-3xl p-6 md:p-8 neo-card flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#FFE900] block mb-1">
                  Candidate Flow
                </span>
                <h3 className="text-lg font-black text-[#FCFFF7] mb-6">Completion Funnel</h3>

                <div className="space-y-4">
                  {/* Step 1: Invited */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-neutral-300">1. Total Attempts Started</span>
                      <span className="text-white">{overview?.totalCandidates || 0}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-[#FFE900] h-full rounded-full w-full"></div>
                    </div>
                  </div>

                  {/* Step 2: Submitted */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-neutral-300">2. Finished & Submitted</span>
                      <span className="text-white">{overview?.completedCount || 0}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-[#52B788] h-full rounded-full transition-all"
                        style={{
                          width: `${overview?.totalCandidates ? (overview.completedCount / overview.totalCandidates) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Step 3: Passed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-neutral-300">3. Met Passing Grade</span>
                      <span className="text-[#52B788]">
                        {leaderboard.filter(c => c.status === 'submitted' && c.passed).length}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full transition-all"
                        style={{
                          width: `${overview?.totalCandidates ? (leaderboard.filter(c => c.status === 'submitted' && c.passed).length / overview.totalCandidates) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/15 text-xs text-neutral-400">
                Auto-computed in real-time from candidate Judge0 execution submissions.
              </div>
            </div>
          </div>

          {/* Per-Question Analytics Breakdown */}
          {questionAnalytics.length > 0 && (
            <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-6 md:p-8 neo-card">
              <h3 className="text-lg font-black text-[#00100B] mb-4">Per-Question Difficulty & Pass Rates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium text-[#2E2D4D]">
                  <thead className="text-[11px] uppercase tracking-wider text-[#00100B] border-b-2 border-[#00100B]">
                    <tr>
                      <th className="py-3 px-4">Challenge</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Max Points</th>
                      <th className="py-3 px-4">Avg Score</th>
                      <th className="py-3 px-4">Pass Rate</th>
                      <th className="py-3 px-4">Total Submissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00100B]/10 font-mono">
                    {questionAnalytics.map((q) => (
                      <tr key={q.questionId} className="hover:bg-black/5 transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-[#00100B]">{q.title}</td>
                        <td className="py-3 px-4">
                          <span className={`pill-badge text-[9px] ${
                            q.difficulty === 'easy' ? 'bg-[#52B788] text-[#00100B]' :
                            q.difficulty === 'medium' ? 'bg-[#FFE900] text-[#00100B]' : 'bg-[#2E2D4D] text-[#FCFFF7]'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">{q.maxScore} pts</td>
                        <td className="py-3 px-4">{q.averageScore} pts</td>
                        <td className="py-3 px-4 font-bold text-[#52B788]">{q.passRate}%</td>
                        <td className="py-3 px-4">{q.totalAttemptsCount} runs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Candidate Leaderboard Table */}
          <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-6 md:p-8 neo-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#52B788] block">Rankings</span>
                <h3 className="text-xl font-black text-[#00100B]">Candidate Leaderboard</h3>
              </div>
              <span className="text-xs font-bold text-[#2E2D4D]">{leaderboard.length} candidates evaluated</span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[#00100B]/20 rounded-2xl">
                <p className="text-xs font-bold text-[#2E2D4D]">No candidate submissions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium text-[#2E2D4D]">
                  <thead className="text-[11px] uppercase tracking-wider text-[#00100B] border-b-2 border-[#00100B]">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Time Taken</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Inspect Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00100B]/10">
                    {leaderboard.map((c) => (
                      <tr key={c.attemptId} className="hover:bg-black/5 transition-colors">
                        <td className="py-3.5 px-4 font-black text-sm text-[#00100B]">#{c.rank}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#00100B]">{c.name}</p>
                          <p className="text-[11px] text-[#2E2D4D]/70">{c.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#00100B]">
                          {c.totalScore} / {c.maxScore}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md font-mono font-bold text-[11px] ${
                            c.passed ? 'bg-[#52B788]/20 text-[#00100B]' : 'bg-black/5 text-[#2E2D4D]'
                          }`}>
                            {c.percentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {c.timeTakenMinutes ? `${c.timeTakenMinutes} mins` : 'In Progress'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`pill-badge text-[9px] ${
                            c.status === 'submitted' ? 'bg-[#52B788] text-[#00100B]' : 'bg-[#FFE900] text-[#00100B]'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedCandidateId(c.candidateId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-[11px] font-bold rounded-lg transition-colors"
                          >
                            <span>Review</span>
                            <ExternalLink className="w-3 h-3 text-[#FFE900]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Deep-Dive Drawer */}
      <CandidateDetailModel
        assessmentId={assessmentId}
        candidateId={selectedCandidateId}
        isOpen={!!selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
      />
    </RecruiterLayout>
  );
}
