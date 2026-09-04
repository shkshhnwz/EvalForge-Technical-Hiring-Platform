import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Terminal, ArrowRight, UserCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicNavbar() {
  const { user, isAuthenticated, isRecruiter, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#FCFFF7] border-b border-[#00100B]/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#00100B] flex items-center justify-center text-[#FCFFF7] neo-button group-hover:bg-[#2E2D4D] transition-colors">
            <Terminal className="w-5 h-5 text-[#52B788]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#00100B] flex items-center gap-1.5">
              EvalForge
              <span className="w-2 h-2 rounded-full bg-[#52B788]"></span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#2E2D4D]/70 -mt-1">Technical Hiring</span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#2E2D4D]">
          <a href="/#features" className="hover:text-[#00100B] transition-colors">Platform</a>
          <a href="/#sandbox" className="hover:text-[#00100B] transition-colors">Code Sandbox</a>
          <a href="/#case-studies" className="hover:text-[#00100B] transition-colors">Why EvalForge</a>
          <Link to="/login" className="hover:text-[#00100B] transition-colors">Candidates</Link>
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={isRecruiter ? "/dashboard" : "/"}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-[#52B788]/20 text-[#00100B] border border-[#52B788] hover:bg-[#52B788]/30 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                {isRecruiter ? "Recruiter Portal" : "Candidate Home"}
              </Link>
              <button
                onClick={logout}
                className="p-2 text-[#2E2D4D] hover:text-[#00100B] rounded-full hover:bg-black/5 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-[#00100B] px-4 py-2 hover:bg-black/5 rounded-full transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register/company"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#FCFFF7] bg-[#00100B] rounded-full neo-button hover:bg-[#2E2D4D] transition-all"
              >
                Hire Engineers
                <ArrowRight className="w-4 h-4 text-[#FFE900]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
