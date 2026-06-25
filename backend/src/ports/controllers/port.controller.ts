import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware';
import * as service from '../services/port.service';

export const getAllPorts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const result = await service.getAllPorts(ownerId, req.query);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getPortById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const port = await service.getPortById(id, ownerId);
    res.status(200).json(port);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getPortsForAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const result = await service.getPortsForAsset(id, ownerId, req.query);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getPortsForScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const result = await service.getPortsForScan(id, ownerId, req.query);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const stats = await service.getPortStats(ownerId);
    res.status(200).json(stats);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};
