export type AssetType = 'NETWORK' | 'WEB_APPLICATION' | 'CLOUD_ACCOUNT' | 'ENDPOINT' | 'API';

export type AssetCriticality = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AssetStatus = 'ONLINE' | 'OFFLINE' | 'ARCHIVED' | 'ACTIVE' | 'INACTIVE';

export interface Asset {
  id: string;
  hostname: string;
  ipAddress: string;
  operatingSystem: string | null;
  assetType: AssetType;
  criticality: AssetCriticality;
  environment: string;
  status: AssetStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface CreateAssetInput {
  hostname: string;
  ipAddress: string;
  operatingSystem?: string;
  assetType: AssetType;
  criticality: AssetCriticality;
  environment: string;
  status: AssetStatus;
  notes?: string;
}

export interface UpdateAssetInput {
  hostname?: string;
  ipAddress?: string;
  operatingSystem?: string;
  assetType?: AssetType;
  criticality?: AssetCriticality;
  environment?: string;
  status?: AssetStatus;
  notes?: string;
}

export interface AssetStats {
  total: number;
  online: number;
  offline: number;
  critical: number;
}
