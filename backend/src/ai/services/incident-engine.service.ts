import prisma from '../../config/prisma';
import { Severity, IncidentStatus } from '@prisma/client';
import { eventBus } from './event-bus.service';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class IncidentEngineService {
  /**
   * Evaluates a discovered vulnerability and automatically registers
   * a high-priority incident if CVSS exceeds a threshold (e.g. 8.5) or vulnerability is critical.
   */
  public async evaluateVulnerability(userId: string, vulnerabilityId: string) {
    const vulnerability = await prisma.vulnerability.findUnique({
      where: { id: vulnerabilityId },
      include: {
        service: {
          include: {
            host: {
              include: {
                asset: true,
              },
            },
          },
        },
      },
    });

    if (!vulnerability) return;

    const cvss = vulnerability.cvssScore ? Number(vulnerability.cvssScore) : 0;
    const isCritical = vulnerability.severity === Severity.CRITICAL;

    if (isCritical || cvss >= 8.5) {
      const asset = vulnerability.service.host.asset;
      const assetId = asset?.id || null;
      const hostname = asset?.hostname || 'Unknown Host';

      const incidentTitle = `Auto-Incident: ${vulnerability.title} on ${hostname}`;
      const incidentDesc = `A critical vulnerability "${vulnerability.title}" was identified with CVSS score ${cvss}. Description: ${vulnerability.description}. Exploitation possibility is high. Action required immediately.`;

      const existing = await prisma.incident.findFirst({
        where: { vulnerabilityId },
      });

      if (!existing) {
        const incident = await prisma.incident.create({
          data: {
            createdById: userId,
            assetId,
            vulnerabilityId,
            title: incidentTitle,
            description: incidentDesc,
            severity: Severity.CRITICAL,
            status: IncidentStatus.OPEN,
          },
        });

        // Broadcast incident event
        eventBus.publish(userId, 'incident:created', incident);

        // Add user notification
        await notificationService.addNotification(
          userId,
          'CRITICAL',
          `Critical Incident Created`,
          `Incident automatically escalated: ${vulnerability.title} on ${hostname}`
        );

        return incident;
      }
    }
  }
}
