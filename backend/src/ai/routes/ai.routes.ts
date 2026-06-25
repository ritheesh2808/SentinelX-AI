import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { authenticate } from "../../auth/middleware/auth.middleware";

const router = Router();
const controller = new AIController();

router.post(
  "/analyze-vulnerability",
  authenticate,
  controller.analyzeVulnerability.bind(controller)
);

export default router;
