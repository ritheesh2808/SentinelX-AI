import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19] px-4 text-center">
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.03)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="relative z-10 max-w-md rounded-2xl border border-red-500/20 bg-[#131c2e] p-8 shadow-2xl overflow-hidden">
        {/* Glow red line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mb-6">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[#f8fafc] mb-2 font-mono">404</h1>
        <h2 className="text-xl font-bold text-[#f8fafc] mb-4">RESTRICTED SECTOR</h2>
        <p className="text-sm text-[#94a3b8] mb-8 leading-relaxed">
          The quadrant you are trying to access is undocumented or is currently outside our perimeter boundary. Let's redirect you back to active command.
        </p>

        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] py-3 text-sm font-semibold text-[#f8fafc] shadow-lg shadow-[#6366f1]/20 transition-all hover:opacity-95 cursor-pointer"
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
