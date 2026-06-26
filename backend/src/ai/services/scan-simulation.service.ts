import prisma from '../../config/prisma';
import { Severity, ScanStatus, AssetType, AssetStatus, VulnerabilityStatus } from '@prisma/client';
import { eventBus } from './event-bus.service';
import { NotificationService } from './notification.service';
import { IncidentEngineService } from './incident-engine.service';

const notificationService = new NotificationService();
const incidentEngine = new IncidentEngineService();

export class ScanSimulationService {
  private activeScans = new Map<string, { progress: number; stage: string; target: string }>();

  public getActiveScan(userId: string) {
    return this.activeScans.get(userId);
  }

  public async runLiveScan(userId: string, target: string) {
    if (this.activeScans.has(userId)) {
      throw { status: 400, message: 'Another scan is already running for this session.' };
    }

    // Set initial scan progress state
    this.activeScans.set(userId, { progress: 0, stage: 'Initializing', target });

    // Spawn async worker loop
    this.executeSimulationLoop(userId, target).catch((err) => {
      console.error('Scan simulation error:', err);
      this.activeScans.delete(userId);
    });

    return { message: 'Scan simulation initiated.', target };
  }

  private async executeSimulationLoop(userId: string, target: string) {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const publishProgress = (progress: number, stage: string) => {
      this.activeScans.set(userId, { progress, stage, target });
      eventBus.publish(userId, 'scan:progress', { progress, stage, target });
    };

    // 1. Initializing (10%)
    publishProgress(10, 'Initializing');
    await notificationService.addNotification(
      userId,
      'INFO',
      'Scan Initialized',
      `Started security scan targeting ${target}`
    );
    await delay(1500);

    // 2. Host Discovery (30%)
    publishProgress(30, 'Host Discovery');
    eventBus.publish(userId, 'host:discovered', { ipAddress: target, hostname: 'prod-api-server' });
    await delay(1500);

    // 3. Port Scan (50%)
    publishProgress(50, 'Port Scan');
    eventBus.publish(userId, 'port:discovered', { ipAddress: target, port: 22, service: 'ssh' });
    eventBus.publish(userId, 'port:discovered', { ipAddress: target, port: 443, service: 'https' });
    await delay(1500);

    // 4. Service Detection (70%)
    publishProgress(70, 'Service Detection');
    eventBus.publish(userId, 'service:discovered', {
      ipAddress: target,
      port: 22,
      product: 'OpenSSH',
      version: '8.2p1',
    });
    await delay(1500);

    // 5. Vulnerability Detection (85%)
    publishProgress(85, 'Vulnerability Detection');

    // Persist mock scan findings in the DB
    let asset = await prisma.asset.findFirst({
      where: { ownerId: userId, ipAddress: target },
    });

    if (!asset) {
      asset = await prisma.asset.create({
        data: {
          hostname: 'prod-api-server',
          ipAddress: target,
          operatingSystem: 'Ubuntu Linux 20.04',
          assetType: AssetType.NETWORK,
          ownerId: userId,
          criticality: Severity.CRITICAL,
          environment: 'Production',
          status: AssetStatus.ONLINE,
          notes: 'Discovered during real-time automated SOC scan',
        },
      });
    }

    const scan = await prisma.scan.create({
      data: {
        filename: `live_scan_${Date.now()}.xml`,
        scanner: 'Nmap Live Scan Engine',
        scanArguments: `-sV -O ${target}`,
        startTime: new Date(Date.now() - 10000),
        endTime: new Date(),
        status: ScanStatus.COMPLETED,
        importedById: userId,
      },
    });

    // Create ScanHost
    const scanHost = await prisma.scanHost.create({
      data: {
        scanId: scan.id,
        assetId: asset.id,
        hostname: 'prod-api-server',
        ipAddress: target,
        state: 'up',
        operatingSystem: 'Ubuntu Linux 20.04',
      },
    });

    // Create Port records
    await prisma.port.createMany({
      data: [
        {
          scanHostId: scanHost.id,
          portNumber: 22,
          protocol: 'tcp',
          state: 'open',
          service: 'ssh',
          product: 'OpenSSH',
          version: '8.2p1',
          riskLevel: 'HIGH',
        },
        {
          scanHostId: scanHost.id,
          portNumber: 443,
          protocol: 'tcp',
          state: 'open',
          service: 'https',
          product: 'Nginx',
          version: '1.18.0',
          riskLevel: 'LOW',
        },
      ],
    });

    // Create Host relation
    const host = await prisma.host.create({
      data: {
        assetId: asset.id,
        scanId: scan.id,
        hostname: 'prod-api-server',
        ipAddress: target,
        os: 'Ubuntu Linux 20.04',
      },
    });

    // Create Service
    const serviceRecord = await prisma.service.create({
      data: {
        hostId: host.id,
        port: 22,
        protocol: 'tcp',
        name: 'ssh',
        product: 'OpenSSH',
        version: '8.2p1',
      },
    });

    // Create Vulnerability
    const vulnerability = await prisma.vulnerability.create({
      data: {
        serviceId: serviceRecord.id,
        title: 'OpenSSH Remote Code Execution (RCE) Vulnerability',
        description:
          'An integer overflow vulnerability exists in OpenSSH (CVE-2026-SSH-RCE) allowing remote attackers to execute arbitrary code on the target system with root privileges.',
        severity: Severity.CRITICAL,
        status: VulnerabilityStatus.OPEN,
        cveId: 'CVE-2026-SSH-RCE',
        cvssScore: 9.8,
        remediation:
          'Upgrade OpenSSH to version 9.8p1 or newer, or disable SSH access from external IP ranges.',
      },
    });

    eventBus.publish(userId, 'vulnerability:discovered', vulnerability);
    await notificationService.addNotification(
      userId,
      'WARNING',
      'Vulnerability Discovered',
      `Critical vulnerability CVE-2026-SSH-RCE identified on ${target}`
    );
    await delay(1500);

    // 6. AI Analysis (95%)
    publishProgress(95, 'AI Analysis');

    // Run Incident Engine to verify threat level and auto-create security incident
    await incidentEngine.evaluateVulnerability(userId, vulnerability.id);
    await delay(1500);

    // 7. Completed (100%)
    publishProgress(100, 'Completed');
    await notificationService.addNotification(
      userId,
      'SUCCESS',
      'Scan Completed',
      `Finished scanning ${target}. Executive summary and playbooks generated.`
    );

    // Clean up active scan key
    this.activeScans.delete(userId);
  }
}
