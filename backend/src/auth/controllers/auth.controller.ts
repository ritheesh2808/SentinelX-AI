import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.logout();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const profile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userProfile = await authService.profile(req.user.id);
    res.status(200).json(userProfile);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};
