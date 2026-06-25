import prisma from '../../config/prisma';
import { Scan, ScanHost, ScanStatus } from '@prisma/client';

export const createScanWithHosts = async (
  scanData: {
    filename: string;
    scanner: string;
    scanArguments?: string;
    startTime?: Date;
    endTime?: Date;
    status: ScanStatus;
    importedById: string;
  },
  hostsData: Array<{
    hostname?: string;
    ipAddress: string;
    macAddress?: string;
    vendor?: string;
    state: string;
    operatingSystem?: string;
    assetId?: string;
  }>
): Promise<Scan> => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the Scan record
    const scan = await tx.scan.create({
      data: {
        filename: scanData.filename,
        scanner: scanData.scanner,
        scanArguments: scanData.scanArguments || null,
        startTime: scanData.startTime || null,
        endTime: scanData.endTime || null,
        status: scanData.status,
        importedById: scanData.importedById,
      },
    });

    // 2. Create the associated ScanHost records
    if (hostsData.length > 0) {
      await tx.scanHost.createMany({
        data: hostsData.map((h) => ({
          scanId: scan.id,
          hostname: h.hostname || null,
          ipAddress: h.ipAddress,
          macAddress: h.macAddress || null,
          vendor: h.vendor || null,
          state: h.state,
          operatingSystem: h.operatingSystem || null,
          assetId: h.assetId || null,
        })),
      });
    }

    return scan;
  });
};

export const findAll = async (importedById: string): Promise<any[]> => {
  return await prisma.scan.findMany({
    where: {
      importedById,
    },
    orderBy: {
      importedAt: 'desc',
    },
    include: {
      _count: {
        select: { scanHosts: true },
      },
    },
  });
};

export const findById = async (id: string, importedById: string): Promise<Scan | null> => {
  return await prisma.scan.findFirst({
    where: {
      id,
      importedById,
    },
    include: {
      _count: {
        select: { scanHosts: true },
      },
    },
  });
};

export const findHostsByScanId = async (scanId: string, importedById: string): Promise<any[]> => {
  return await prisma.scanHost.findMany({
    where: {
      scanId,
      scan: {
        importedById,
      },
    },
    include: {
      asset: {
        select: {
          id: true,
          hostname: true,
          ipAddress: true,
          criticality: true,
        },
      },
    },
    orderBy: {
      ipAddress: 'asc',
    },
  });
};

export const remove = async (id: string, importedById: string): Promise<Scan> => {
  return await prisma.scan.delete({
    where: {
      id,
      importedById,
    },
  });
};

export const getStats = async (importedById: string): Promise<{ totalScans: number; importedToday: number; hostsDiscovered: number; linkedAssets: number }> => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Run transactions in database to get stats
  const [totalScans, importedToday, hostsDiscovered, linkedAssets] = await prisma.$transaction([
    // Total Scans
    prisma.scan.count({
      where: { importedById },
    }),
    // Imported Today
    prisma.scan.count({
      where: {
        importedById,
        importedAt: {
          gte: startOfToday,
        },
      },
    }),
    // Hosts Discovered (across all user scans)
    prisma.scanHost.count({
      where: {
        scan: {
          importedById,
        },
      },
    }),
    // Linked Assets (hosts linked to assets)
    prisma.scanHost.count({
      where: {
        scan: {
          importedById,
        },
        assetId: {
          not: null,
        },
      },
    }),
  ]);

  return {
    totalScans,
    importedToday,
    hostsDiscovered,
    linkedAssets,
  };
};
