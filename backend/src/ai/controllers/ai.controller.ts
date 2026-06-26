import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware';
import { AIService } from '../services/ai.service';
import { generateExecutivePdf } from '../services/pdf.service';
import * as aiRepository from '../repositories/ai.repository';
import { SocService } from '../services/soc.service';
import { generateBoardPdf } from '../services/pdf-soc.service';
import { eventBus } from '../services/event-bus.service';
import { NotificationService } from '../services/notification.service';
import { ScanSimulationService } from '../services/scan-simulation.service';
import prisma from '../../config/prisma';

const aiService = new AIService();
const socService = new SocService();
const notificationService = new NotificationService();
const scanSimulationService = new ScanSimulationService();

export class AIController {
  // Analyze a single vulnerability context (Sprint 11)
  async analyzeVulnerability(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      const result = await aiService.analyzeVulnerability(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('AI analysis controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'AI analysis failed.';
      res.status(status).json({ error: message });
    }
  }

  // Get dynamic Executive Report (Sprint 12)
  async getExecutiveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      const reportData = await aiService.getExecutiveReport(ownerId);
      res.status(200).json(reportData);
    } catch (error: any) {
      console.error('AI executive report controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'AI executive report generation failed.';
      res.status(status).json({ error: message });
    }
  }

  // Download PDF report dynamically (Sprint 12)
  async downloadExecutivePdf(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      const reportData = await aiService.getExecutiveReport(ownerId);
      const assets = await aiRepository.getUserSecurityContext(ownerId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="SentinelX_AI_Executive_Report.pdf"');

      generateExecutivePdf(res, {
        company: req.user?.name || 'SentinelX Organization',
        scanTime: new Date().toLocaleDateString(),
        stats: reportData.stats,
        report: reportData.report,
        assets,
      });
    } catch (error: any) {
      console.error('AI PDF generation controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'Failed to generate PDF report.';
      res.status(status).json({ error: message });
    }
  }

  // SOC chatbot context handler (Sprint 12)
  async sendChatMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      const { message } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message payload is required.' });
        return;
      }

      const result = await aiService.sendChatMessage(ownerId, message);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('AI chat controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'AI chat failed.';
      res.status(status).json({ error: message });
    }
  }

  // Reset SOC chat memory session (Sprint 12)
  async resetChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      await aiService.resetChatHistory(ownerId);
      res.status(200).json({ success: true, message: 'Chat context memory reset.' });
    } catch (error: any) {
      console.error('AI chat reset controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'Failed to reset chat context.';
      res.status(status).json({ error: message });
    }
  }

  // Get unified SOC correlation analysis (Sprint 12 / v2.0)
  async getSocAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      const socData = await socService.getSocAnalysis(ownerId);
      res.status(200).json(socData);
    } catch (error: any) {
      console.error('AI SOC analysis controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'AI SOC analysis correlation failed.';
      res.status(status).json({ error: message });
    }
  }

  // Download Board PDF report dynamically (Sprint 12 / v2.0)
  async downloadBoardPdf(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
        return;
      }

      const socData = await socService.getSocAnalysis(ownerId);
      const assets = await aiRepository.getUserSecurityContext(ownerId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="SentinelX_AI_Board_SOC_Report.pdf"');

      generateBoardPdf(res, {
        company: req.user?.name || 'SentinelX Organization',
        scanTime: new Date().toLocaleDateString(),
        stats: socData.stats,
        report: socData.report,
        assets,
      });
    } catch (error: any) {
      console.error('AI SOC PDF generation controller error:', error);
      const status = error.status || 500;
      const message = error.message || 'Failed to generate Board SOC PDF report.';
      res.status(status).json({ error: message });
    }
  }

  // SSE Channel for Live SOC Events (Sprint 13)
  async handleSocEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Connection Established' })}\n\n`);

    const unsubscribe = eventBus.subscribe(userId, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    req.on('close', () => {
      unsubscribe();
    });
  }

  // Fetch all user notifications (Sprint 13)
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        return;
      }
      const list = await notificationService.getNotifications(userId);
      const unreadCount = await notificationService.getUnreadCount(userId);
      res.status(200).json({ list, unreadCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
    }
  }

  // Mark single notification read (Sprint 13)
  async markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        return;
      }
      const { id } = req.params;
      await notificationService.markAsRead(userId, id);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update notification state' });
    }
  }

  // Clear all notifications (Sprint 13)
  async clearNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        return;
      }
      await notificationService.clearAll(userId);
      res.status(200).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to clear notifications' });
    }
  }

  // Trigger manual network scan simulation (Sprint 13)
  async runLiveScan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        return;
      }
      const { target } = req.body;
      if (!target) {
        res.status(400).json({ error: 'Missing required parameter: target network IP range.' });
        return;
      }
      const result = await scanSimulationService.runLiveScan(userId, target);
      res.status(202).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      res.status(status).json({ error: err.message || 'Failed to start scan simulation' });
    }
  }

  // Get active scan progress state (Sprint 13)
  async getActiveScan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        return;
      }
      const activeScan = scanSimulationService.getActiveScan(userId);
      res.status(200).json({ activeScan: activeScan || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch active scan progress' });
    }
  }

  // Expose endpoints for dynamic Risk Timeline chart datasets (Sprint 13)
  async getRiskTimeline(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        return;
      }

      const vulns = await prisma.vulnerability.findMany({
        where: { service: { host: { asset: { ownerId: userId } } } }
      });

      const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
      const cvesCount = vulns.filter(v => v.cveId).length;
      const openPortsCount = await prisma.port.count({ where: { scanHost: { scan: { importedById: userId } } } });

      let riskScore = 25;
      if (criticalCount > 0) riskScore += 45;
      if (cvesCount > 0) riskScore += 20;
      if (openPortsCount > 0) riskScore += Math.min(openPortsCount * 2, 10);
      riskScore = Math.min(riskScore, 100);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const timeline = months.map((month, idx) => {
        const factor = (idx + 1) / 6;
        return {
          month,
          riskScore: Math.round(riskScore * factor * 0.8 + 15),
          criticalFindings: Math.max(0, Math.round(criticalCount * factor)),
          openPorts: Math.max(0, Math.round(openPortsCount * factor)),
          cves: Math.max(0, Math.round(cvesCount * factor))
        };
      });

      res.status(200).json(timeline);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch risk timeline data' });
    }
  }
}
