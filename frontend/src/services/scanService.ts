import api from './api';
import type { Scan, ScanHost, ScanStats } from '../types/scan';

export const importScan = async (filename: string, xmlContent: string): Promise<Scan> => {
  const response = await api.post('/scans/import', { filename, xmlContent });
  return response.data;
};

export const getScans = async (): Promise<Scan[]> => {
  const response = await api.get('/scans');
  return response.data;
};

export const getScanById = async (id: string): Promise<Scan> => {
  const response = await api.get(`/scans/${id}`);
  return response.data;
};

export const getScanHosts = async (id: string): Promise<ScanHost[]> => {
  const response = await api.get(`/scans/${id}/hosts`);
  return response.data;
};

export const deleteScan = async (id: string): Promise<void> => {
  await api.delete(`/scans/${id}`);
};

export const getScanStats = async (): Promise<ScanStats> => {
  const response = await api.get('/scans/stats');
  return response.data;
};
