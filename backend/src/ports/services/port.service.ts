import * as repository from '../repositories/port.repository';
import { PortFilterDto } from '../dto/port.dto';
import { Port } from '@prisma/client';

const parsePaginationParams = (filterDto: PortFilterDto) => {
  const page = parseInt(filterDto.page || '1', 10);
  const limit = parseInt(filterDto.limit || '10', 10);
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

export const getAllPorts = async (
  ownerId: string,
  filterDto: PortFilterDto
): Promise<{ ports: Port[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = parsePaginationParams(filterDto);

  const { ports, total } = await repository.findAll(ownerId, {
    service: filterDto.service,
    state: filterDto.state,
    risk: filterDto.risk,
    protocol: filterDto.protocol,
    skip,
    take,
  });

  return { ports, total, page, limit };
};

export const getPortById = async (id: string, ownerId: string): Promise<Port> => {
  const port = await repository.findById(id, ownerId);
  if (!port) {
    throw { status: 404, message: 'Port not found' };
  }
  return port;
};

export const getPortsForAsset = async (
  assetId: string,
  ownerId: string,
  filterDto: PortFilterDto
): Promise<{ ports: Port[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = parsePaginationParams(filterDto);

  const { ports, total } = await repository.findByAssetId(assetId, ownerId, {
    service: filterDto.service,
    state: filterDto.state,
    risk: filterDto.risk,
    protocol: filterDto.protocol,
    skip,
    take,
  });

  return { ports, total, page, limit };
};

export const getPortsForScan = async (
  scanId: string,
  ownerId: string,
  filterDto: PortFilterDto
): Promise<{ ports: Port[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = parsePaginationParams(filterDto);

  const { ports, total } = await repository.findByScanId(scanId, ownerId, {
    service: filterDto.service,
    state: filterDto.state,
    risk: filterDto.risk,
    protocol: filterDto.protocol,
    skip,
    take,
  });

  return { ports, total, page, limit };
};

export const getPortStats = async (ownerId: string): Promise<any> => {
  return await repository.getStats(ownerId);
};
