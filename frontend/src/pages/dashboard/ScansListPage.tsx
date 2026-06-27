import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import * as scanService from '../../services/scanService';
import { useAuth } from '../../hooks/useAuth';
import { LiveScanTracker } from '../ai/LiveScanTracker';
import type { Scan } from '../../types/scan';

interface DashboardOutletContext {
  activeScan: { progress: number; stage: string; target: string } | null;
  handleTriggerScan: (target: string) => Promise<void>;
  isTriggeringScan: boolean;
}

export const ScansListPage: React.FC = () => {
  const { user } = useAuth();
  const { activeScan, handleTriggerScan, isTriggeringScan } =
    useOutletContext<DashboardOutletContext>();
  
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadScans = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await scanService.getScans();
      setScans(data);
    } catch (err: any) {
      console.error('Failed to load scans:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to retrieve scan records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const openDeleteDialog = (scan: Scan) => {
    setSelectedScan(scan);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedScan) return;
    setIsDeleting(true);
    try {
      await scanService.deleteScan(selectedScan.id);
      setIsDeleteOpen(false);
      loadScans();
    } catch (err: any) {
      console.error('Failed to delete scan:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to delete scan report.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">Scan Reports</h1>
          <p className="text-sm text-[#94a3b8]">Review imported scanner logs, target host discovery, and network maps.</p>
        </div>
        <Link
          to="/dashboard/scans/import"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-4 py-2.5 text-sm font-semibold text-[#f8fafc] shadow-lg shadow-[#6366f1]/20 hover:opacity-95 cursor-pointer transition-all shrink-0"
        >
          <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Nmap Scan
        </Link>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      <LiveScanTracker
        activeScan={activeScan}
        onTriggerScan={handleTriggerScan}
        isTriggering={isTriggeringScan}
      />

      {/* Scans Table */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-[#94a3b8]">
            <thead className="bg-[#0f1626] border-b border-[#1e293b] text-xs font-semibold text-[#f8fafc] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Filename</th>
                <th className="px-6 py-4">Scanner Tool</th>
                <th className="px-6 py-4">Imported By</th>
                <th className="px-6 py-4">Import Date</th>
                <th className="px-6 py-4">Hosts Discovered</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-[#1e293b] rounded w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-[#1e293b] rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : scans.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#475569]">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#1e293b] text-[#475569] mb-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">No scan reports indexed yet</p>
                    <p className="text-xs mt-1">Upload an Nmap XML log file to begin mapping system environments.</p>
                  </td>
                </tr>
              ) : (
                // Data list
                scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#1a253c]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#f8fafc] font-mono text-xs max-w-xs truncate">
                      {scan.filename}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase text-[#6366f1]">
                      {scan.scanner}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {user?.fullName || 'Operator'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(scan.importedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-xs">
                      {scan._count?.scanHosts ?? 0} hosts
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        scan.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        scan.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex space-x-3">
                        <Link
                          to={`/dashboard/scans/${scan.id}`}
                          className="p-1 text-[#94a3b8] hover:text-[#6366f1] transition-colors cursor-pointer"
                          title="Open Details"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openDeleteDialog(scan)}
                          className="p-1 text-[#94a3b8] hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {isDeleteOpen && selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#131c2e] p-6 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

            <div className="flex items-center space-x-3 mb-4">
              <span className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-[#f8fafc]">Confirm Delete Report</h3>
            </div>

            <p className="text-xs text-[#94a3b8] mb-6 leading-relaxed">
              Are you sure you want to remove scan report <span className="font-bold text-[#f8fafc] font-mono">{selectedScan.filename}</span>?
              Removing this report will delete all discovered host mappings immediately.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#0b0f19] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScansListPage;
