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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ message: 'Reset token generated successfully', ...result });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { fullName, email } = req.body;
    const updated = await authService.updateProfile(userId, fullName, email);
    res.status(200).json({ message: 'Profile updated successfully', user: updated });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await authService.deleteAccount(userId);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
};

