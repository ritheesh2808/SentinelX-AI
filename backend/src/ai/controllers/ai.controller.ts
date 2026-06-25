import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export class AIController {
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
}
