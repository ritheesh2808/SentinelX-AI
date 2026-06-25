import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  await authService.register();
};

export const login = async (req: Request, res: Response): Promise<void> => {
  await authService.login();
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await authService.logout();
};

export const profile = async (req: Request, res: Response): Promise<void> => {
  await authService.profile();
};
