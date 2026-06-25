import { Router } from 'express';
import * as controller from '../controllers/scan.controller';
import { authenticate } from '../../auth/middleware/auth.middleware';

const router = Router();

// Secure all scan endpoints with JWT auth
router.use(authenticate);

// Stats endpoint (placed before parameters to avoid collisions)
router.get('/stats', controller.getStats);

// Main endpoints
router.post('/import', controller.importScan);
router.get('/', controller.getScans);
router.get('/:id', controller.getScanById);
router.get('/:id/hosts', controller.getScanHosts);
router.delete('/:id', controller.deleteScan);

export default router;
