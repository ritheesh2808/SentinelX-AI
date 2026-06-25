import { XMLParser, XMLValidator } from 'fast-xml-parser';
import * as repository from '../repositories/scan.repository';
import * as assetRepository from '../../assets/repositories/asset.repository';
import { getRiskLevel } from '../../ports/services/risk.service';
import { Scan, ScanHost, ScanStatus } from '@prisma/client';

export const importScan = async (
  filename: string,
  xmlContent: string,
  importedById: string
): Promise<Scan> => {
  // 1. Basic Validations
  if (!xmlContent || !xmlContent.trim()) {
    throw { status: 400, message: 'Rejecting empty scan file.' };
  }

  // Reject files larger than 5MB
  const maxLimitBytes = 5 * 1024 * 1024;
  if (Buffer.byteLength(xmlContent, 'utf8') > maxLimitBytes) {
    throw { status: 400, message: 'File size exceeds the 5MB upload limit.' };
  }

  // 2. Validate XML Syntax
  const xmlValidation = XMLValidator.validate(xmlContent);
  if (xmlValidation !== true) {
    throw { status: 400, message: 'Invalid or malformed XML file. Please upload a valid Nmap XML report.' };
  }

  // 3. Parse XML using fast-xml-parser
  let jsonObj: any;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    jsonObj = parser.parse(xmlContent);
  } catch (err) {
    throw { status: 400, message: 'Corrupted XML parsing error.' };
  }

  const nmaprun = jsonObj.nmaprun;
  if (!nmaprun || nmaprun.scanner !== 'nmap') {
    throw { status: 400, message: 'Unsupported file: Root element must be an Nmap scan (<nmaprun>).' };
  }

  // 4. Extract Scan Metadata
  const scanner = nmaprun.scanner || 'nmap';
  const scanArguments = nmaprun.args || '';
  const scannerVersion = nmaprun.version || '';
  
  let startTime: Date | undefined;
  if (nmaprun.start) {
    const seconds = parseInt(nmaprun.start, 10);
    if (!isNaN(seconds)) startTime = new Date(seconds * 1000);
  }

  let endTime: Date | undefined;
  const finishedTime = nmaprun.runstats?.finished?.time;
  if (finishedTime) {
    const seconds = parseInt(finishedTime, 10);
    if (!isNaN(seconds)) endTime = new Date(seconds * 1000);
  }

  // 5. Parse Hosts
  const hostElement = nmaprun.host;
  const rawHosts = Array.isArray(hostElement)
    ? hostElement
    : hostElement
    ? [hostElement]
    : [];

  const parsedHosts: Array<{
    hostname?: string;
    ipAddress: string;
    macAddress?: string;
    vendor?: string;
    state: string;
    operatingSystem?: string;
    assetId?: string;
    ports?: Array<{
      portNumber: number;
      protocol: string;
      state: string;
      service: string;
      product?: string;
      version?: string;
      banner?: string;
      riskLevel: string;
    }>;
  }> = [];

  for (const host of rawHosts) {
    // Extract state
    const state = host.status?.state || 'unknown';

    // Normalize addresses (IP and MAC)
    const addressElement = host.address;
    const addresses = Array.isArray(addressElement)
      ? addressElement
      : addressElement
      ? [addressElement]
      : [];

    let ipAddress = '';
    let macAddress: string | undefined;
    let vendor: string | undefined;

    for (const addr of addresses) {
      if (addr.addrtype === 'ipv4' || addr.addrtype === 'ipv6') {
        ipAddress = addr.addr;
      } else if (addr.addrtype === 'mac') {
        macAddress = addr.addr;
        vendor = addr.vendor || undefined;
      }
    }

    // Skip if we couldn't resolve an IP address for this host
    if (!ipAddress) continue;

    // Normalize hostnames
    const hostnamesElement = host.hostnames?.hostname;
    const hostnames = Array.isArray(hostnamesElement)
      ? hostnamesElement
      : hostnamesElement
      ? [hostnamesElement]
      : [];
    
    // Pick the first hostname or user-defined hostname
    let hostname = hostnames.find((h: any) => h.name)?.name || undefined;

    // Normalize Operating System Match
    const osmatchElement = host.os?.osmatch;
    const osmatches = Array.isArray(osmatchElement)
      ? osmatchElement
      : osmatchElement
      ? [osmatchElement]
      : [];
    
    let operatingSystem = osmatches.length > 0 ? osmatches[0].name : undefined;

    // 6. Perform Asset Correlation: Match IP under the User's assets
    const matchedAsset = await assetRepository.findByIpAddress(ipAddress, importedById);

    // 7. Extract Ports & Services
    const portsElement = host.ports?.port;
    const rawPorts = Array.isArray(portsElement)
      ? portsElement
      : portsElement
      ? [portsElement]
      : [];

    const hostPorts: Array<{
      portNumber: number;
      protocol: string;
      state: string;
      service: string;
      product?: string;
      version?: string;
      banner?: string;
      riskLevel: string;
    }> = [];

    for (const p of rawPorts) {
      const portNumber = parseInt(p.portid, 10);
      if (isNaN(portNumber)) continue;

      const protocol = p.protocol || 'tcp';
      const portState = p.state?.state || 'unknown';
      const serviceName = p.service?.name || 'unknown';
      const product = p.service?.product || undefined;
      const version = p.service?.version || undefined;

      // Extract banner script output if available
      const scripts = Array.isArray(p.script)
        ? p.script
        : p.script
        ? [p.script]
        : [];
      const bannerScript = scripts.find((s: any) => s.id === 'banner');
      const banner = bannerScript ? bannerScript.output || undefined : undefined;

      const riskLevel = getRiskLevel(portNumber, serviceName);

      hostPorts.push({
        portNumber,
        protocol,
        state: portState,
        service: serviceName,
        product,
        version,
        banner,
        riskLevel,
      });
    }

    parsedHosts.push({
      hostname,
      ipAddress,
      macAddress,
      vendor,
      state,
      operatingSystem,
      assetId: matchedAsset?.id,
      ports: hostPorts,
    });
  }

  // 7. Store Scan in DB
  const scanData = {
    filename,
    scanner: `${scanner} (v${scannerVersion})`,
    scanArguments,
    startTime,
    endTime,
    status: ScanStatus.COMPLETED,
    importedById,
  };

  return await repository.createScanWithHosts(scanData, parsedHosts);
};

export const getScans = async (importedById: string): Promise<any[]> => {
  return await repository.findAll(importedById);
};

export const getScanById = async (id: string, importedById: string): Promise<Scan> => {
  const scan = await repository.findById(id, importedById);
  if (!scan) {
    throw { status: 404, message: 'Scan not found' };
  }
  return scan;
};

export const getScanHosts = async (scanId: string, importedById: string): Promise<any[]> => {
  // Ensure scan exists and belongs to the user
  await getScanById(scanId, importedById);
  return await repository.findHostsByScanId(scanId, importedById);
};

export const deleteScan = async (id: string, importedById: string): Promise<void> => {
  await getScanById(id, importedById);
  await repository.remove(id, importedById);
};

export const getStats = async (importedById: string) => {
  return await repository.getStats(importedById);
};
