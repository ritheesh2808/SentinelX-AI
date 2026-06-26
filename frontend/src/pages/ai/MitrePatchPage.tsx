import React, { useState, useEffect } from 'react';
import * as aiService from '../../services/aiService';
import type { AISocAnalysis } from '../../types/ai';

export const MitrePatchPage: React.FC = () => {
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
      setError(err?.response?.data?.error || 'Failed to generate SOC AI Analysis. Please make sure you have imported XML scans.');
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
        <p className="text-sm text-[#cbd5e1] animate-pulse">Correlating CVEs with MITRE tactics databases...</p>
      </div>
    );
  }

  if (error || !socData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 text-left">
        <h2 className="text-base font-bold text-red-400">Ledger Offline</h2>
        <p className="text-sm text-[#cbd5e1]">{error || 'Could not compile prioritized mitigations.'}</p>
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

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">MITRE ATT&CK & Patching</h1>
        <p className="text-sm text-[#94a3b8]">Prioritized security remediations and direct alignment with MITRE ATT&CK framework tactics.</p>
      </div>

      {/* MITRE tactics mapping card columns */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">MITRE ATT&CK Framework Mapping</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          {report.mitreMapping.map((item, idx) => (
            <div key={idx} className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-5 space-y-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider">{item.tactic}</span>
                  <h4 className="text-sm font-bold text-[#f8fafc]">{item.technique}</h4>
                </div>
                <span className="text-[10px] font-mono bg-[#1e293b] border border-[#334155] px-2 py-0.5 rounded text-[#94a3b8]">
                  {item.cveId || 'CVE-N/A'}
                </span>
              </div>

              <div className="text-xs text-[#cbd5e1]">
                <span className="font-semibold text-[#f8fafc]">Title:</span> {item.vulnerabilityTitle}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-[#1e293b]">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Detection</span>
                  <p className="text-[#94a3b8] leading-relaxed">{item.detection}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Mitigation</span>
                  <p className="text-[#94a3b8] leading-relaxed">{item.mitigation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patch Prioritization Ledger Table */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Risk-Prioritized Patch Ledger</h3>
        
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#1e293b]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0b0f19] text-[#94a3b8] font-bold">
                <th className="p-4 rounded-l-xl">Priority Index</th>
                <th className="p-4">Vulnerability / CVE</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Effort</th>
                <th className="p-4">Downtime Estimate</th>
                <th className="p-4">Impact Scope</th>
                <th className="p-4 rounded-r-xl">Priority Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {report.patchPrioritization.map((item, idx) => {
                const badgeColor = item.severity === 'CRITICAL' ? 'text-red-400 bg-red-500/10' : item.severity === 'HIGH' ? 'text-orange-400 bg-orange-500/10' : 'text-amber-400 bg-amber-500/10';
                return (
                  <tr key={idx} className="hover:bg-[#0b0f19]/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#6366f1]">P{idx + 1}</td>
                    <td className="p-4 space-y-1">
                      <p className="font-bold text-[#f8fafc]">{item.cveId || 'CVE-N/A'}</p>
                      <p className="text-[#94a3b8] text-[10px] max-w-xs truncate">{item.vulnerabilityTitle}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[#cbd5e1]">{item.patchEffort}</td>
                    <td className="p-4 font-mono text-[#cbd5e1]">{item.downtimeEstimate}</td>
                    <td className="p-4 text-[#94a3b8] max-w-[200px] truncate">{item.businessImpact}</td>
                    <td className="p-4 font-bold text-right pr-6">
                      <span className={item.priorityScore >= 75 ? 'text-red-400' : item.priorityScore >= 50 ? 'text-orange-400' : 'text-amber-400'}>
                        {item.priorityScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MitrePatchPage;
