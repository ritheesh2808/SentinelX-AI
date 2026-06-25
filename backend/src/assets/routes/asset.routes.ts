import { Router } from 'express';
import * as controller from '../controllers/asset.controller';
import { getPortsForAsset } from '../../ports/controllers/port.controller';
import { getVulnerabilitiesForAsset } from '../../vulnerabilities/controllers/vulnerability.controller';
import { authenticate } from '../../auth/middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all asset endpoints
router.use(authenticate);

// Register statistics route first to avoid param collision with :id
router.get('/stats', controller.getStats);

// REST CRUD Endpoints
router.post('/', controller.createAsset);
router.get('/', controller.getAllAssets);
router.get('/:id', controller.getAssetById);
router.get('/:id/ports', getPortsForAsset);
router.get('/:id/vulnerabilities', getVulnerabilitiesForAsset);
router.put('/:id', controller.updateAsset);
router.delete('/:id', controller.deleteAsset);

export default router;
