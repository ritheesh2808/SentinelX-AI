import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: any };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token) as any;
    req.user = decoded; // Attaches authenticated user payload, which contains id
    next();
  } catch (error: any) {
    const status = error.status || 401;
    const message = error.message || 'Invalid token';
    res.status(status).json({ error: message });
    return;
  }
};
