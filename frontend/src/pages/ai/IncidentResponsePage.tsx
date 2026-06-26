import React, { useState, useEffect } from 'react';
import * as aiService from '../../services/aiService';
import type { AISocAnalysis } from '../../types/ai';

export const IncidentResponsePage: React.FC = () => {
  const [socData, setSocData] = useState<AISocAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSocReport = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await aiService.getSocAnalysis();
      setSocData(data);
    } catch (err: any) {
      console.error('Failed to load SOC report:', err);
      setError(err?.response?.data?.error || 'Failed to generate SOC AI Analysis. Make sure you have imported XML scans.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocReport();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
        <p className="text-sm text-[#cbd5e1] animate-pulse">Modeling incident scenarios and compiling response playbooks...</p>
      </div>
    );
  }

  if (error || !socData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 text-left">
        <h2 className="text-base font-bold text-red-400">Playbooks Engine Offline</h2>
        <p className="text-sm text-[#cbd5e1]">{error || 'Could not compile playbooks.'}</p>
        <button
          onClick={fetchSocReport}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { report } = socData;
  const playbook = report.incidentPlaybook || {
    timeline: [],
    containmentPlan: [],
    eradicationPlan: [],
    recoveryPlan: [],
    lessonsLearned: []
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">Incident Response Playbook</h1>
        <p className="text-sm text-[#94a3b8]">AI-generated containment, eradication, and disaster recovery checklists modeled on your current threat footprint.</p>
      </div>

      {/* Incident Simulation Timeline */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Hypothetical Compromise Timeline Flow</h3>
        
        <div className="relative pl-6 border-l border-[#334155]/30 space-y-6">
          {playbook.timeline.map((event, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-[33px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#ef4444] text-[#f8fafc] text-xs font-bold shadow-lg shadow-red-500/20">
                T
              </span>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                  {event.timestampOffset}
                </span>
                <h4 className="text-sm font-bold text-[#f8fafc]">{event.event}</h4>
                <span className="text-[10px] text-[#cbd5e1] uppercase font-bold tracking-widest">{event.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playbook checklists grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Containment */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-2">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">Containment checklist</h3>
          </div>
          <div className="space-y-3">
            {playbook.containmentPlan.map((step, idx) => (
              <label key={idx} className="flex items-start text-xs text-[#cbd5e1] space-x-2.5 cursor-pointer select-none">
                <input type="checkbox" className="mt-0.5 rounded border-[#334155] bg-[#0b0f19] focus:ring-[#6366f1] text-[#6366f1]" />
                <span className="leading-relaxed">{step}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Eradication */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-2">
            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">Eradication checklist</h3>
          </div>
          <div className="space-y-3">
            {playbook.eradicationPlan.map((step, idx) => (
              <label key={idx} className="flex items-start text-xs text-[#cbd5e1] space-x-2.5 cursor-pointer select-none">
                <input type="checkbox" className="mt-0.5 rounded border-[#334155] bg-[#0b0f19] focus:ring-[#6366f1] text-[#6366f1]" />
                <span className="leading-relaxed">{step}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Recovery */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-2">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">Recovery checklist</h3>
          </div>
          <div className="space-y-3">
            {playbook.recoveryPlan.map((step, idx) => (
              <label key={idx} className="flex items-start text-xs text-[#cbd5e1] space-x-2.5 cursor-pointer select-none">
                <input type="checkbox" className="mt-0.5 rounded border-[#334155] bg-[#0b0f19] focus:ring-[#6366f1] text-[#6366f1]" />
                <span className="leading-relaxed">{step}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Lessons learned post-mortem */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Post-Incident Recommendations</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {playbook.lessonsLearned.map((lesson, idx) => (
            <div key={idx} className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-4 flex items-start space-x-3 text-xs text-[#cbd5e1]">
              <span className="h-4 w-4 shrink-0 rounded bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center font-mono">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{lesson}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentResponsePage;
