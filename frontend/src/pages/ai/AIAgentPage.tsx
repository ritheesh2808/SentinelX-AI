import React, { useState } from 'react';
import * as aiService from '../../services/aiService';
import type { AIVulnerabilityAnalysis } from '../../types/ai';

export const AIAgentPage: React.FC = () => {
  // Input states
  const [service, setService] = useState('');
  const [version, setVersion] = useState('');
  const [port, setPort] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [product, setProduct] = useState('');
  const [banner, setBanner] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AIVulnerabilityAnalysis | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      setError('Service name is required.');
      return;
    }
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber)) {
      setError('Valid port number is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const data = await aiService.analyzeVulnerability({
        service,
        version,
        port: portNumber,
        severity,
        product: product || undefined,
        banner: banner || undefined,
      });
      setAnalysis(data);
    } catch (err: any) {
      console.error('AI analysis failed:', err);
      setError(err?.response?.data?.error || 'Failed to analyze vulnerability details. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setService('');
    setVersion('');
    setPort('');
    setSeverity('MEDIUM');
    setProduct('');
    setBanner('');
    setAnalysis(null);
    setError('');
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">SentinelX AI Agent</h1>
        <p className="text-sm text-[#94a3b8]">Run on-demand AI-powered threat analysis and vulnerability intelligence modeling.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form Card */}
        <div className="lg:col-span-1 bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#cbd5e1] mb-6">Service Vulnerability Scanner</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Service Name *</label>
              <input
                type="text"
                placeholder="e.g. ssh, http, postgresql"
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
                className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Version *</label>
              <input
                type="text"
                placeholder="e.g. 7.2p2, 2.4.41"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
                className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Port *</label>
              <input
                type="number"
                placeholder="e.g. 22, 80, 5432"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                required
                className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-colors"
              >
                <option value="INFO">INFO</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Product (Optional)</label>
              <input
                type="text"
                placeholder="e.g. OpenSSH, Apache HTTPD"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Banner / Header (Optional)</label>
              <textarea
                placeholder="e.g. SSH-2.0-OpenSSH_7.2p2 Ubuntu..."
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                rows={3}
                className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10 text-center"
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:bg-[#334155] transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Results Block */}
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-[#131c2e]/50 border border-[#1e293b] rounded-2xl h-full">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
              <p className="text-sm text-[#cbd5e1] animate-pulse">Running advanced vulnerability mapping algorithms...</p>
            </div>
          )}

          {!isLoading && !analysis && !error && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-[#131c2e]/30 border border-dashed border-[#334155] rounded-2xl h-full text-center p-6">
              <svg className="h-12 w-12 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.813M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.02a2 2 0 00-1.022.547l-.92.92a2 2 0 00-.547 1.022l-.477 2.387a2 2 0 00.517 3.86l2.022-.405a2 2 0 001.022-.547l.92-.92a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-.517-3.86l-2.022.405a2 2 0 00-1.022.547l-.92.92z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-[#f8fafc] mb-1">No Active Analysis</h3>
                <p className="text-xs text-[#475569] max-w-sm">Enter service details on the left and click Analyze to trigger SentinelX AI's cybersecurity threat engine.</p>
              </div>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              {/* Confidence Score meter */}
              <div className="flex items-center justify-between p-4 bg-[#131c2e] border border-[#1e293b] rounded-2xl shadow-xl">
                <span className="text-sm font-semibold text-[#cbd5e1]">SentinelX AI Threat Confidence</span>
                <div className="flex items-center space-x-3 w-1/2">
                  <div className="w-full bg-[#0b0f19] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#6366f1] to-emerald-400 h-2 rounded-full"
                      style={{ width: `${analysis.confidenceScore}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-400">{analysis.confidenceScore}%</span>
                </div>
              </div>

              {/* Analysis Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Executive Summary */}
                <div className="md:col-span-2 bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Executive Summary</h3>
                  <p className="text-sm text-[#cbd5e1] leading-relaxed">{analysis.executiveSummary}</p>
                </div>

                {/* Technical Analysis */}
                <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6366f1]">Technical Analysis</h3>
                  <p className="text-sm text-[#cbd5e1] whitespace-pre-line leading-relaxed">{analysis.technicalAnalysis}</p>
                </div>

                {/* Risk Card */}
                <div className="bg-[#131c2e] border border-red-500/10 rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">Risk</h3>
                  <p className="text-sm text-[#cbd5e1] leading-relaxed">{analysis.riskExplanation}</p>
                </div>

                {/* Attack Scenario */}
                <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#a855f7]">Attack Scenario</h3>
                  <p className="text-sm text-[#cbd5e1] leading-relaxed">{analysis.attackScenario}</p>
                </div>

                {/* Business Impact */}
                <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b]">Business Impact</h3>
                  <p className="text-sm text-[#cbd5e1] leading-relaxed">{analysis.businessImpact}</p>
                </div>

                {/* Remediation */}
                <div className="md:col-span-2 bg-[#131c2e] border border-emerald-500/20 rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Remediation</h3>
                  <p className="text-sm text-[#cbd5e1] whitespace-pre-line leading-relaxed">{analysis.remediation}</p>
                </div>

                {/* References */}
                <div className="md:col-span-2 bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">References</h3>
                  <div className="text-sm text-[#cbd5e1] font-mono whitespace-pre-wrap leading-relaxed select-all">
                    {analysis.references}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAgentPage;
