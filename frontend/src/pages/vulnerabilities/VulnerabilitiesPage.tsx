import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as vulnerabilityService from '../../services/vulnerabilityService';
import type { Vulnerability } from '../../types/vulnerability';

const getSeverityBadgeClass = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/10 border-red-500/30 text-red-400 font-extrabold animate-pulse';
    case 'HIGH':
      return 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold';
    case 'MEDIUM':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'LOW':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'INFO':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    default:
      return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'CONFIRMED':
      return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    case 'MITIGATED':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'FALSE_POSITIVE':
      return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    case 'ACCEPTED_RISK':
      return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    default:
      return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }
};

export const VulnerabilitiesPage: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');

  const fetchVulnerabilities = async () => {
    setIsLoading(true);
    try {
      const data = await vulnerabilityService.getVulnerabilities({
        severity: severity || undefined,
        status: status || undefined,
        page,
        limit,
      });

      let filtered = data.vulnerabilities;
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((v) => {
          const title = v.title.toLowerCase();
          const cve = (v.cveId || '').toLowerCase();
          const host = v.service?.host?.ipAddress || '';
          const asset = v.service?.host?.asset?.hostname || '';
          return (
            title.includes(q) ||
            cve.includes(q) ||
            host.toLowerCase().includes(q) ||
            asset.toLowerCase().includes(q)
          );
        });
      }

      setVulnerabilities(filtered);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load vulnerabilities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, [page, severity, status]);

  const resetFilters = () => {
    setSearch('');
    setSeverity('');
    setStatus('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">
          Vulnerability Intelligence
        </h1>
        <p className="text-sm text-[#94a3b8]">
          Review discovered vulnerabilities across all monitored services and assets.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search CVE, title, IP, hostname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchVulnerabilities()}
              className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2 text-sm text-[#f8fafc] outline-none transition-colors"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
          >
            <option value="">Severity (All)</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
          >
            <option value="">Status (All)</option>
            <option value="OPEN">Open</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="MITIGATED">Mitigated</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="ACCEPTED_RISK">Accepted Risk</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={resetFilters}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:bg-[#334155] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
          <button
            onClick={fetchVulnerabilities}
            className="px-5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0b0f19]/30 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                <th className="px-6 py-4">CVE ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">CVSS</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Asset / Host</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-sm text-[#94a3b8]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
                  </td>
                </tr>
              ) : vulnerabilities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#475569]">
                    No vulnerabilities discovered matching current criteria.
                  </td>
                </tr>
              ) : (
                vulnerabilities.map((v) => (
                  <tr key={v.id} className="hover:bg-[#1e293b]/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {v.cveId ? (
                        <span className="text-[#6366f1] font-bold">{v.cveId}</span>
                      ) : (
                        <span className="text-[#475569]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-[#f8fafc] truncate" title={v.title}>
                        {v.title}
                      </p>
                      <p className="text-xs text-[#475569] truncate mt-0.5" title={v.description}>
                        {v.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(v.severity)}`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {v.cvssScore ? (
                        <span className="font-bold text-[#f8fafc]">{v.cvssScore}</span>
                      ) : (
                        <span className="text-[#475569]">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(v.status)}`}>
                        {v.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {v.service ? (
                        <span className="text-[#f8fafc]">
                          {v.service.name} / {v.service.port}
                        </span>
                      ) : (
                        <span className="text-[#475569]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {v.service?.host?.asset ? (
                        <Link
                          to={`/dashboard/assets`}
                          className="font-bold text-[#6366f1] hover:underline"
                        >
                          {v.service.host.asset.hostname}
                        </Link>
                      ) : (
                        <span className="text-[#94a3b8] font-mono text-xs">
                          {v.service?.host?.ipAddress || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        to={`/dashboard/vulnerabilities/${v.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] text-[#f8fafc] hover:bg-[#334155] transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#1e293b] bg-[#0b0f19]/20 px-6 py-4">
            <span className="text-xs text-[#475569]">
              Showing{' '}
              <span className="text-[#f8fafc] font-semibold">{(page - 1) * limit + 1}</span> to{' '}
              <span className="text-[#f8fafc] font-semibold">{Math.min(page * limit, total)}</span> of{' '}
              <span className="text-[#f8fafc] font-semibold">{total}</span> results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:bg-[#334155] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:bg-[#334155] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VulnerabilitiesPage;
