import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as assetService from '../../services/assetService';
import type { Asset, AssetType, AssetCriticality, AssetStatus, CreateAssetInput } from '../../types/asset';

export const AssetsPage: React.FC = () => {
  // Lists and stats states
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Dialog overlays state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form states
  const [formHostname, setFormHostname] = useState('');
  const [formIpAddress, setFormIpAddress] = useState('');
  const [formOS, setFormOS] = useState('');
  const [formAssetType, setFormAssetType] = useState<AssetType>('ENDPOINT');
  const [formCriticality, setFormCriticality] = useState<AssetCriticality>('MEDIUM');
  const [formEnvironment, setFormEnvironment] = useState('Production');
  const [formStatus, setFormStatus] = useState<AssetStatus>('ONLINE');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ hostname?: string; ipAddress?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load assets
  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await assetService.getAssets({
        search: search || undefined,
        assetType: selectedType || undefined,
        status: selectedStatus || undefined,
        criticality: selectedCriticality || undefined,
        page,
        limit,
      });
      setAssets(data.assets);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Failed to load assets:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to retrieve asset list. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedType, selectedStatus, selectedCriticality, page]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Handle Search and Filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (filterType: 'type' | 'status' | 'criticality', value: string) => {
    if (filterType === 'type') setSelectedType(value);
    if (filterType === 'status') setSelectedStatus(value);
    if (filterType === 'criticality') setSelectedCriticality(value);
    setPage(1);
  };

  // Validate form fields
  const validateForm = (hostname: string, ip: string) => {
    const errors: typeof formErrors = {};
    if (!hostname.trim()) {
      errors.hostname = 'Hostname is required';
    }

    if (!ip.trim()) {
      errors.ipAddress = 'IP Address is required';
    } else {
      const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
      if (!ipv4Pattern.test(ip) && !ipv6Pattern.test(ip)) {
        errors.ipAddress = 'Invalid IP address format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Dialog
  const openAddDialog = () => {
    setFormHostname('');
    setFormIpAddress('');
    setFormOS('');
    setFormAssetType('ENDPOINT');
    setFormCriticality('MEDIUM');
    setFormEnvironment('Production');
    setFormStatus('ONLINE');
    setFormNotes('');
    setFormErrors({});
    setIsAddOpen(true);
  };

  // Handle Add Asset Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!validateForm(formHostname, formIpAddress)) return;

    setIsSubmitting(true);
    try {
      const input: CreateAssetInput = {
        hostname: formHostname,
        ipAddress: formIpAddress,
        operatingSystem: formOS || undefined,
        assetType: formAssetType,
        criticality: formCriticality,
        environment: formEnvironment,
        status: formStatus,
        notes: formNotes || undefined,
      };

      await assetService.createAsset(input);
      setIsAddOpen(false);
      loadAssets();
    } catch (err: any) {
      console.error('Failed to create asset:', err);
      const serverMessage = err.response?.data?.error || 'Failed to create asset.';
      setFormErrors({ general: serverMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Dialog
  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormHostname(asset.hostname);
    setFormIpAddress(asset.ipAddress);
    setFormOS(asset.operatingSystem || '');
    setFormAssetType(asset.assetType);
    setFormCriticality(asset.criticality);
    setFormEnvironment(asset.environment);
    setFormStatus(asset.status);
    setFormNotes(asset.notes || '');
    setFormErrors({});
    setIsEditOpen(true);
  };

  // Handle Edit Asset Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!selectedAsset) return;
    if (!validateForm(formHostname, formIpAddress)) return;

    setIsSubmitting(true);
    try {
      const input = {
        hostname: formHostname,
        ipAddress: formIpAddress,
        operatingSystem: formOS || undefined,
        assetType: formAssetType,
        criticality: formCriticality,
        environment: formEnvironment,
        status: formStatus,
        notes: formNotes || undefined,
      };

      await assetService.updateAsset(selectedAsset.id, input);
      setIsEditOpen(false);
      loadAssets();
    } catch (err: any) {
      console.error('Failed to update asset:', err);
      const serverMessage = err.response?.data?.error || 'Failed to update asset.';
      setFormErrors({ general: serverMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Dialog
  const openDeleteDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteOpen(true);
  };

  // Handle Delete Asset
  const handleDeleteConfirm = async () => {
    if (!selectedAsset) return;
    setIsSubmitting(true);
    try {
      await assetService.deleteAsset(selectedAsset.id);
      setIsDeleteOpen(false);
      loadAssets();
    } catch (err: any) {
      console.error('Failed to delete asset:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to delete asset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 text-left">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">Asset Inventory</h1>
          <p className="text-sm text-[#94a3b8]">Register and manage network hosts, servers, and endpoint devices.</p>
        </div>
        <button
          onClick={openAddDialog}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-4 py-2.5 text-sm font-semibold text-[#f8fafc] shadow-lg shadow-[#6366f1]/20 hover:opacity-95 cursor-pointer transition-all shrink-0"
        >
          <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Register Asset
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid gap-4 md:grid-cols-4 bg-[#131c2e] p-5 rounded-2xl border border-[#1e293b]">
        {/* Search Hostname/IP */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-3 flex items-center text-[#475569]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by hostname or IP address..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] placeholder:text-[#475569] outline-none focus:border-[#6366f1] transition-all"
          />
        </div>

        {/* Filter by Type */}
        <select
          value={selectedType}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-2.5 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1] transition-all cursor-pointer"
        >
          <option value="">All Asset Types</option>
          <option value="NETWORK">Network Device</option>
          <option value="WEB_APPLICATION">Web Application</option>
          <option value="CLOUD_ACCOUNT">Cloud Account</option>
          <option value="ENDPOINT">Endpoint System</option>
          <option value="API">API Endpoint</option>
        </select>

        {/* Filter by Status */}
        <select
          value={selectedStatus}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2.5 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1] transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Main Table view */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-[#94a3b8]">
            <thead className="bg-[#0f1626] border-b border-[#1e293b] text-xs font-semibold text-[#f8fafc] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Hostname</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Asset Type</th>
                <th className="px-6 py-4">OS</th>
                <th className="px-6 py-4">Criticality</th>
                <th className="px-6 py-4">Environment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {isLoading ? (
                // Table Loading State
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-[#1e293b] rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#1e293b] rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-[#1e293b] rounded w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-[#1e293b] rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : assets.length === 0 ? (
                // Table Empty State
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#475569]">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#1e293b] text-[#475569] mb-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">No assets registered yet</p>
                    <p className="text-xs mt-1">Register hosts to configure scanning profiles.</p>
                  </td>
                </tr>
              ) : (
                // Data List State
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#1a253c]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#f8fafc]">{asset.hostname}</td>
                    <td className="px-6 py-4 font-mono text-xs">{asset.ipAddress}</td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      {asset.assetType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-xs">{asset.operatingSystem || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        asset.criticality === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        asset.criticality === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        asset.criticality === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{asset.environment}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        asset.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' :
                        asset.status === 'OFFLINE' ? 'bg-red-500/10 text-red-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          asset.status === 'ONLINE' ? 'bg-emerald-400' :
                          asset.status === 'OFFLINE' ? 'bg-red-400' :
                          'bg-slate-400'
                        }`}></span>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex space-x-2">
                        <Link
                          to={`/dashboard/assets/${asset.id}/ports`}
                          className="p-1 text-[#94a3b8] hover:text-[#a855f7] transition-colors cursor-pointer inline-flex items-center"
                          title="View Ports & Services"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openEditDialog(asset)}
                          className="p-1 text-[#94a3b8] hover:text-[#6366f1] transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteDialog(asset)}
                          className="p-1 text-[#94a3b8] hover:text-red-400 transition-colors cursor-pointer"
                          title="De-register Asset"
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

        {/* Pagination Toolbar */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#0f1626] border-t border-[#1e293b]">
            <div className="text-xs text-[#475569]">
              Showing page <span className="font-bold text-[#94a3b8]">{page}</span> of <span className="font-bold text-[#94a3b8]">{totalPages}</span> &bull; Total records: <span className="font-bold text-[#94a3b8]">{total}</span>
            </div>
            <div className="inline-flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-[#131c2e] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-[#131c2e] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Register Modal Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#1e293b] bg-[#131c2e] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#f8fafc] mb-1">Register Host System</h3>
            <p className="text-xs text-[#94a3b8] mb-4">Input details to index host under security scanning scopes.</p>

            {formErrors.general && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Hostname *</label>
                  <input
                    type="text"
                    value={formHostname}
                    onChange={(e) => setFormHostname(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                    placeholder="e.g. database-srv-1"
                  />
                  {formErrors.hostname && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.hostname}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">IP Address *</label>
                  <input
                    type="text"
                    value={formIpAddress}
                    onChange={(e) => setFormIpAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                    placeholder="e.g. 192.168.1.50"
                  />
                  {formErrors.ipAddress && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.ipAddress}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Operating System</label>
                  <input
                    type="text"
                    value={formOS}
                    onChange={(e) => setFormOS(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                    placeholder="e.g. Ubuntu 22.04 LTS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Environment</label>
                  <input
                    type="text"
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                    placeholder="e.g. Staging, Production"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Asset Type</label>
                  <select
                    value={formAssetType}
                    onChange={(e) => setFormAssetType(e.target.value as AssetType)}
                    className="w-full px-2 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] cursor-pointer"
                  >
                    <option value="NETWORK">Network Device</option>
                    <option value="WEB_APPLICATION">Web App</option>
                    <option value="CLOUD_ACCOUNT">Cloud Account</option>
                    <option value="ENDPOINT">Endpoint</option>
                    <option value="API">API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Criticality</label>
                  <select
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as AssetCriticality)}
                    className="w-full px-2 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] cursor-pointer"
                  >
                    <option value="INFO">Info</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                    className="w-full px-2 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] cursor-pointer"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1] h-20 resize-none"
                  placeholder="Additional metadata, owner name..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0b0f19] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] cursor-pointer disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal Dialog */}
      {isEditOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#1e293b] bg-[#131c2e] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#f8fafc] mb-1">Edit Asset Registry</h3>
            <p className="text-xs text-[#94a3b8] mb-4">Modify configuration attributes for indexing profile.</p>

            {formErrors.general && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Hostname *</label>
                  <input
                    type="text"
                    value={formHostname}
                    onChange={(e) => setFormHostname(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                  />
                  {formErrors.hostname && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.hostname}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">IP Address *</label>
                  <input
                    type="text"
                    value={formIpAddress}
                    onChange={(e) => setFormIpAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                  />
                  {formErrors.ipAddress && <p className="text-[10px] text-red-400 mt-0.5">{formErrors.ipAddress}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Operating System</label>
                  <input
                    type="text"
                    value={formOS}
                    onChange={(e) => setFormOS(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Environment</label>
                  <input
                    type="text"
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Asset Type</label>
                  <select
                    value={formAssetType}
                    onChange={(e) => setFormAssetType(e.target.value as AssetType)}
                    className="w-full px-2 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] cursor-pointer"
                  >
                    <option value="NETWORK">Network Device</option>
                    <option value="WEB_APPLICATION">Web App</option>
                    <option value="CLOUD_ACCOUNT">Cloud Account</option>
                    <option value="ENDPOINT">Endpoint</option>
                    <option value="API">API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Criticality</label>
                  <select
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as AssetCriticality)}
                    className="w-full px-2 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] cursor-pointer"
                  >
                    <option value="INFO">Info</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                    className="w-full px-2 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] cursor-pointer"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#0b0f19] border border-[#1e293b] rounded-xl text-[#f8fafc] outline-none focus:border-[#6366f1] h-20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0b0f19] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] cursor-pointer disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {isDeleteOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#131c2e] p-6 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

            <div className="flex items-center space-x-3 mb-4">
              <span className="p-2 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-[#f8fafc]">Confirm De-registration</h3>
            </div>

            <p className="text-xs text-[#94a3b8] mb-6 leading-relaxed">
              Are you sure you want to remove host <span className="font-bold text-[#f8fafc] font-mono">{selectedAsset.hostname}</span> (<span className="text-[#f8fafc] font-mono text-[11px]">{selectedAsset.ipAddress}</span>)?
              This action is destructive and will delete all scan associations immediately.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#0b0f19] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
