import prisma from '../../config/prisma';
import { User } from '@prisma/client';

export const findByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findById = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = async (name: string, email: string, passwordHash: string): Promise<User> => {
  return await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
    },
  });
};
