import api from './api';
import type { Asset, CreateAssetInput, UpdateAssetInput, AssetStats } from '../types/asset';

export const getAssets = async (params: {
  search?: string;
  assetType?: string;
  status?: string;
  criticality?: string;
  page?: number;
  limit?: number;
}): Promise<{ assets: Asset[]; total: number; page: number; limit: number }> => {
  const response = await api.get('/assets', { params });
  return response.data;
};

export const getAssetById = async (id: string): Promise<Asset> => {
  const response = await api.get(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (data: CreateAssetInput): Promise<Asset> => {
  const response = await api.post('/assets', data);
  return response.data;
};

export const updateAsset = async (id: string, data: UpdateAssetInput): Promise<Asset> => {
  const response = await api.put(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id: string): Promise<void> => {
  await api.delete(`/assets/${id}`);
};

export const getAssetStats = async (): Promise<AssetStats> => {
  const response = await api.get('/assets/stats');
  return response.data;
};
