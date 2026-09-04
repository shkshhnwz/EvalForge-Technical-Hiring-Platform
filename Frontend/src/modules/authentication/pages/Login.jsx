import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [roleMode, setRoleMode] = useState('recruiter'); // 'recruiter' | 'candidate'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res.user?.role === 'recruiter' || res.user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        // If candidate, navigate to root or state origin
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFFF7] flex flex-col justify-between selection:bg-[#FFE900] selection:text-[#00100B]">
      {/* Top Simple Nav */}
      <div className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#00100B] flex items-center justify-center text-[#52B788]">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#00100B]">EvalForge</span>
        </Link>
        <Link
          to="/"
          className="text-xs font-bold text-[#2E2D4D] hover:text-[#00100B] transition-colors"
        >
          ← Back to Homepage
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#FCFFF7] border-2 border-[#00100B] rounded-3xl p-8 neo-card"
        >
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <span className="inline-block bg-[#52B788] text-[#00100B] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              Secure Sign-In
            </span>
            <h1 className="text-2xl font-black text-[#00100B] tracking-tight">Welcome to EvalForge</h1>
            <p className="text-xs font-semibold text-[#2E2D4D]">Access your assessments or management dashboard</p>
          </div>

          {/* Role Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRoleMode('recruiter')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                roleMode === 'recruiter'
                  ? 'bg-[#00100B] text-[#FCFFF7] shadow-sm'
                  : 'text-[#2E2D4D] hover:text-[#00100B]'
              }`}
            >
              Hiring Team / Recruiter
            </button>
            <button
              type="button"
              onClick={() => setRoleMode('candidate')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                roleMode === 'candidate'
                  ? 'bg-[#00100B] text-[#FCFFF7] shadow-sm'
                  : 'text-[#2E2D4D] hover:text-[#00100B]'
              }`}
            >
              Candidate Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  required
                />
                <Mail className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00100B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-10 text-sm font-medium bg-[#FCFFF7] border-2 border-[#00100B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-[#00100B]"
                  required
                />
                <Lock className="w-4 h-4 text-[#2E2D4D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#00100B] hover:bg-[#2E2D4D] text-[#FCFFF7] font-bold text-sm rounded-xl neo-button flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#FFE900]" />
                </>
              )}
            </button>
          </form>

          {/* Bottom links */}
          <div className="pt-6 mt-6 border-t border-[#00100B]/10 text-center space-y-2 text-xs font-semibold text-[#2E2D4D]">
            {roleMode === 'recruiter' ? (
              <p>
                New hiring team?{' '}
                <Link to="/register/company" className="text-[#00100B] font-extrabold underline hover:text-[#52B788]">
                  Register your organization
                </Link>
              </p>
            ) : (
              <p>
                Taking an assessment? Check your email for your unique invitation token link.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer minimal */}
      <div className="text-center py-6 text-xs text-[#2E2D4D]/60 font-medium">
        © 2026 EvalForge • Automated Code Sandboxing Platform
      </div>
    </div>
  );
}
