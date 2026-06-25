import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0b0f19] text-[#f8fafc]">
        {/* Modern premium loader */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#1e293b]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#6366f1] border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium tracking-wider text-[#94a3b8] uppercase animate-pulse">
          SentinelX AI - Restoring Session
        </p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
