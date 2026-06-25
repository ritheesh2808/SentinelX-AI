import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

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
      throw { status: 401, message: 'Token expired' };
    }
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
      throw { status: 401, message: 'Invalid or malformed token' };
    }
    throw { status: 401, message: 'Token verification failed' };
  }
};

export const register = async (dto: RegisterDto): Promise<void> => {
  if (!dto.fullName || !dto.email || !dto.password) {
    throw { status: 400, message: 'Missing required fields' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existingUser) {
    throw { status: 409, message: 'Email already exists' };
  }

  const hashedPassword = await hashPassword(dto.password);

  await prisma.user.create({
    data: {
      name: dto.fullName,
      email: dto.email,
      password: hashedPassword,
    },
  });
};

export const login = async (dto: LoginDto): Promise<{ token: string; user: any }> => {
  if (!dto.email || !dto.password) {
    throw { status: 400, message: 'Missing required fields' };
  }

  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const isValid = await comparePassword(dto.password, user.password);
  if (!isValid) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const token = generateToken({ id: user.id });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.name,
      email: user.email,
    },
  };
};

export const profile = async (userId: string): Promise<any> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const logout = async (): Promise<void> => {
  // Stateless JWT, no server-side invalidation needed.
};
