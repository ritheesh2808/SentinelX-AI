import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as assetService from '../../services/assetService';
import type { AssetStats } from '../../types/asset';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await assetService.getAssetStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to retrieve dashboard statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Assets',
      value: isLoading ? '...' : stats?.total ?? 0,
      color: 'text-[#6366f1] border-[#6366f1]/20 bg-[#6366f1]/5',
      trend: 'Registered nodes',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Online Assets',
      value: isLoading ? '...' : stats?.online ?? 0,
      color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
      trend: 'Reporting active status',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622" />
        </svg>
      ),
    },
    {
      title: 'Offline Assets',
      value: isLoading ? '...' : stats?.offline ?? 0,
      color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
      trend: 'Reporting inactive status',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: 'Critical Assets',
      value: isLoading ? '...' : stats?.critical ?? 0,
      color: 'text-red-500 border-red-500/20 bg-red-500/5',
      trend: 'Priority security scope',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  // Mock activity logs for SOC dashboard
  const activities = [
    {
      id: 1,
      time: '10 mins ago',
      type: 'Scan Completed',
      event: 'AI vulnerability audit run successfully on node-srv-4.',
      operator: 'SentinelX Agent',
      status: 'success',
    },
    {
      id: 2,
      time: '1 hour ago',
      type: 'Authentication',
      event: `Operator session initialized successfully. IP recorded: 127.0.0.1`,
      operator: user?.fullName || 'Operator',
      status: 'info',
    },
    {
      id: 3,
      time: '3 hours ago',
      type: 'Rule Alert',
      event: 'Failed password login attempt detected from 192.168.1.103',
      operator: 'Security Daemon',
      status: 'warning',
    },
    {
      id: 4,
      time: '6 hours ago',
      type: 'Configuration',
      event: 'JWT policy secrets successfully validated and verified.',
      operator: 'System Core',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#131c2e] p-6 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 blur-2xl"></div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f8fafc] mb-1">
            Welcome back, {user?.fullName || 'Operator'}
          </h1>
          <p className="text-sm text-[#94a3b8]">
            Operator Email: <span className="font-semibold text-[#f8fafc]">{user?.email}</span> &bull; Security Level: <span className="font-bold text-[#6366f1]">Level 1 Admin</span>
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div>
        <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">
          Control Center Statistics
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-xl border p-5 transition-all hover:scale-[1.01] ${stat.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                  {stat.title}
                </span>
                <span className="opacity-80">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#f8fafc]">
                {stat.value}
              </div>
              <div className="mt-2 text-xs text-[#94a3b8]">
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of details: Logs & Info */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Security Activities log */}
        <div className="lg:col-span-2 rounded-2xl border border-[#1e293b] bg-[#131c2e] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
              Recent Security Activities
            </h3>
            <span className="text-[10px] bg-[#1e293b] border border-[#334155] text-[#94a3b8] px-2 py-0.5 rounded uppercase font-bold tracking-widest">
              Live Feed
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start p-4 rounded-xl bg-[#0b0f19] border border-[#1e293b]"
              >
                {/* Visual Status Indicator dot */}
                <div className="mt-1">
                  {act.status === 'success' && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></span>
                  )}
                  {act.status === 'info' && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#6366f1] ring-4 ring-[#6366f1]/10"></span>
                  )}
                  {act.status === 'warning' && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10"></span>
                  )}
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#f8fafc]">{act.type}</span>
                    <span className="text-[10px] text-[#475569]">{act.time}</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-1.5">{act.event}</p>
                  <div className="text-[10px] text-[#475569]">
                    Origin Operator: <span className="text-[#94a3b8]">{act.operator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Core Info */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#131c2e] p-6 space-y-6">
          <h3 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
            Agent Cluster Context
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Core Temperature</span>
                <span className="text-emerald-400 font-bold">42°C (Optimal)</span>
              </div>
              <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                <div className="h-full w-[42%] bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Disk Allocation</span>
                <span className="text-[#6366f1] font-bold">24.5 GB / 100 GB</span>
              </div>
              <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                <div className="h-full w-[24.5%] bg-[#6366f1] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Active Network Channels</span>
                <span className="text-[#a855f7] font-bold">12 / 16 Nodes</span>
              </div>
              <div className="h-1.5 w-full bg-[#0b0f19] rounded-full overflow-hidden">
                <div className="h-full w-[75%] bg-[#a855f7] rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e293b] pt-4 text-xs text-[#475569] space-y-2">
            <div>
              Platform Build ID: <span className="text-[#94a3b8] font-mono">v1.0.0-sprint-07</span>
            </div>
            <div>
              Database Health: <span className="text-emerald-500 font-bold">CONNECTED</span>
            </div>
            <div>
              Node Registry: <span className="text-[#94a3b8] font-mono">US-EAST-1 (VIRTUALIZED)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
