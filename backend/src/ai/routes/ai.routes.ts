import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { authenticate } from "../../auth/middleware/auth.middleware";

const router = Router();
const controller = new AIController();

// Public Health Check
router.get(
  "/health",
  (req, res) => {
    res.status(200).json({ status: "ok" });
  }
);

// Authenticated AI vulnerability analysis (Sprint 11)
router.post(
  "/analyze-vulnerability",
  authenticate,
  controller.analyzeVulnerability.bind(controller)
);

// Authenticated Executive AI Report (Sprint 12)
router.get(
  "/executive-report",
  authenticate,
  controller.getExecutiveReport.bind(controller)
);

// Authenticated Executive PDF Download (Sprint 12)
router.get(
  "/executive-report/download",
  authenticate,
  controller.downloadExecutivePdf.bind(controller)
);

// Authenticated SOC Chat bot (Sprint 12)
router.post(
  "/chat",
  authenticate,
  controller.sendChatMessage.bind(controller)
);

// Reset SOC Chat Context (Sprint 12)
router.post(
  "/chat/reset",
  authenticate,
  controller.resetChatHistory.bind(controller)
);

// Authenticated SOC Correlation Analysis (v2.0)
router.get(
  "/soc-analysis",
  authenticate,
  controller.getSocAnalysis.bind(controller)
);

// Authenticated Board SOC PDF Report Download (v2.0)
router.get(
  "/soc-analysis/download",
  authenticate,
  controller.downloadBoardPdf.bind(controller)
);

// SSE Channel for Live SOC Events (Sprint 13)
router.get(
  "/soc-events",
  authenticate,
  controller.handleSocEvents.bind(controller)
);

// Get User Notifications (Sprint 13)
router.get(
  "/notifications",
  authenticate,
  controller.getNotifications.bind(controller)
);

// Mark Notification as Read (Sprint 13)
router.post(
  "/notifications/:id/read",
  authenticate,
  controller.markNotificationRead.bind(controller)
);

// Clear All Notifications (Sprint 13)
router.post(
  "/notifications/clear",
  authenticate,
  controller.clearNotifications.bind(controller)
);

// Run Simulated Live Scan (Sprint 13)
router.post(
  "/scans/run",
  authenticate,
  controller.runLiveScan.bind(controller)
);

// Get Active Scan (Sprint 13)
router.get(
  "/scans/active",
  authenticate,
  controller.getActiveScan.bind(controller)
);

// Get Risk Timeline metrics (Sprint 13)
router.get(
  "/risk-timeline",
  authenticate,
  controller.getRiskTimeline.bind(controller)
);

export default router;
