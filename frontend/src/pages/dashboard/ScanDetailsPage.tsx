import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as scanService from '../../services/scanService';
import type { Scan, ScanHost } from '../../types/scan';

export const ScanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [scan, setScan] = useState<Scan | null>(null);
  const [hosts, setHosts] = useState<ScanHost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const [scanData, hostsData] = await Promise.all([
          scanService.getScanById(id),
          scanService.getScanHosts(id),
        ]);
        setScan(scanData);
        setHosts(hostsData);
      } catch (err: any) {
        console.error('Failed to load scan details:', err);
        setErrorMsg(err.response?.data?.error || 'Failed to retrieve scan details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  // Utility to format duration
  const getDuration = (start: string | null, end: string | null): string => {
    if (!start || !end) return 'Unknown';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMs = e - s;
    if (diffMs <= 0 || isNaN(diffMs)) return '0s';
    
    const seconds = Math.floor(diffMs / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-6 bg-[#131c2e] rounded w-64"></div>
        <div className="h-24 bg-[#131c2e] rounded w-full"></div>
        <div className="h-40 bg-[#131c2e] rounded w-full"></div>
      </div>
    );
  }

  if (errorMsg || !scan) {
    return (
      <div className="space-y-6 text-left">
        <Link to="/dashboard/scans" className="text-sm font-semibold text-[#6366f1] hover:underline flex items-center">
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reports
        </Link>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {errorMsg || 'Scan report details are unavailable.'}
        </div>
      </div>
    );
  }

  const linkedCount = hosts.filter((h) => h.assetId).length;
  const unlinkedCount = hosts.length - linkedCount;

  return (
    <div className="space-y-8 text-left">
      {/* Back button */}
      <div>
        <Link to="/dashboard/scans" className="text-sm font-semibold text-[#94a3b8] hover:text-[#f8fafc] flex items-center transition-colors">
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Scan Reports
        </Link>
      </div>

      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1 font-mono text-base truncate max-w-2xl">
          {scan.filename}
        </h1>
        <p className="text-xs text-[#94a3b8]">
          Report Unique ID: <span className="font-mono text-[#f8fafc]">{scan.id}</span>
        </p>
      </div>

      {/* Metadata layout grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Core Stats card */}
        <div className="md:col-span-2 bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-[#475569] font-bold uppercase tracking-wider mb-0.5">Scanner Engine</div>
            <div className="text-sm font-semibold text-[#f8fafc]">{scan.scanner}</div>
          </div>
          <div>
            <div className="text-xs text-[#475569] font-bold uppercase tracking-wider mb-0.5">Time Elapsed</div>
            <div className="text-sm font-semibold text-[#f8fafc]">
              {getDuration(scan.startTime, scan.endTime)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#475569] font-bold uppercase tracking-wider mb-0.5">Start Time</div>
            <div className="text-sm font-semibold text-[#f8fafc]">
              {scan.startTime ? new Date(scan.startTime).toLocaleString() : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#475569] font-bold uppercase tracking-wider mb-0.5">End Time</div>
            <div className="text-sm font-semibold text-[#f8fafc]">
              {scan.endTime ? new Date(scan.endTime).toLocaleString() : 'N/A'}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-[#475569] font-bold uppercase tracking-wider mb-1">Execution Arguments</div>
            <div className="text-xs font-mono bg-[#0b0f19] border border-[#1e293b] rounded-lg p-2.5 text-[#f8fafc] overflow-x-auto whitespace-pre">
              {scan.scanArguments || 'None provided'}
            </div>
          </div>
        </div>

        {/* Summary side card */}
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#f8fafc] uppercase tracking-wider mb-4">Correlation Summary</h3>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]">
              <span className="text-xs text-[#94a3b8]">Discovered Hosts</span>
              <span className="text-sm font-bold text-[#f8fafc]">{hosts.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]">
              <span className="text-xs text-[#94a3b8]">Linked to Assets</span>
              <span className="text-sm font-bold text-emerald-400">{linkedCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e293b]">
              <span className="text-xs text-[#94a3b8]">New Host Targets</span>
              <span className="text-sm font-bold text-[#6366f1]">{unlinkedCount}</span>
            </div>
          </div>
          <div className="mt-6 text-[10px] text-[#475569] text-center leading-relaxed">
            Linked assets correspond to hosts matching pre-existing inventory IP addresses.
          </div>
        </div>
      </div>

      {/* Discovered Hosts Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest">Discovered Network Targets</h3>
        
        <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-[#94a3b8]">
              <thead className="bg-[#0f1626] border-b border-[#1e293b] text-xs font-semibold text-[#f8fafc] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Hostname</th>
                  <th className="px-6 py-4">MAC Address</th>
                  <th className="px-6 py-4">Hardware Vendor</th>
                  <th className="px-6 py-4">Operating System</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Asset Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {hosts.map((host) => (
                  <tr key={host.id} className="hover:bg-[#1a253c]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-[#f8fafc]">{host.ipAddress}</td>
                    <td className="px-6 py-4 font-mono text-xs">{host.hostname || '--'}</td>
                    <td className="px-6 py-4 font-mono text-xs">{host.macAddress || '--'}</td>
                    <td className="px-6 py-4 text-xs">{host.vendor || '--'}</td>
                    <td className="px-6 py-4 text-xs">{host.operatingSystem || 'Not Scanned'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        host.state === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {host.state}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {host.asset ? (
                        <Link
                          to="/dashboard/assets"
                          className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          title={`Linked: ${host.asset.hostname}`}
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Linked
                        </Link>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                          Unlinked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanDetailsPage;
