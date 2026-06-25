import { AssetType, Severity, AssetStatus } from '@prisma/client';

export interface CreateAssetDto {
  hostname: string;
  ipAddress: string;
  operatingSystem?: string;
  assetType: AssetType;
  criticality?: Severity;
  environment?: string;
  status?: AssetStatus;
  notes?: string;
}

export interface UpdateAssetDto {
  hostname?: string;
  ipAddress?: string;
  operatingSystem?: string;
  assetType?: AssetType;
  criticality?: Severity;
  environment?: string;
  status?: AssetStatus;
  notes?: string;
}
