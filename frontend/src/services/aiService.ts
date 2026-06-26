import api from './api';
import type { AIVulnerabilityAnalysis, AIExecutiveReport, AISocAnalysis, ChatMessage } from '../types/ai';

export const analyzeVulnerability = async (data: {
  service: string;
  version: string;
  port: number;
  severity: string;
  banner?: string;
  product?: string;
}): Promise<AIVulnerabilityAnalysis> => {
  const response = await api.post<AIVulnerabilityAnalysis>('/ai/analyze-vulnerability', data);
  return response.data;
};

export const getExecutiveReport = async (): Promise<AIExecutiveReport> => {
  const response = await api.get<AIExecutiveReport>('/ai/executive-report');
  return response.data;
};

export const downloadExecutiveReport = async (): Promise<Blob> => {
  const response = await api.get('/ai/executive-report/download', {
    responseType: 'blob',
  });
  return response.data;
};

// --- SENTINELX AI v2.0 SOC ENDPOINTS ---

export const getSocAnalysis = async (): Promise<AISocAnalysis> => {
  const response = await api.get<AISocAnalysis>('/ai/soc-analysis');
  return response.data;
};

export const downloadBoardReport = async (): Promise<Blob> => {
  const response = await api.get('/ai/soc-analysis/download', {
    responseType: 'blob',
  });
  return response.data;
};

export const sendChatMessage = async (
  message: string
): Promise<{ reply: string; history: ChatMessage[] }> => {
  const response = await api.post<{ reply: string; history: ChatMessage[] }>('/ai/chat', {
    message,
  });
  return response.data;
};

export const resetChatHistory = async (): Promise<any> => {
  const response = await api.post('/ai/chat/reset');
  return response.data;
};

// --- SENTINELX AI v3.0 SOC EVENT & REAL-TIME ENDPOINTS ---

export interface NotificationItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface RiskTimelineItem {
  month: string;
  riskScore: number;
  criticalFindings: number;
  openPorts: number;
  cves: number;
}

export const getNotifications = async (): Promise<{ list: NotificationItem[]; unreadCount: number }> => {
  const response = await api.get<{ list: NotificationItem[]; unreadCount: number }>('/ai/notifications');
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.post<{ success: boolean }>(`/ai/notifications/${id}/read`);
  return response.data;
};

export const clearNotifications = async (): Promise<{ success: boolean }> => {
  const response = await api.post<{ success: boolean }>('/ai/notifications/clear');
  return response.data;
};

export const runLiveScan = async (target: string): Promise<{ message: string; target: string }> => {
  const response = await api.post<{ message: string; target: string }>('/ai/scans/run', { target });
  return response.data;
};

export const getActiveScan = async (): Promise<{ activeScan: { progress: number; stage: string; target: string } | null }> => {
  const response = await api.get<{ activeScan: { progress: number; stage: string; target: string } | null }>('/ai/scans/active');
  return response.data;
};

export const getRiskTimeline = async (): Promise<RiskTimelineItem[]> => {
  const response = await api.get<RiskTimelineItem[]>('/ai/risk-timeline');
  return response.data;
};

