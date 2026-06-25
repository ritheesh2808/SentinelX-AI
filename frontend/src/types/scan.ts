export type ScanStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export interface Scan {
  id: string;
  filename: string;
  importedById: string;
  importedAt: string;
  scanner: string;
  scanArguments: string | null;
  startTime: string | null;
  endTime: string | null;
  status: ScanStatus;
  _count?: {
    scanHosts: number;
  };
}

export interface ScanHost {
  id: string;
  scanId: string;
  assetId: string | null;
  hostname: string | null;
  ipAddress: string;
  macAddress: string | null;
  vendor: string | null;
  state: string;
  operatingSystem: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    hostname: string;
    ipAddress: string;
    criticality: string;
  } | null;
}

export interface ScanStats {
  totalScans: number;
  importedToday: number;
  hostsDiscovered: number;
  linkedAssets: number;
}
