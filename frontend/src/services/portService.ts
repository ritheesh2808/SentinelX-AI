import api from './api';
import type { Port, PortStats } from '../types/port';

export const getPorts = async (params?: {
  service?: string;
  state?: string;
  risk?: string;
  protocol?: string;
  page?: number;
  limit?: number;
}): Promise<{ ports: Port[]; total: number; page: number; limit: number }> => {
  const response = await api.get('/ports', { params });
  return response.data;
};

export const getPortById = async (id: string): Promise<Port> => {
  const response = await api.get(`/ports/${id}`);
  return response.data;
};

export const getAssetPorts = async (
  assetId: string,
  params?: {
    service?: string;
    state?: string;
    risk?: string;
    protocol?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ ports: Port[]; total: number; page: number; limit: number }> => {
  const response = await api.get(`/assets/${assetId}/ports`, { params });
  return response.data;
};

export const getScanPorts = async (
  scanId: string,
  params?: {
    service?: string;
    state?: string;
    risk?: string;
    protocol?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ ports: Port[]; total: number; page: number; limit: number }> => {
  const response = await api.get(`/scans/${scanId}/ports`, { params });
  return response.data;
};

export const getPortStats = async (): Promise<PortStats> => {
  const response = await api.get('/ports/stats');
  return response.data;
};
