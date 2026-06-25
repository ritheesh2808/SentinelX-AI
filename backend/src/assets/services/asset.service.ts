import net from 'net';
import * as repository from '../repositories/asset.repository';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';
import { Asset, AssetType, Severity, AssetStatus } from '@prisma/client';

const validateIp = (ipAddress: string): void => {
  if (net.isIP(ipAddress) === 0) {
    throw { status: 400, message: 'Invalid IP address format' };
  }
};

export const createAsset = async (dto: CreateAssetDto, ownerId: string): Promise<Asset> => {
  if (!dto.hostname || !dto.ipAddress || !dto.assetType) {
    throw { status: 400, message: 'Missing required fields: hostname, ipAddress, and assetType are required.' };
  }

  // Validate IP Address
  validateIp(dto.ipAddress);

  // Validate duplicate hostname/ip combination
  const existing = await repository.findByUniqueKeys(dto.hostname, dto.ipAddress);
  if (existing) {
    throw { status: 409, message: 'An asset with this hostname and IP address already exists.' };
  }

  return await repository.create(dto, ownerId);
};

export const getAllAssets = async (
  ownerId: string,
  params: {
    search?: string;
    assetType?: string;
    status?: string;
    criticality?: string;
    page?: string;
    limit?: string;
  }
): Promise<{ assets: Asset[]; total: number; page: number; limit: number }> => {
  const pageVal = parseInt(params.page || '1', 10);
  const limitVal = parseInt(params.limit || '10', 10);
  const skip = (pageVal - 1) * limitVal;

  let assetTypeEnum: AssetType | undefined;
  if (params.assetType && Object.values(AssetType).includes(params.assetType as AssetType)) {
    assetTypeEnum = params.assetType as AssetType;
  }

  let statusEnum: AssetStatus | undefined;
  if (params.status && Object.values(AssetStatus).includes(params.status as AssetStatus)) {
    statusEnum = params.status as AssetStatus;
  }

  let criticalityEnum: Severity | undefined;
  if (params.criticality && Object.values(Severity).includes(params.criticality as Severity)) {
    criticalityEnum = params.criticality as Severity;
  }

  const { assets, total } = await repository.findAll(ownerId, {
    search: params.search,
    assetType: assetTypeEnum,
    status: statusEnum,
    criticality: criticalityEnum,
    skip,
    take: limitVal,
  });

  return {
    assets,
    total,
    page: pageVal,
    limit: limitVal,
  };
};

export const getAssetById = async (id: string, ownerId: string): Promise<Asset> => {
  const asset = await repository.findById(id, ownerId);
  if (!asset) {
    throw { status: 404, message: 'Asset not found' };
  }
  return asset;
};

export const updateAsset = async (id: string, dto: UpdateAssetDto, ownerId: string): Promise<Asset> => {
  const asset = await repository.findById(id, ownerId);
  if (!asset) {
    throw { status: 404, message: 'Asset not found' };
  }

  // Validate IP if it is provided
  if (dto.ipAddress) {
    validateIp(dto.ipAddress);
  }

  // Validate duplicate hostname/ip combination (excluding current asset)
  const hostnameToCheck = dto.hostname || asset.hostname;
  const ipToCheck = dto.ipAddress || asset.ipAddress;
  
  if (dto.hostname || dto.ipAddress) {
    const existing = await repository.findByUniqueKeys(hostnameToCheck, ipToCheck);
    if (existing && existing.id !== id) {
      throw { status: 409, message: 'An asset with this hostname and IP address already exists.' };
    }
  }

  return await repository.update(id, dto, ownerId);
};

export const deleteAsset = async (id: string, ownerId: string): Promise<void> => {
  const asset = await repository.findById(id, ownerId);
  if (!asset) {
    throw { status: 404, message: 'Asset not found' };
  }
  await repository.remove(id, ownerId);
};

export const getAssetStats = async (ownerId: string) => {
  return await repository.getStats(ownerId);
};
