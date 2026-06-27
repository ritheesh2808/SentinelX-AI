import prisma from './prisma';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

export const bootstrapAdmin = async (): Promise<void> => {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const email = 'admin@sentinelx.ai';
      const password = 'SecureAdminPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'System Admin',
          role: UserRole.ADMIN,
          isActive: true,
          isEmailVerified: true,
        },
      });

      console.log(`[BOOTSTRAP] Default Admin account created: ${email}`);
    }
  } catch (error) {
    console.error('[BOOTSTRAP] Failed to bootstrap admin account:', error);
  }
};
