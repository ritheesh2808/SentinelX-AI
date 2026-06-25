import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as portService from '../../services/portService';
import type { Port } from '../../types/port';

export const PortsPage: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [service, setService] = useState('');
  const [state, setState] = useState('');
  const [risk, setRisk] = useState('');
  const [protocol, setProtocol] = useState('');

  const fetchPorts = async () => {
    setIsLoading(true);
    try {
      const data = await portService.getPorts({
        service: service || undefined,
        state: state || undefined,
        risk: risk || undefined,
        protocol: protocol || undefined,
        page,
        limit,
      });

      // Simple client-side search filter by ipAddress / hostname / product / version
      let filteredPorts = data.ports;
      if (search.trim()) {
        const query = search.toLowerCase();
        filteredPorts = filteredPorts.filter((p) => {
          const ip = p.scanHost?.ipAddress || '';
          const hostname = p.scanHost?.hostname || '';
          const prod = p.product || '';
          const ver = p.version || '';
          const srv = p.service || '';
          const portNum = String(p.portNumber);
          return (
            ip.toLowerCase().includes(query) ||
            hostname.toLowerCase().includes(query) ||
            prod.toLowerCase().includes(query) ||
            ver.toLowerCase().includes(query) ||
            srv.toLowerCase().includes(query) ||
            portNum.includes(query)
          );
        });
      }

      setPorts(filteredPorts);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load ports list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, [page, service, state, risk, protocol]);

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setService('');
    setState('');
    setRisk('');
    setProtocol('');
    setPage(1);
  };

  // Casing mapping helper
  const getRiskBadgeClass = (riskLevel: string) => {
    const r = riskLevel.toLowerCase();
    switch (r) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400 font-extrabold animate-pulse';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold';
      case 'medium':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'informational':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  const getPortStateClass = (portState: string) => {
    const s = portState.toLowerCase();
    if (s === 'open') {
      return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    }
    return 'text-[#94a3b8] bg-[#1e293b] border border-[#334155]';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">Port & Service Registry</h1>
        <p className="text-sm text-[#94a3b8]">Review discovered ports, active network endpoints, and their associated risks.</p>
      </div>

      {/* Filter Row */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search IP, Hostname, Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPorts()}
              className="w-full bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-2 text-sm text-[#f8fafc] outline-none transition-colors"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={risk}
            onChange={(e) => {
              setRisk(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
          >
            <option value="">Risk Level (All)</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Informational">Informational</option>
            <option value="Unknown">Unknown</option>
          </select>

          {/* Protocol Filter */}
          <select
            value={protocol}
            onChange={(e) => {
              setProtocol(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
          >
            <option value="">Protocol (All)</option>
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
          </select>

          {/* State Filter */}
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
          >
            <option value="">State (All)</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="filtered">Filtered</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Service filter tag */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filter by Service (e.g. http)"
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                setPage(1);
              }}
              className="bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-[#94a3b8] outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:bg-[#334155] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={fetchPorts}
              className="px-5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0b0f19]/30 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                <th className="px-6 py-4">Port / Protocol</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Version & Product</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Asset Node</th>
                <th className="px-6 py-4">Import Log</th>
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
              ) : ports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#475569]">
                    No ports discovered matching current criteria.
                  </td>
                </tr>
              ) : (
                ports.map((port) => (
                  <tr key={port.id} className="hover:bg-[#1e293b]/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#f8fafc] font-mono">
                      {port.portNumber} / <span className="text-[#6366f1]">{port.protocol.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getPortStateClass(port.state)}`}>
                        {port.state.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#f8fafc] font-medium font-mono">
                      {port.service}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {port.product ? (
                        <span className="text-[#f8fafc] font-semibold">{port.product} <span className="text-[#475569]">{port.version}</span></span>
                      ) : (
                        <span className="text-[#475569] font-mono">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getRiskBadgeClass(port.riskLevel)}`}>
                        {port.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {port.scanHost?.asset ? (
                        <Link
                          to={`/dashboard/assets`}
                          className="font-bold text-[#6366f1] hover:underline"
                        >
                          {port.scanHost.asset.hostname}
                        </Link>
                      ) : (
                        <span className="text-[#94a3b8] font-mono">{port.scanHost?.ipAddress}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs truncate max-w-[120px]">
                      {port.scanHost?.scan ? (
                        <Link to={`/dashboard/scans/${port.scanHost.scan.id}`} className="hover:underline text-[#94a3b8] font-mono">
                          {port.scanHost.scan.filename}
                        </Link>
                      ) : (
                        <span className="text-[#475569] font-mono">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        to={`/dashboard/ports/${port.id}`}
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

        {/* Pagination bar */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#1e293b] bg-[#0b0f19]/20 px-6 py-4">
            <span className="text-xs text-[#475569]">
              Showing <span className="text-[#f8fafc] font-semibold">{(page - 1) * limit + 1}</span> to <span className="text-[#f8fafc] font-semibold">{Math.min(page * limit, total)}</span> of <span className="text-[#f8fafc] font-semibold">{total}</span> results
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

export default PortsPage;
