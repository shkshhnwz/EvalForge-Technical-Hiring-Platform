import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Terminal, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CandidateJoinPage() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    setLoading(true);
    try {
      // POST to /api/assessments/join/:inviteToken
      const res = await api.post(`/api/assessments/join/${inviteToken}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.accessToken) {
        // Construct user representation
        const candidateUser = {
          name: formData.name,
          email: formData.email,
          role: 'candidate',
          attempt: res.attempt,
        };
        setSession(res.accessToken, candidateUser);
        // Navigate to active assessment workspace
        navigate('/test/active');
      }
    } catch (err) {
      setError(err.message || 'Unable to join assessment. Please check your invitation link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFFF7] flex flex-col justify-between selection:bg-[#FFE900] selection:text-[#00100B]">
      {/* Top Brand Bar */}
      <div className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00100B] flex items-center justify-center text-[#52B788]">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#00100B]">EvalForge</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E2D4D]">
          Candidate Assessment Portal
        </span>
      </div>

      {/* Main Join Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 md:p-10 neo-card"
        >
          <div className="space-y-2 mb-6">
            <span className="inline-block bg-[#52B788] text-[#00100B] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              Invitation Accepted
            </span>
            <h1 className="text-2xl font-black text-[#00100B] tracking-tight">Enter Your Assessment</h1>
            <p className="text-xs font-semibold text-[#2E2D4D]">
              Fill in your details below to establish your secure candidate session.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Taylor Swift"
                  className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                />
                <User className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="taylor@example.com"
                  className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                />
                <Mail className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Assessment Password / PIN *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create session password"
                  className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                />
                <Lock className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] font-bold text-sm rounded-xl neo-button flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Join Assessment</span>
                  <ArrowRight className="w-4 h-4 text-[#FFE900]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-[#00100B]/10 text-center text-[11px] text-[#2E2D4D] font-medium">
            Your progress will be saved in real time. Do not share your link or credentials.
          </div>
        </motion.div>
      </div>

      <div className="text-center py-6 text-xs text-[#2E2D4D]/60 font-medium">
        © 2026 EvalForge • Automated Code Sandboxing Platform
      </div>
    </div>
  );
}
