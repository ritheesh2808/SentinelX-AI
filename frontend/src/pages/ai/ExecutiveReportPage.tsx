import React, { useState, useEffect } from 'react';
import * as aiService from '../../services/aiService';
import type { AISocAnalysis } from '../../types/ai';

export const ExecutiveReportPage: React.FC = () => {
  const [socData, setSocData] = useState<AISocAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await aiService.downloadBoardReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SentinelX_AI_Board_SOC_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Board PDF download failed:', err);
      alert('Failed to download Board SOC PDF report.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
        <p className="text-sm text-[#cbd5e1] animate-pulse">Initializing Security Operations Center correlation analysis...</p>
      </div>
    );
  }

  if (error || !socData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 text-left">
        <h2 className="text-base font-bold text-red-400">SOC Threat Engine Offline</h2>
        <p className="text-sm text-[#cbd5e1]">{error || 'Could not compile correlation metrics.'}</p>
        <button
          onClick={fetchSocReport}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10"
        >
          Initialize Engine
        </button>
      </div>
    );
  }

  const { stats, report } = socData;
  const score = report.riskScore;
  const riskColor = score >= 75 ? 'text-red-400 border-red-500/20' : score >= 50 ? 'text-orange-400 border-orange-500/20' : score >= 25 ? 'text-amber-400 border-amber-500/20' : 'text-emerald-400 border-emerald-500/20';
  const riskBg = score >= 75 ? 'bg-red-500/10' : score >= 50 ? 'bg-orange-500/10' : score >= 25 ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  // Compute values for Donut chart SVG
  const sevStats = report.chartsData?.severityCount || { info: 0, low: 0, medium: 0, high: 0, critical: 0 };
  const totalSev = (sevStats.critical || 0) + (sevStats.high || 0) + (sevStats.medium || 0) + (sevStats.low || 0) + (sevStats.info || 0) || 1;
  const critPct = (((sevStats.critical || 0) / totalSev) * 100);
  const highPct = (((sevStats.high || 0) / totalSev) * 100);
  const medPct = (((sevStats.medium || 0) / totalSev) * 100);
  const lowPct = (((sevStats.low || 0) / totalSev) * 100);
  const infoPct = (((sevStats.info || 0) / totalSev) * 100);

  // Dash Arrays
  const critOffset = 376.8;
  const critDash = (376.8 * critPct) / 100;
  
  const highOffset = critOffset - critDash;
  const highDash = (376.8 * highPct) / 100;

  const medOffset = highOffset - highDash;
  const medDash = (376.8 * medPct) / 100;

  const lowOffset = medOffset - medDash;
  const lowDash = (376.8 * lowPct) / 100;

  const infoOffset = lowOffset - lowDash;
  const infoDash = (376.8 * infoPct) / 100;

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">CISO SOC Dashboard</h1>
          <p className="text-sm text-[#94a3b8]">Correlated AI intelligence reporting on enterprise threat footprint.</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10 flex items-center space-x-2"
        >
          {isDownloading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
              <span>Compiling Board PDF...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Board Report</span>
            </>
          )}
        </button>
      </div>

      {/* Tickers Counters Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl flex flex-col space-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">SOC Active Assets</span>
          <span className="text-2xl font-black text-[#f8fafc] tracking-tight">{stats.totalAssets}</span>
        </div>
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl flex flex-col space-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Ports Exposed</span>
          <span className="text-2xl font-black text-[#f8fafc] tracking-tight">{stats.totalPorts}</span>
        </div>
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl flex flex-col space-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Correlated CVEs</span>
          <span className="text-2xl font-black text-[#cbd5e1] tracking-tight">{stats.totalVulnerabilities}</span>
        </div>
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl flex flex-col space-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Critical/High Risk</span>
          <span className={`text-2xl font-black tracking-tight ${stats.criticalVulnerabilities + stats.highVulnerabilities > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats.criticalVulnerabilities + stats.highVulnerabilities}
          </span>
        </div>
      </div>

      {/* Main posturing block */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Risk score Circle gauge */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] w-full pb-2">CISO Risk Score</h3>
          <div className="relative flex items-center justify-center">
            <svg className="h-40 w-40">
              <circle className="text-[#0b0f19] stroke-current" strokeWidth="12" cx="80" cy="80" r="65" fill="transparent" />
              <circle
                className={`${score >= 75 ? 'text-red-500' : score >= 50 ? 'text-orange-500' : score >= 25 ? 'text-amber-500' : 'text-emerald-500'} stroke-current transition-all duration-1000`}
                strokeWidth="12"
                strokeDasharray={408.2}
                strokeDashoffset={408.2 - (408.2 * score) / 100}
                strokeLinecap="round"
                cx="80"
                cy="80"
                r="65"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-[#f8fafc]">{score}</span>
              <span className="text-[10px] uppercase font-bold text-[#cbd5e1]">Risk Index</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest ${riskBg} ${riskColor}`}>
            {score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW'}
          </span>
        </div>

        {/* Attack Surface Summary details */}
        <div className="md:col-span-2 bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Threat Vector Summary</h3>
            <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-line">{report.attackSurfaceSummary}</p>
          </div>
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-4 flex items-center space-x-3 text-xs text-[#cbd5e1]">
            <svg className="h-5 w-5 text-[#6366f1] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI correlates scan hosts with open service banners to identify MITRE attack stages automatically.</span>
          </div>
        </div>
      </div>

      {/* SVG severity pie and SVG Line trend */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Severity donut chart */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">Vulnerabilities Severity Pie</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="h-36 w-36 rotate-[-90deg]">
                {/* Critical Circle */}
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="#ef4444" strokeWidth="14" strokeDasharray={critDash ? `0 ${critOffset}` : '0 376.8'} />
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="#ef4444" strokeWidth="14" strokeDasharray={critDash ? `${critDash} 376.8` : '0 376.8'} />
                {/* High Circle */}
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="#f97316" strokeWidth="14" strokeDasharray={highDash ? `${highDash} 376.8` : '0 376.8'} strokeDashoffset={-highOffset} />
                {/* Medium Circle */}
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="#f59e0b" strokeWidth="14" strokeDasharray={medDash ? `${medDash} 376.8` : '0 376.8'} strokeDashoffset={-medOffset} />
                {/* Low Circle */}
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray={lowDash ? `${lowDash} 376.8` : '0 376.8'} strokeDashoffset={-lowOffset} />
                {/* Info Circle */}
                <circle cx="72" cy="72" r="60" fill="transparent" stroke="#3b82f6" strokeWidth="14" strokeDasharray={infoDash ? `${infoDash} 376.8` : '0 376.8'} strokeDashoffset={-infoOffset} />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-[#f8fafc]">{totalSev}</span>
                <span className="text-[9px] uppercase font-semibold text-[#cbd5e1]">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                <span className="text-[#cbd5e1] font-semibold">Critical ({sevStats.critical || 0})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                <span className="text-[#cbd5e1] font-semibold">High ({sevStats.high || 0})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
                <span className="text-[#cbd5e1] font-semibold">Medium ({sevStats.medium || 0})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                <span className="text-[#cbd5e1] font-semibold">Low ({sevStats.low || 0})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-[#cbd5e1] font-semibold">Info ({sevStats.info || 0})</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG lines trends chart */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] border-b border-[#1e293b] pb-2">6-Month SOC Risk Trend</h3>
          <div className="relative h-44 w-full">
            <svg className="h-full w-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100%" y2="20" stroke="#1e293b" strokeDasharray="3" />
              <line x1="0" y1="70" x2="100%" y2="70" stroke="#1e293b" strokeDasharray="3" />
              <line x1="0" y1="120" x2="100%" y2="120" stroke="#1e293b" strokeDasharray="3" />
              
              {/* Dynamic Path lines */}
              {(() => {
                const trend = report.chartsData?.riskScoreTrend || [];
                if (trend.length === 0) return null;
                return (
                  <>
                    <path
                      d={`M ${trend.map((t, idx) => {
                        const x = (idx / (trend.length - 1)) * 340; // scaled width
                        const y = 140 - (t.score * 1.2);
                        return `${x} ${y}`;
                      }).join(' L ')}`}
                      fill="none"
                      stroke="url(#trend-grad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="trend-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    {/* Points dots */}
                    {trend.map((t, idx) => {
                      const x = (idx / (trend.length - 1)) * 340;
                      const y = 140 - (t.score * 1.2);
                      return (
                        <g key={idx} className="group cursor-pointer">
                          <circle cx={x} cy={y} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={x} y={y - 10} textAnchor="middle" fill="#cbd5e1" fontSize="9" className="font-mono">{t.score}</text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
            {/* X Axis Labels */}
            <div className="flex justify-between text-[9px] text-[#cbd5e1] font-mono mt-3">
              {(report.chartsData?.riskScoreTrend || []).map((t, idx) => (
                <span key={idx}>{t.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical findings list block */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 border-b border-[#1e293b] pb-2">High-Priority Security Insights</h3>
        <ul className="space-y-3">
          {report.criticalFindings.map((finding, idx) => (
            <li key={idx} className="flex items-start text-sm text-[#cbd5e1] space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 font-bold text-xs">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{finding}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExecutiveReportPage;
