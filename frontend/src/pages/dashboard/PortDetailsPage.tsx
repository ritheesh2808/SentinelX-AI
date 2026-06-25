import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as portService from '../../services/portService';
import type { Port } from '../../types/port';

export const PortDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [port, setPort] = useState<Port | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await portService.getPortById(id);
        setPort(data);
      } catch (err) {
        console.error('Failed to load port details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortDetails();
  }, [id]);

  const getRiskColor = (risk: string) => {
    const r = risk.toLowerCase();
    switch (r) {
      case 'critical':
        return 'text-red-400 border-red-500/20 bg-red-500/5';
      case 'high':
        return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
      case 'medium':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'low':
        return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
      case 'informational':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      default:
        return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
      </div>
    );
  }

  if (!port) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
        Port element not found or inaccessible.
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#f8fafc] font-semibold transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-[#f8fafc] font-mono">
              {port.portNumber} / <span className="text-[#6366f1]">{port.protocol.toUpperCase()}</span>
            </h1>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase ${
              port.state === 'open' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
            }`}>
              {port.state}
            </span>
          </div>
          <p className="text-sm text-[#94a3b8]">
            Discovered service: <span className="text-[#f8fafc] font-semibold font-mono">{port.service}</span>
          </p>
        </div>

        {/* Risk badge */}
        <div className={`rounded-xl border px-5 py-2.5 text-center ${getRiskColor(port.riskLevel)}`}>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Risk level</div>
          <div className="text-lg font-black tracking-wider uppercase">{port.riskLevel}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Core parameters */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider border-b border-[#1e293b] pb-3">
              Service Attributes
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">Service Type</label>
                <div className="text-sm text-[#f8fafc] font-semibold font-mono">{port.service}</div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">Protocol Version</label>
                <div className="text-sm text-[#f8fafc] font-mono">{port.protocol.toUpperCase()}</div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">Discovered Product</label>
                <div className="text-sm text-[#f8fafc] font-semibold">{port.product || <span className="text-[#475569]">-</span>}</div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">Software Version</label>
                <div className="text-sm text-[#f8fafc] font-mono">{port.version || <span className="text-[#475569]">-</span>}</div>
              </div>
            </div>
          </div>

          {/* Banner disclosure */}
          <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider border-b border-[#1e293b] pb-3">
              Raw Banner Output
            </h3>

            {port.banner ? (
              <pre className="p-4 rounded-xl bg-[#0b0f19] border border-[#1e293b] text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed max-w-full whitespace-pre-wrap break-all">
                {port.banner}
              </pre>
            ) : (
              <div className="text-xs text-[#475569] font-mono italic">
                No raw signature banners retrieved.
              </div>
            )}
          </div>
        </div>

        {/* Node context */}
        <div className="space-y-6">
          {/* Asset context card */}
          <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest border-b border-[#1e293b] pb-2">
              Associated Asset
            </h3>

            {port.scanHost?.asset ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Hostname</label>
                  <div className="text-sm font-bold text-[#f8fafc]">{port.scanHost.asset.hostname}</div>
                </div>
                <div>
                  <label className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">IP Address</label>
                  <div className="text-xs text-[#94a3b8] font-mono">{port.scanHost.asset.ipAddress}</div>
                </div>
                <div className="pt-2 border-t border-[#1e293b]">
                  <Link
                    to={`/dashboard/assets`}
                    className="text-xs text-[#6366f1] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Manage Asset Registry
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-[#94a3b8] leading-relaxed">
                  Target host <span className="font-semibold font-mono text-[#f8fafc]">{port.scanHost?.ipAddress}</span> is not correlated to any Asset node inventory.
                </div>
                <div>
                  <label className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Host State</label>
                  <div className="text-xs font-mono text-[#f8fafc] uppercase">{port.scanHost?.state}</div>
                </div>
              </div>
            )}
          </div>

          {/* Ingest context card */}
          <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest border-b border-[#1e293b] pb-2">
              Ingest Audit
            </h3>

            {port.scanHost?.scan ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Report Source</label>
                  <div className="text-xs font-mono text-[#f8fafc] truncate">{port.scanHost.scan.filename}</div>
                </div>
                <div>
                  <label className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Indexed At</label>
                  <div className="text-xs text-[#94a3b8]">{new Date(port.createdAt).toLocaleString()}</div>
                </div>
                <div className="pt-2 border-t border-[#1e293b]">
                  <Link
                    to={`/dashboard/scans/${port.scanHost.scan.id}`}
                    className="text-xs text-[#6366f1] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    View Ingest Details
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#475569] italic">Ingest logs unavailable.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortDetailsPage;
