import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../components/layouts/RecruiterLayout';
import CandidateInviteModal from '../../components/recruiter/CandidateInviteModal';
import api from '../../services/api';
import { 
  Plus, 
  Clock, 
  BarChart3, 
  UserPlus, 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssessmentsListPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite Modal state
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/assessments');
      setAssessments(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = (assessment) => {
    const inviteUrl = `${window.location.origin}/join/${assessment.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(assessment._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick stats
  const totalTests = assessments.length;
  const activeTests = assessments.filter(a => a.status === 'active' || a.status === 'draft').length;
  const totalQuestionsSum = assessments.reduce((acc, a) => acc + (a.questions?.length || 0), 0);

  return (
    <RecruiterLayout
      title="Assessments Overview"
      subtitle="Manage your technical evaluation tests and monitor candidate invitations"
      actions={
        <Link
          to="/assessments/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button transition-all"
        >
          <Plus className="w-4 h-4 text-[#52B788]" />
          <span>New Assessment</span>
        </Link>
      }
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl p-6 neo-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#2E2D4D]">Total Assessments</span>
            <Layers className="w-4 h-4 text-[#00100B]" />
          </div>
          <p className="text-3xl font-black text-[#00100B] mt-2">{totalTests}</p>
          <span className="text-[11px] font-medium text-[#2E2D4D] block mt-1">Configured for your org</span>
        </div>

        <div className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-2xl p-6 neo-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#2E2D4D]">Active Challenges</span>
            <Sparkles className="w-4 h-4 text-[#52B788]" />
          </div>
          <p className="text-3xl font-black text-[#00100B] mt-2">{activeTests}</p>
          <span className="text-[11px] font-medium text-[#2E2D4D] block mt-1">Ready for candidates</span>
        </div>

        <div className="bg-[#00100B] text-[#FCFFF7] rounded-2xl p-6 neo-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#FFE900]">Assigned Questions</span>
            <Code2 className="w-4 h-4 text-[#52B788]" />
          </div>
          <p className="text-3xl font-black text-[#FCFFF7] mt-2">{totalQuestionsSum}</p>
          <span className="text-[11px] font-medium text-neutral-400 block mt-1">Across all test suites</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={fetchAssessments} className="underline hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Assessments Grid / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#00100B] border-t-[#52B788] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#2E2D4D] uppercase tracking-wider">Loading Assessments...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-[#FCFFF7] border-2 border-dashed border-[#00100B] rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-[#52B788]/20 rounded-2xl flex items-center justify-center mx-auto text-[#00100B]">
            <Code2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-[#00100B]">No assessments created yet</h3>
          <p className="text-xs text-[#2E2D4D] max-w-md mx-auto">
            Create your first technical assessment to select questions, set time constraints, and invite candidates.
          </p>
          <Link
            to="/assessments/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button"
          >
            <Plus className="w-4 h-4 text-[#FFE900]" />
            <span>Build First Assessment</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-6 neo-card flex flex-col justify-between"
            >
              <div>
                {/* Header with status badge */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className={`pill-badge text-[10px] ${
                    item.status === 'active'
                      ? 'bg-[#52B788] text-[#00100B]'
                      : item.status === 'draft'
                      ? 'bg-[#FFE900] text-[#00100B]'
                      : 'bg-[#2E2D4D] text-[#FCFFF7]'
                  }`}>
                    {item.status || 'draft'}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E2D4D]">
                    <Clock className="w-3.5 h-3.5 text-[#00100B]" />
                    <span>{item.timeLimit} Mins</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-[#00100B] tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs text-[#2E2D4D] line-clamp-2 mb-4 leading-relaxed font-medium">
                  {item.description || 'No description provided.'}
                </p>

                {/* Question and Language Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#00100B]/10 mb-6">
                  <span className="text-[11px] font-bold text-[#00100B] bg-black/5 px-2.5 py-1 rounded-lg">
                    {item.questions?.length || 0} Questions
                  </span>
                  {item.allowedLanguages?.map((lang) => (
                    <span key={lang} className="text-[10px] uppercase font-mono font-bold bg-[#FCFFF7] border border-[#00100B]/20 text-[#2E2D4D] px-2 py-0.5 rounded-md">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#00100B]/10">
                <Link
                  to={`/assessments/${item._id}/analytics`}
                  className="py-2.5 px-3 bg-[#FCFFF7] border-2 border-[#00100B] hover:bg-black/5 text-[#00100B] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#00100B]" />
                  <span>Analytics</span>
                </Link>

                <button
                  onClick={() => setSelectedAssessment(item)}
                  className="py-2.5 px-3 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] text-xs font-bold rounded-xl neo-button flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#52B788]" />
                  <span>Invite</span>
                </button>

                <button
                  onClick={() => handleCopyToken(item)}
                  className="py-2.5 px-3 bg-[#FCFFF7] border-2 border-[#00100B] hover:bg-[#FFE900] text-[#00100B] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  title="Copy Candidate Invite URL"
                >
                  {copiedId === item._id ? (
                    <Check className="w-3.5 h-3.5 text-[#52B788]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === item._id ? 'Copied' : 'Link'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Candidate Invite Modal */}
      <CandidateInviteModal
        assessment={selectedAssessment}
        isOpen={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
      />
    </RecruiterLayout>
  );
}
