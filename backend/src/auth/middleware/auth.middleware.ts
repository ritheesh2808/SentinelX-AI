import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    res.status(401).json({ error: `Unauthorized: ${message}` });
    return;
  }
};
