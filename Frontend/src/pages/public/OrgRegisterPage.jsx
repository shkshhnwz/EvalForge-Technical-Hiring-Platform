import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Building2, User, Mail, Lock, Globe, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrgRegisterPage() {
  const navigate = useNavigate();
  const { registerOrg } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    Orgname: '',
    domain: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.Orgname || !formData.password) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      await registerOrg(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFFF7] flex flex-col justify-between selection:bg-[#FFE900] selection:text-[#00100B]">
      {/* Top Nav */}
      <div className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#00100B] flex items-center justify-center text-[#52B788]">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#00100B]">EvalForge</span>
        </Link>
        <Link to="/login" className="text-xs font-bold text-[#2E2D4D] hover:text-[#00100B]">
          Already have an account? <span className="underline">Sign In</span>
        </Link>
      </div>

      {/* Main Registration Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 md:p-10 neo-card"
        >
          <div className="space-y-2 mb-6">
            <span className="inline-block bg-[#FFE900] text-[#00100B] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              Recruiter Onboarding
            </span>
            <h1 className="text-3xl font-black text-[#00100B] tracking-tight">Register Your Organization</h1>
            <p className="text-xs font-semibold text-[#2E2D4D]">
              Create an organization workspace to build custom algorithmic tests and evaluate developers.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                  Company / Org Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.Orgname}
                    onChange={(e) => setFormData({ ...formData, Orgname: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                    required
                  />
                  <Building2 className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                  Company Domain
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="acme.com"
                    className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  />
                  <Globe className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                  Recruiter Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                    required
                  />
                  <User className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                  Work Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@acme.com"
                    className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Set Account Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  required
                />
                <Lock className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="p-4 bg-[#00100B]/5 rounded-2xl space-y-1.5 text-xs text-[#2E2D4D]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Unlimited custom assessment creation & question tagging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Automated Judge0 sandboxed runtime execution</span>
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
                  <span>Create Hiring Workspace</span>
                  <ArrowRight className="w-4 h-4 text-[#52B788]" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="text-center py-6 text-xs text-[#2E2D4D]/60 font-medium">
        © 2026 EvalForge • Automated Code Sandboxing Platform
      </div>
    </div>
  );
}
