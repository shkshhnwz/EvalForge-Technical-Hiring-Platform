import React from 'react';
import { ArrowUpRight, Terminal } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="w-full bg-[#FCFFF7] pt-12 pb-16 border-t border-[#00100B]/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Tag */}
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-[#52B788] text-[#00100B] px-3.5 py-1 rounded-md text-sm font-bold tracking-tight">
            Impact & Proof
          </span>
          <p className="text-sm font-medium text-[#2E2D4D]">
            Real engineering teams building fair, automated hiring pipelines.
          </p>
        </div>

        {/* 3 Dark Case Cards (Faithful to Reference Image) */}
        <div className="bg-[#00100B] text-[#FCFFF7] rounded-3xl p-8 md:p-12 mb-16 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/15">
            {/* Card 1 */}
            <div className="md:pr-8 pt-4 md:pt-0">
              <span className="text-xs uppercase font-bold text-[#52B788] tracking-widest block mb-2">Fintech Unicorn</span>
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                Replaced 120+ hours of manual live interview rounds with automated Judge0 code assessments. Reduced time-to-hire by 64% while improving candidate offer acceptance.
              </p>
              <a href="#case-studies" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#52B788] hover:text-[#FFE900] transition-colors">
                View hiring metric <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 2 */}
            <div className="md:px-8 pt-6 md:pt-0">
              <span className="text-xs uppercase font-bold text-[#FFE900] tracking-widest block mb-2">Cloud Scale SaaS</span>
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                Evaluated 1,400+ campus engineering applicants in 48 hours using BullMQ distributed sandboxes with 100% test-case uptime and auto-graded hidden cases.
              </p>
              <a href="#case-studies" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#52B788] hover:text-[#FFE900] transition-colors">
                Read architecture report <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="md:pl-8 pt-6 md:pt-0">
              <span className="text-xs uppercase font-bold text-[#FCFFF7] tracking-widest block mb-2">Remote AI Studio</span>
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                Identified top 5% backend contributors through granular time-vs-score distributions and memory benchmarks, eliminating resume bias completely.
              </p>
              <a href="#case-studies" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#52B788] hover:text-[#FFE900] transition-colors">
                Explore candidate funnel <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#00100B]/10 text-xs font-medium text-[#2E2D4D]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#00100B] flex items-center justify-center text-[#52B788]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span>© 2026 EvalForge Inc. All rights reserved. Technical Hiring Platform.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#00100B] cursor-pointer">Security & Sandboxing</span>
            <span className="hover:text-[#00100B] cursor-pointer">Judge0 Execution SLA</span>
            <span className="hover:text-[#00100B] cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
