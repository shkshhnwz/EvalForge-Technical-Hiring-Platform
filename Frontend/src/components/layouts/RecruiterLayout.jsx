import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FileCode, 
  PlusCircle, 
  HelpCircle, 
  BarChart3, 
  LogOut, 
  Building2, 
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecruiterLayout({ children, title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Assessments', path: '/dashboard', icon: FileCode },
    { label: 'Create Assessment', path: '/assessments/new', icon: PlusCircle },
    { label: 'Question Bank', path: '/questions', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FCFFF7] flex flex-col md:flex-row text-[#00100B]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#00100B] text-[#FCFFF7] flex flex-col justify-between p-6 border-r border-[#00100B]">
        <div>
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-[#52B788] flex items-center justify-center text-[#00100B] font-black">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight flex items-center gap-1">
                EvalForge
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFE900]"></span>
              </span>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Recruiter Portal</span>
            </div>
          </Link>

          {/* Org Pill */}
          <div className="bg-[#2E2D4D] rounded-xl p-3.5 mb-6 border border-white/10 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#FFE900] shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Organization</span>
              <span className="text-xs font-semibold text-white truncate block">
                {user?.orgId?.Orgname || user?.email?.split('@')[1] || 'Verified Partner'}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#52B788] text-[#00100B] shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Recruiter'}</p>
              <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-[#FFE900] hover:bg-white/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-white py-1 transition-colors"
          >
            <span>Platform Public View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-20 bg-[#FCFFF7] border-b border-[#00100B]/10 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#00100B] tracking-tight">{title || 'Dashboard'}</h1>
            {subtitle && <p className="text-xs font-medium text-[#2E2D4D]">{subtitle}</p>}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Content Body with smooth gentle entrance */}
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
