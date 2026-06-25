import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Configuration Error: JWT_SECRET is missing');
  }
  return process.env.JWT_SECRET;
};

const getSaltRounds = (): number => {
  return parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
};

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, getSaltRounds());
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid or malformed token');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    }
    throw new Error('Token verification failed');
  }
};

export const register = async (): Promise<void> => {
  throw new Error('Not implemented');
};

export const login = async (): Promise<void> => {
  throw new Error('Not implemented');
};

export const logout = async (): Promise<void> => {
  throw new Error('Not implemented');
};

export const profile = async (): Promise<void> => {
  throw new Error('Not implemented');
};
