import { Router } from 'express';
import * as controller from '../controllers/port.controller';
import { authenticate } from '../../auth/middleware/auth.middleware';

const router = Router();

// Apply auth middleware to protect all ports routes
router.use(authenticate);

// Stats endpoint (placed first to avoid collision with :id)
router.get('/stats', controller.getStats);

// REST CRUD
router.get('/', controller.getAllPorts);
router.get('/:id', controller.getPortById);

export default router;
