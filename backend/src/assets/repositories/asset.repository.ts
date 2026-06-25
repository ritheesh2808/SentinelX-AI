import prisma from '../../config/prisma';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';
import { Asset, Severity, AssetStatus, AssetType } from '@prisma/client';

export const create = async (dto: CreateAssetDto, ownerId: string): Promise<Asset> => {
  return await prisma.asset.create({
    data: {
      hostname: dto.hostname,
      ipAddress: dto.ipAddress,
      operatingSystem: dto.operatingSystem || null,
      assetType: dto.assetType,
      criticality: dto.criticality || Severity.MEDIUM,
      environment: dto.environment || 'Production',
      status: dto.status || AssetStatus.ONLINE,
      notes: dto.notes || null,
      ownerId: ownerId,
    },
  });
};

export const findAll = async (
  ownerId: string,
  params: {
    search?: string;
    assetType?: AssetType;
    status?: AssetStatus;
    criticality?: Severity;
    skip?: number;
    take?: number;
  }
): Promise<{ assets: Asset[]; total: number }> => {
  const { search, assetType, status, criticality, skip = 0, take = 10 } = params;

  // Build prisma query filters
  const where: any = {
    ownerId,
  };

  if (search) {
    where.OR = [
      { hostname: { contains: search, mode: 'insensitive' } },
      { ipAddress: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (assetType) {
    where.assetType = assetType;
  }

  if (status) {
    where.status = status;
  }

  if (criticality) {
    where.criticality = criticality;
  }

  const [assets, total] = await prisma.$transaction([
    prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.asset.count({ where }),
  ]);

  return { assets, total };
};

export const findById = async (id: string, ownerId: string): Promise<Asset | null> => {
  return await prisma.asset.findFirst({
    where: {
      id,
      ownerId,
    },
  });
};

export const findByUniqueKeys = async (hostname: string, ipAddress: string): Promise<Asset | null> => {
  return await prisma.asset.findUnique({
    where: {
      hostname_ipAddress: {
        hostname,
        ipAddress,
      },
    },
  });
};

export const update = async (id: string, dto: UpdateAssetDto, ownerId: string): Promise<Asset> => {
  return await prisma.asset.update({
    where: {
      id,
      ownerId,
    },
    data: {
      hostname: dto.hostname,
      ipAddress: dto.ipAddress,
      operatingSystem: dto.operatingSystem !== undefined ? dto.operatingSystem : undefined,
      assetType: dto.assetType,
      criticality: dto.criticality,
      environment: dto.environment,
      status: dto.status,
      notes: dto.notes !== undefined ? dto.notes : undefined,
    },
  });
};

export const remove = async (id: string, ownerId: string): Promise<Asset> => {
  return await prisma.asset.delete({
    where: {
      id,
      ownerId,
    },
  });
};

export const getStats = async (ownerId: string): Promise<{ total: number; online: number; offline: number; critical: number }> => {
  const [total, online, offline, critical] = await prisma.$transaction([
    prisma.asset.count({ where: { ownerId } }),
    prisma.asset.count({ where: { ownerId, status: AssetStatus.ONLINE } }),
    prisma.asset.count({ where: { ownerId, status: AssetStatus.OFFLINE } }),
    prisma.asset.count({ where: { ownerId, criticality: Severity.CRITICAL } }),
  ]);

  return { total, online, offline, critical };
};

export const findByIpAddress = async (ipAddress: string, ownerId: string): Promise<Asset | null> => {
  return await prisma.asset.findFirst({
    where: {
      ipAddress,
      ownerId,
    },
  });
};
