import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationDrawer } from '../pages/ai/NotificationDrawer';
import * as aiService from '../services/aiService';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Real-time states (Sprint 13)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<aiService.NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeScan, setActiveScan] = useState<{ progress: number; stage: string; target: string } | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; type: string; title: string; message: string }>>([]);
  const [isTriggeringScan, setIsTriggeringScan] = useState(false);

  const addToast = (type: string, title: string, message: string) => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadNotifications = useCallback(async () => {
    try {
      const data = await aiService.getNotifications();
      setNotifications(data.list);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  const loadActiveScan = useCallback(async () => {
    try {
      const data = await aiService.getActiveScan();
      setActiveScan(data.activeScan);
    } catch (err) {
      console.error('Failed to query active scan:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadActiveScan();
    }
  }, [user, loadNotifications, loadActiveScan]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const sseUrl = `${apiBase}/api/v1/ai/soc-events?token=${token}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { eventName, data } = payload;

        if (payload.type === 'connected') {
          return;
        }

        if (eventName === 'scan:progress') {
          const progressPayload = data as { progress: number; stage: string; target: string };
          if (progressPayload.progress >= 100) {
            setActiveScan(null);
            // Notify other components by dispatching custom event if needed
            window.dispatchEvent(new CustomEvent('scan:completed', { detail: progressPayload }));
          } else {
            setActiveScan(progressPayload);
          }
        } else if (eventName === 'notification:added') {
          const item = data as aiService.NotificationItem;
          setNotifications((prev) => [item, ...prev]);
          setUnreadCount((c) => c + 1);
          addToast(item.type, item.title, item.message);
        } else if (eventName === 'incident:created') {
          addToast('CRITICAL', 'SOC Incident Escalated', `Automated incident created: ${data.title}`);
          window.dispatchEvent(new CustomEvent('incident:created', { detail: data }));
        } else if (eventName === 'vulnerability:discovered') {
          addToast('WARNING', 'Threat Identified', `Discovered new threat: ${data.title}`);
          window.dispatchEvent(new CustomEvent('vulnerability:discovered', { detail: data }));
        } else if (eventName === 'host:discovered') {
          addToast('INFO', 'Asset Discovered', `New target identified: ${data.hostname} (${data.ipAddress})`);
        } else if (eventName === 'port:discovered') {
          addToast('INFO', 'Port Audited', `Discovered port ${data.port} (${data.service}) on ${data.ipAddress}`);
        }
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Connection error, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [user, loadActiveScan]);

  const handleMarkRead = async (id: string) => {
    try {
      await aiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await aiService.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const handleTriggerScan = async (target: string) => {
    setIsTriggeringScan(true);
    try {
      await aiService.runLiveScan(target);
      addToast('INFO', 'Scan Enqueued', `Network scan launched for subnet range: ${target}`);
      loadActiveScan();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Scan trigger failed';
      addToast('CRITICAL', 'Scanner Error', errorMsg);
    } finally {
      setIsTriggeringScan(false);
    }
  };

  const navigationItems: Array<{ name: string; path: string; icon: React.ReactNode; exact?: boolean; disabled?: boolean }> = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      exact: true,
    },
    {
      name: 'Asset Inventory',
      path: '/dashboard/assets',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'System Scans',
      path: '/dashboard/scans',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ),
    },
    {
      name: 'Ports & Services',
      path: '/dashboard/ports',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      name: 'Vulnerabilities',
      path: '/dashboard/vulnerabilities',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      name: 'Executive Dashboard',
      path: '/dashboard/report',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Security Graphs',
      path: '/dashboard/graphs',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'MITRE & Patching',
      path: '/dashboard/mitre',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Incident Response',
      path: '/dashboard/incidents',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      name: 'SOC AI Chat',
      path: '/dashboard/chat',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: 'On-Demand Analyst',
      path: '/dashboard/ai',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      name: 'Control Settings',
      path: '/dashboard/settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-[#94a3b8]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-[#131c2e] border-r border-[#1e293b] shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-[#f8fafc] font-black tracking-wider text-sm mr-3">
            SX
          </div>
          <span className="font-bold text-lg text-[#f8fafc] tracking-wide">SentinelX AI</span>
        </div>

        {/* Navigation Link list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-[#475569] cursor-not-allowed group relative"
                  title="Coming Soon (Sprint-07)"
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                  <span className="absolute right-3 px-1.5 py-0.5 text-[10px] bg-[#1e293b] text-[#94a3b8] rounded border border-[#334155] opacity-0 group-hover:opacity-100 transition-opacity">
                    Soon
                  </span>
                </div>
              );
            }
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 text-[#6366f1] border-l-2 border-[#6366f1]'
                      : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc]'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer block */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0f1626]">
          <div className="flex items-center mb-3">
            <div className="h-9 w-9 rounded-full bg-[#1e293b] border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] font-bold">
              {user?.fullName?.substring(0, 2).toUpperCase() || 'OP'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-semibold text-[#f8fafc] truncate">{user?.fullName || 'Operator'}</p>
              <p className="text-[10px] text-[#475569] truncate">{user?.email || 'op@sentinelx.ai'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle Menu */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <aside className="relative flex w-64 flex-col bg-[#131c2e] border-r border-[#1e293b] h-full z-10 animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#1e293b]">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-[#f8fafc] font-black text-sm mr-3">
                  SX
                </div>
                <span className="font-bold text-lg text-[#f8fafc] tracking-wide">SentinelX AI</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navigationItems.map((item) => {
                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-[#475569] cursor-not-allowed"
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 text-[#6366f1] border-l-2 border-[#6366f1]'
                          : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc]'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#1e293b] bg-[#0f1626]">
              <div className="flex items-center mb-3">
                <div className="h-9 w-9 rounded-full bg-[#1e293b] border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] font-bold">
                  {user?.fullName?.substring(0, 2).toUpperCase() || 'OP'}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-xs font-semibold text-[#f8fafc] truncate">{user?.fullName || 'Operator'}</p>
                  <p className="text-[10px] text-[#475569] truncate">{user?.email || 'op@sentinelx.ai'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Terminate Session
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header / Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#131c2e] border-b border-[#1e293b] shrink-0">
          <div className="flex items-center">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden mr-4 text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider hidden sm:block">
              Operations Control
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            {/* System Status Indicators */}
            <div className="flex items-center space-x-2 bg-[#0b0f19] px-3.5 py-1.5 rounded-full border border-[#1e293b]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                SYSTEMS ALIVE
              </span>
            </div>

            <div className="h-8 w-px bg-[#1e293b]"></div>

            {/* Profile trigger block */}
            <div className="flex items-center space-x-4">
              {/* Notification bell button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              <span className="text-xs font-semibold text-[#f8fafc] mr-2.5 hidden sm:block">
                {user?.fullName || 'Operator'}
              </span>
              <div className="h-8 w-8 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/40 flex items-center justify-center text-[#6366f1] text-xs font-bold shadow-inner">
                {user?.fullName?.substring(0, 2).toUpperCase() || 'OP'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet scroll area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0b0f19]">
          <Outlet context={{ activeScan, notifications, unreadCount, handleTriggerScan, isTriggeringScan, loadNotifications }} />
        </main>
      </div>

      {/* Slide drawer for notifications */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkRead}
        onClearAll={handleClearAll}
      />

      {/* Floating real-time Alert Toasts container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => {
          let badgeBorder = 'border-slate-800 bg-slate-900 text-white';
          let borderLight = 'border-emerald-500/30';
          if (t.type === 'CRITICAL') {
            badgeBorder = 'border-red-500/30 bg-slate-950';
            borderLight = 'border-red-500/50';
          } else if (t.type === 'WARNING') {
            badgeBorder = 'border-yellow-500/30 bg-slate-950';
            borderLight = 'border-yellow-500/50';
          } else if (t.type === 'SUCCESS') {
            badgeBorder = 'border-emerald-500/30 bg-slate-950';
            borderLight = 'border-emerald-500/50';
          }

          return (
            <div
              key={t.id}
              className={`p-4 border rounded-xl shadow-xl shadow-black/80 flex flex-col pointer-events-auto transition-all animate-slide-in ${badgeBorder} ${borderLight}`}
            >
              <span className="font-semibold text-xs text-white block uppercase tracking-wider">
                {t.title}
              </span>
              <span className="text-xs text-slate-300 mt-1 block">
                {t.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
