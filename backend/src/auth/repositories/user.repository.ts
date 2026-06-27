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

export const updateUserTokens = async (
  id: string,
  resetToken: string | null,
  resetTokenExpires: Date | null
): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data: { resetToken, resetTokenExpires },
  });
};

export const updateUserPassword = async (id: string, passwordHash: string): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data: { password: passwordHash, resetToken: null, resetTokenExpires: null },
  });
};

export const updateUserProfile = async (id: string, name: string, email: string): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data: { name, email },
  });
};

export const deleteUser = async (id: string): Promise<User> => {
  // Prune dependent relationships in transaction if needed, but schema RESTRICT prevents direct deletes if Restrict constraints exist.
  // Note: assets have ONDelete Restrict. So we must first delete incidents, notifications, scans, and assets!
  // Let's delete assets, which cascade-deletes hosts/services/vulnerabilities.
  return await prisma.$transaction(async (tx) => {
    // 1. Delete notifications
    await tx.notification.deleteMany({ where: { userId: id } });
    // 2. Delete audit logs
    await tx.auditLog.deleteMany({ where: { userId: id } });
    // 3. Delete incidents
    await tx.incident.deleteMany({ where: { createdById: id } });
    // 4. Delete scans (cascade deletes scan_hosts -> ports/hosts)
    await tx.scan.deleteMany({ where: { importedById: id } });
    // 5. Delete assets (which cascade deletes hosts -> services -> vulnerabilities)
    await tx.asset.deleteMany({ where: { ownerId: id } });
    // 6. Delete user
    return await tx.user.delete({
      where: { id },
    });
  });
};

export const findByResetToken = async (token: string): Promise<User | null> => {
  return await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date(),
      },
    },
  });
};

