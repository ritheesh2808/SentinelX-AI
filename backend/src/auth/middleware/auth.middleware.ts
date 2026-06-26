import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: any };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token = '';
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

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
