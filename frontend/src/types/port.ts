export interface Port {
  id: string;
  scanHostId: string;
  portNumber: number;
  protocol: string;
  state: string;
  service: string;
  product?: string | null;
  version?: string | null;
  banner?: string | null;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
  scanHost?: {
    id: string;
    hostname?: string | null;
    ipAddress: string;
    state: string;
    asset?: {
      id: string;
      hostname: string;
      ipAddress: string;
    } | null;
    scan?: {
      id: string;
      filename: string;
    } | null;
  } | null;
}

export interface PortStats {
  openPorts: number;
  criticalPorts: number;
  httpServices: number;
  httpsServices: number;
  sshServices: number;
  portsByProtocol: Array<{ protocol: string; count: number }>;
  portsByRisk: Array<{ riskLevel: string; count: number }>;
  topServices: Array<{ service: string; count: number }>;
}
