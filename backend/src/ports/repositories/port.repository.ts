import prisma from '../../config/prisma';
import { Port } from '@prisma/client';

export interface PortFilterParams {
  service?: string;
  state?: string;
  risk?: string;
  protocol?: string;
  skip?: number;
  take?: number;
}

const buildWhereClause = (ownerId: string, params: PortFilterParams, additionalFilters: any = {}) => {
  const { service, state, risk, protocol } = params;

  const where: any = {
    scanHost: {
      scan: {
        importedById: ownerId,
      },
    },
    ...additionalFilters,
  };

  if (service) {
    where.service = { contains: service, mode: 'insensitive' };
  }
  if (state) {
    where.state = { equals: state, mode: 'insensitive' };
  }
  if (risk) {
    where.riskLevel = { equals: risk, mode: 'insensitive' };
  }
  if (protocol) {
    where.protocol = { equals: protocol, mode: 'insensitive' };
  }

  return where;
};

export const findAll = async (
  ownerId: string,
  params: PortFilterParams
): Promise<{ ports: Port[]; total: number }> => {
  const { skip = 0, take = 10 } = params;
  const where = buildWhereClause(ownerId, params);

  const [ports, total] = await prisma.$transaction([
    prisma.port.findMany({
      where,
      include: {
        scanHost: {
          include: {
            asset: {
              select: { id: true, hostname: true, ipAddress: true },
            },
            scan: {
              select: { id: true, filename: true },
            },
          },
        },
      },
      orderBy: [
        { riskLevel: 'asc' }, // Let's sort alphabetically or we can sort by portNumber/createdAt
        { portNumber: 'asc' },
      ],
      skip,
      take,
    }),
    prisma.port.count({ where }),
  ]);

  return { ports, total };
};

export const findById = async (id: string, ownerId: string): Promise<Port | null> => {
  return await prisma.port.findFirst({
    where: {
      id,
      scanHost: {
        scan: {
          importedById: ownerId,
        },
      },
    },
    include: {
      scanHost: {
        include: {
          asset: {
            select: { id: true, hostname: true, ipAddress: true },
          },
          scan: {
            select: { id: true, filename: true },
          },
        },
      },
    },
  });
};

export const findByAssetId = async (
  assetId: string,
  ownerId: string,
  params: PortFilterParams
): Promise<{ ports: Port[]; total: number }> => {
  const { skip = 0, take = 10 } = params;
  const where = buildWhereClause(ownerId, params, {
    scanHost: {
      assetId,
    },
  });

  const [ports, total] = await prisma.$transaction([
    prisma.port.findMany({
      where,
      include: {
        scanHost: {
          include: {
            asset: {
              select: { id: true, hostname: true, ipAddress: true },
            },
            scan: {
              select: { id: true, filename: true },
            },
          },
        },
      },
      orderBy: { portNumber: 'asc' },
      skip,
      take,
    }),
    prisma.port.count({ where }),
  ]);

  return { ports, total };
};

export const findByScanId = async (
  scanId: string,
  ownerId: string,
  params: PortFilterParams
): Promise<{ ports: Port[]; total: number }> => {
  const { skip = 0, take = 10 } = params;
  const where = buildWhereClause(ownerId, params, {
    scanHost: {
      scanId,
    },
  });

  const [ports, total] = await prisma.$transaction([
    prisma.port.findMany({
      where,
      include: {
        scanHost: {
          include: {
            asset: {
              select: { id: true, hostname: true, ipAddress: true },
            },
            scan: {
              select: { id: true, filename: true },
            },
          },
        },
      },
      orderBy: { portNumber: 'asc' },
      skip,
      take,
    }),
    prisma.port.count({ where }),
  ]);

  return { ports, total };
};

export const getStats = async (ownerId: string): Promise<any> => {
  const where = {
    scanHost: {
      scan: {
        importedById: ownerId,
      },
    },
  };

  const openPorts = await prisma.port.count({
    where: {
      ...where,
      state: { equals: 'open', mode: 'insensitive' },
    },
  });

  const criticalPorts = await prisma.port.count({
    where: {
      ...where,
      riskLevel: { equals: 'Critical', mode: 'insensitive' },
    },
  });

  const httpServices = await prisma.port.count({
    where: {
      ...where,
      service: { equals: 'http', mode: 'insensitive' },
    },
  });

  const httpsServices = await prisma.port.count({
    where: {
      ...where,
      OR: [
        { service: { equals: 'https', mode: 'insensitive' } },
        { service: { equals: 'ssl/http', mode: 'insensitive' } },
      ],
    },
  });

  const sshServices = await prisma.port.count({
    where: {
      ...where,
      service: { equals: 'ssh', mode: 'insensitive' },
    },
  });

  // Group by Protocol
  const portsByProtocolRaw = await prisma.port.groupBy({
    by: ['protocol'],
    where,
    _count: { id: true },
  });

  const portsByProtocol = portsByProtocolRaw.map((p) => ({
    protocol: p.protocol,
    count: p._count.id,
  }));

  // Group by Risk
  const portsByRiskRaw = await prisma.port.groupBy({
    by: ['riskLevel'],
    where,
    _count: { id: true },
  });

  const portsByRisk = portsByRiskRaw.map((p) => ({
    riskLevel: p.riskLevel,
    count: p._count.id,
  }));

  // Group by Service for Top Services
  const topServicesRaw = await prisma.port.groupBy({
    by: ['service'],
    where,
    _count: { id: true },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  const topServices = topServicesRaw.map((p) => ({
    service: p.service,
    count: p._count.id,
  }));

  return {
    openPorts,
    criticalPorts,
    httpServices,
    httpsServices,
    sshServices,
    portsByProtocol,
    portsByRisk,
    topServices,
  };
};
