import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as portService from '../../services/portService';
import * as assetService from '../../services/assetService';
import type { Port } from '../../types/port';
import type { Asset } from '../../types/asset';

export const AssetPortsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [service, setService] = useState('');
  const [state, setState] = useState('');
  const [risk, setRisk] = useState('');
  const [protocol, setProtocol] = useState('');

  useEffect(() => {
    const loadAssetAndPorts = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [assetData, portsData] = await Promise.all([
          assetService.getAssetById(id),
          portService.getAssetPorts(id, {
            service: service || undefined,
            state: state || undefined,
            risk: risk || undefined,
            protocol: protocol || undefined,
            page,
            limit,
          }),
        ]);

        setAsset(assetData);
        setPorts(portsData.ports);
        setTotal(portsData.total);
      } catch (err) {
        console.error('Failed to load asset ports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssetAndPorts();
  }, [id, page, service, state, risk, protocol]);

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/dashboard/assets')}
          className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#f8fafc] font-semibold transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assets
        </button>
      </div>

      {/* Asset Header Info */}
      {asset && (
        <div className="rounded-2xl border border-[#1e293b] bg-[#131c2e] p-6 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-[#6366f1]/5 to-[#a855f7]/5 blur-xl"></div>
          <div>
            <span className="text-[10px] bg-[#1e293b] border border-[#334155] text-[#94a3b8] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
              Asset Inventory Node
            </span>
            <h1 className="text-2xl font-bold text-[#f8fafc] mt-2 mb-1">
              {asset.hostname}
            </h1>
            <p className="text-xs text-[#94a3b8]">
              IP: <span className="font-mono text-[#f8fafc] font-semibold">{asset.ipAddress}</span> &bull; OS: <span className="font-semibold text-[#f8fafc]">{asset.operatingSystem || 'Unknown'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-5 shadow-xl grid gap-4 md:grid-cols-4">
        {/* Risk Filter */}
        <select
          value={risk}
          onChange={(e) => {
            setRisk(e.target.value);
            setPage(1);
          }}
          className="bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
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
          className="bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
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
          className="bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
        >
          <option value="">State (All)</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="filtered">Filtered</option>
        </select>

        {/* Service filter input */}
        <input
          type="text"
          placeholder="Filter by Service (e.g. ssh)"
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setPage(1);
          }}
          className="bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] outline-none"
        />
      </div>

      {/* Ports Table */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0b0f19]/30 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                <th className="px-6 py-4">Port / Protocol</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Product & Version</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-sm text-[#94a3b8]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"></div>
                  </td>
                </tr>
              ) : ports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#475569]">
                    No ports discovered on this asset node matching the criteria.
                  </td>
                </tr>
              ) : (
                ports.map((port) => (
                  <tr key={port.id} className="hover:bg-[#1e293b]/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#f8fafc] font-mono">
                      {port.portNumber} / <span className="text-[#6366f1]">{port.protocol.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${
                        port.state === 'open' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-[#94a3b8] bg-[#1e293b] border border-[#334155]'
                      }`}>
                        {port.state.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#f8fafc] font-medium font-mono">
                      {port.service}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">
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

        {/* Pagination */}
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

export default AssetPortsPage;
