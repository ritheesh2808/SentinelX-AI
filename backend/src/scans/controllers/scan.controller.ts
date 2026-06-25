import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware';
import * as service from '../services/scan.service';

export const importScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const importedById = req.user?.id;
    if (!importedById) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { filename, xmlContent } = req.body;
    if (!filename || !xmlContent) {
      res.status(400).json({ error: 'Missing required payload parameters: filename and xmlContent are required.' });
      return;
    }

    const scan = await service.importScan(filename, xmlContent, importedById);
    res.status(201).json(scan);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getScans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const importedById = req.user?.id;
    if (!importedById) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const scans = await service.getScans(importedById);
    res.status(200).json(scans);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getScanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const importedById = req.user?.id;
    if (!importedById) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const scan = await service.getScanById(id, importedById);
    res.status(200).json(scan);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getScanHosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const importedById = req.user?.id;
    if (!importedById) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const hosts = await service.getScanHosts(id, importedById);
    res.status(200).json(hosts);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const deleteScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const importedById = req.user?.id;
    if (!importedById) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    await service.deleteScan(id, importedById);
    res.status(200).json({ message: 'Scan deleted successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const importedById = req.user?.id;
    if (!importedById) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const stats = await service.getStats(importedById);
    res.status(200).json(stats);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};
