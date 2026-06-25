import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
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
      name: 'Security Incidents',
      path: '/dashboard/incidents',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      disabled: true,
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
      name: 'Vulnerabilities',
      path: '/dashboard/vulnerabilities',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      disabled: true,
    },
    {
      name: 'SentinelX AI Agent',
      path: '/dashboard/ai',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      disabled: true,
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
      disabled: true,
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
            <div className="flex items-center">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
