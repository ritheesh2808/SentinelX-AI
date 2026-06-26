import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardHome from '../pages/dashboard/DashboardHome';
import AssetsPage from '../pages/dashboard/AssetsPage';
import ScansListPage from '../pages/dashboard/ScansListPage';
import ScanImportPage from '../pages/dashboard/ScanImportPage';
import ScanDetailsPage from '../pages/dashboard/ScanDetailsPage';
import PortsPage from '../pages/dashboard/PortsPage';
import PortDetailsPage from '../pages/dashboard/PortDetailsPage';
import AssetPortsPage from '../pages/dashboard/AssetPortsPage';
import VulnerabilitiesPage from '../pages/vulnerabilities/VulnerabilitiesPage';
import VulnerabilityDetailsPage from '../pages/vulnerabilities/VulnerabilityDetailsPage';
import AIAgentPage from '../pages/ai/AIAgentPage';
import ExecutiveReportPage from '../pages/ai/ExecutiveReportPage';
import SecurityGraphsPage from '../pages/ai/SecurityGraphsPage';
import MitrePatchPage from '../pages/ai/MitrePatchPage';
import IncidentResponsePage from '../pages/ai/IncidentResponsePage';
import ChatPage from '../pages/ai/ChatPage';
import NotFoundPage from '../pages/NotFoundPage';

// A component that handles redirecting the root path '/' based on authentication state
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0b0f19] text-[#f8fafc]">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#1e293b]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#6366f1] border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Route Redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="scans" element={<ScansListPage />} />
        <Route path="scans/import" element={<ScanImportPage />} />
        <Route path="scans/:id" element={<ScanDetailsPage />} />
        <Route path="ports" element={<PortsPage />} />
        <Route path="ports/:id" element={<PortDetailsPage />} />
        <Route path="assets/:id/ports" element={<AssetPortsPage />} />
        <Route path="vulnerabilities" element={<VulnerabilitiesPage />} />
        <Route path="vulnerabilities/:id" element={<VulnerabilityDetailsPage />} />
        <Route path="ai" element={<AIAgentPage />} />
        <Route path="report" element={<ExecutiveReportPage />} />
        <Route path="graphs" element={<SecurityGraphsPage />} />
        <Route path="mitre" element={<MitrePatchPage />} />
        <Route path="incidents" element={<IncidentResponsePage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
