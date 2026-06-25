import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware';
import * as service from '../services/asset.service';

export const createAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const asset = await service.createAsset(req.body, ownerId);
    res.status(201).json(asset);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getAllAssets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { search, assetType, status, criticality, page, limit } = req.query;

    const result = await service.getAllAssets(ownerId, {
      search: search as string,
      assetType: assetType as string,
      status: status as string,
      criticality: criticality as string,
      page: page as string,
      limit: limit as string,
    });

    res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const getAssetById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const asset = await service.getAssetById(id, ownerId);
    res.status(200).json(asset);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const updateAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    const asset = await service.updateAsset(id, req.body, ownerId);
    res.status(200).json(asset);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const deleteAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing from context.' });
      return;
    }

    const { id } = req.params;
    await service.deleteAsset(id, ownerId);
    res.status(200).json({ message: 'Asset deleted successfully' });
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

    const stats = await service.getAssetStats(ownerId);
    res.status(200).json(stats);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};
