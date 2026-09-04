import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layouts/PublicNavbar';
import PublicFooter from '../../components/layouts/PublicFooter';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  BarChart4, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Code2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const brandLogos = [
    { name: 'TypeScript', code: 'TS' },
    { name: 'Python', code: 'PY' },
    { name: 'Judge0 API', code: 'J0' },
    { name: 'Redis Queue', code: 'RD' },
    { name: 'Docker Engine', code: 'DK' },
    { name: 'Node.js', code: 'JS' },
  ];

  return (
    <div className="min-h-screen bg-[#FCFFF7] flex flex-col selection:bg-[#FFE900] selection:text-[#00100B]">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION (Faithful to Reference Image) */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#52B788]/20 border border-[#52B788] text-[#00100B] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#52B788]" />
                Next-Gen Code Evaluation
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#00100B] tracking-tight leading-[1.08]">
                Navigating the technical landscape for hiring success
              </h1>

              <p className="text-base sm:text-lg text-[#2E2D4D] font-medium leading-relaxed max-w-xl">
                EvalForge empowers fast-moving teams to evaluate engineering candidates through sandboxed live coding environments, automated Judge0 grading suites, and actionable deep analytics.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register/company"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#00100B] text-[#FCFFF7] text-sm font-bold rounded-2xl neo-button hover:bg-[#2E2D4D] transition-all"
                >
                  Start hiring engineers
                  <ArrowRight className="w-4 h-4 text-[#FFE900]" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border-2 border-[#00100B] text-[#00100B] text-sm font-bold rounded-2xl hover:bg-black/5 transition-all"
                >
                  Candidate assessment login
                </Link>
              </div>

              {/* Mini Feature Ticks */}
              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-[#2E2D4D]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                  BullMQ Queue & Sandbox
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                  Multi-language Support
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                  Zero Cheat Tolerances
                </span>
              </div>
            </motion.div>

            {/* Right Hero Graphic (Stylized Megaphone & Orbit Concept from Reference) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                {/* Orbit rings */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00100B]/15 animate-spin-slow"></div>
                <div className="absolute inset-6 rounded-full border border-[#2E2D4D]/20"></div>

                {/* Floating Pills & Badges */}
                <div className="absolute top-4 right-6 bg-[#00100B] text-[#FCFFF7] px-3.5 py-1.5 rounded-full text-xs font-bold neo-card flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#52B788]" />
                  Judge0 Sandboxed
                </div>
                <div className="absolute bottom-6 left-2 bg-[#FFE900] text-[#00100B] px-3.5 py-1.5 rounded-full text-xs font-bold neo-card flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Auto-Graded
                </div>

                {/* Central Stylized Terminal / Megaphone Box */}
                <div className="w-64 h-64 bg-[#00100B] rounded-3xl neo-card p-6 flex flex-col justify-between text-[#FCFFF7] relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    </div>
                    <span className="text-[10px] font-mono text-[#52B788]">evalforge.sh</span>
                  </div>

                  <div className="font-mono text-xs space-y-2 py-4">
                    <p className="text-neutral-400">$ ./evalforge --run</p>
                    <p className="text-[#52B788]">✓ Tests Passed: 14/14</p>
                    <p className="text-[#FFE900]">⚡ Runtime: 24ms</p>
                    <p className="text-neutral-300">★ Grade: 100/100 (Top 1%)</p>
                  </div>

                  <div className="bg-[#2E2D4D] rounded-xl p-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-300">Status</span>
                    <span className="text-[10px] uppercase font-black bg-[#52B788] text-[#00100B] px-2 py-0.5 rounded-full">
                      Hired
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LOGO STRIP (Matching reference image partner bar) */}
        <section className="border-y border-[#00100B]/10 py-10 bg-[#FCFFF7]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs uppercase font-bold text-[#2E2D4D]/70 tracking-widest mb-6">
              Built on battle-tested engineering infrastructure
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {brandLogos.map((item) => (
                <div key={item.name} className="flex items-center gap-2 group cursor-default">
                  <div className="w-7 h-7 rounded-lg bg-[#00100B] text-[#FCFFF7] font-mono text-[10px] font-extrabold flex items-center justify-center group-hover:bg-[#52B788] group-hover:text-[#00100B] transition-colors">
                    {item.code}
                  </div>
                  <span className="font-extrabold text-sm text-[#2E2D4D] group-hover:text-[#00100B] transition-colors">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID (Matching 2x2 Asymmetric layout from reference image) */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-block bg-[#52B788] text-[#00100B] px-3.5 py-1 rounded-md text-sm font-bold">
                Platform Services
              </div>
              <h2 className="text-3xl font-black text-[#00100B] tracking-tight">
                Everything you need to hire the best engineers
              </h2>
            </div>
            <p className="text-sm font-medium text-[#2E2D4D] max-w-md">
              From creating custom question banks to receiving real-time Judge0 sandbox results and deep candidate rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Light Card */}
            <div className="bg-[#FCFFF7] rounded-3xl p-8 md:p-10 border-2 border-[#00100B] neo-card flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block bg-[#52B788] text-[#00100B] px-3 py-1 rounded-full text-xs font-bold">
                  Live Monaco Editor
                </span>
                <h3 className="text-2xl font-black text-[#00100B]">Interactive Candidate IDE</h3>
                <p className="text-sm text-[#2E2D4D] font-medium leading-relaxed">
                  Full syntax highlighting, customizable theme, and starter templates for JavaScript, Python, C++, and Java. Allows candidates to test their solutions against sample cases before final submission.
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-[#00100B]/10 mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#00100B] hover:text-[#52B788] transition-colors">
                  Try candidate experience <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Terminal className="w-8 h-8 text-[#00100B]" />
              </div>
            </div>

            {/* Card 2: Solid Dark Card (#00100B) */}
            <div className="bg-[#00100B] text-[#FCFFF7] rounded-3xl p-8 md:p-10 neo-card flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block bg-[#FFE900] text-[#00100B] px-3 py-1 rounded-full text-xs font-bold">
                  Judge0 + BullMQ
                </span>
                <h3 className="text-2xl font-black text-[#FCFFF7]">Sandboxed Auto-Grading</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Candidate code is dispatched to isolated execution sandboxes with strict memory and time limits. Both public sample cases and hidden test cases are executed automatically.
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-white/15 mt-6">
                <Link to="/register/company" className="inline-flex items-center gap-2 text-sm font-bold text-[#FFE900] hover:text-white transition-colors">
                  Create assessment <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Cpu className="w-8 h-8 text-[#FFE900]" />
              </div>
            </div>

            {/* Card 3: Solid Dark Indigo Card (#2E2D4D) */}
            <div className="bg-[#2E2D4D] text-[#FCFFF7] rounded-3xl p-8 md:p-10 neo-card flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block bg-[#52B788] text-[#00100B] px-3 py-1 rounded-full text-xs font-bold">
                  Strict Timing & Invites
                </span>
                <h3 className="text-2xl font-black text-[#FCFFF7]">Candidate Access Control</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Generate secure invite tokens, import candidate rosters in bulk via CSV uploads, and automate closing-soon reminder emails via transactional SMTP.
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-white/15 mt-6">
                <Link to="/register/company" className="inline-flex items-center gap-2 text-sm font-bold text-[#52B788] hover:text-white transition-colors">
                  Explore invites <ArrowUpRight className="w-4 h-4" />
                </Link>
                <ShieldCheck className="w-8 h-8 text-[#52B788]" />
              </div>
            </div>

            {/* Card 4: Light Card */}
            <div className="bg-[#FCFFF7] rounded-3xl p-8 md:p-10 border-2 border-[#00100B] neo-card flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block bg-[#FFE900] text-[#00100B] px-3 py-1 rounded-full text-xs font-bold">
                  Analytics & Reports
                </span>
                <h3 className="text-2xl font-black text-[#00100B]">Leaderboards & CSV Export</h3>
                <p className="text-sm text-[#2E2D4D] font-medium leading-relaxed">
                  View score distribution histograms, question difficulty benchmarks, individual candidate code run logs, and export ranked candidate leaderboards with one click.
                </p>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-[#00100B]/10 mt-6">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#00100B] hover:text-[#52B788] transition-colors">
                  View analytics sample <ArrowUpRight className="w-4 h-4" />
                </Link>
                <BarChart4 className="w-8 h-8 text-[#00100B]" />
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER (Faithful to Reference Image's "Let's make things happen") */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-[#FCFFF7] rounded-3xl border-2 border-[#00100B] p-8 md:p-14 neo-card flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="bg-[#FFE900] text-[#00100B] px-3.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                Get Started Today
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#00100B] tracking-tight">
                Let's make technical hiring fast, fair, and automated
              </h2>
              <p className="text-sm text-[#2E2D4D] font-medium">
                Register your organization to compile custom assessments, add algorithmic challenges, and start evaluating candidates immediately.
              </p>
              <div className="pt-2">
                <Link
                  to="/register/company"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#00100B] text-[#FCFFF7] font-bold text-sm rounded-full neo-button hover:bg-[#2E2D4D] transition-all"
                >
                  Create Organization Account
                  <ArrowRight className="w-4 h-4 text-[#52B788]" />
                </Link>
              </div>
            </div>

            {/* Stylized graphic */}
            <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#00100B] flex items-center justify-center bg-[#52B788]/10 relative">
              <div className="w-24 h-24 rounded-2xl bg-[#00100B] flex items-center justify-center text-[#FFE900] neo-card">
                <Code2 className="w-10 h-10" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
