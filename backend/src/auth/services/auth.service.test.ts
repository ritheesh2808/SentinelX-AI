import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from './auth.service';
import * as userRepository from '../repositories/user.repository';

// Mock the user repository
vi.mock('../repositories/user.repository', () => ({
  findByEmail: vi.fn(),
  createUser: vi.fn(),
}));

describe('Auth Service Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Password Hashing & Strength Validation', () => {
    it('should successfully hash and verify passwords', async () => {
      const password = 'Password123!';
      const hash = await authService.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);

      const isValid = await authService.comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePassword('WrongPassword!', hash);
      expect(isInvalid).toBe(false);
    });

    it('should throw error if password is too short', async () => {
      await expect(
        authService.register({
          fullName: 'John Doe',
          email: 'test@example.com',
          password: 'Short1!',
        })
      ).rejects.toEqual({
        status: 400,
        message: 'Password must be at least 8 characters long.',
      });
    });

    it('should throw error if password lacks uppercase letter', async () => {
      await expect(
        authService.register({
          fullName: 'John Doe',
          email: 'test@example.com',
          password: 'password123!',
        })
      ).rejects.toEqual({
        status: 400,
        message: 'Password must contain at least one uppercase letter.',
      });
    });

    it('should throw error if password lacks special character', async () => {
      await expect(
        authService.register({
          fullName: 'John Doe',
          email: 'test@example.com',
          password: 'Password123',
        })
      ).rejects.toEqual({
        status: 400,
        message: 'Password must contain at least one special character.',
      });
    });
  });

  describe('User Registration', () => {
    it('should register a new user successfully if email does not exist', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.createUser).mockResolvedValue({
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'John Doe',
      } as any);

      await expect(
        authService.register({
          fullName: 'John Doe',
          email: 'test@example.com',
          password: 'SecurePassword123!',
        })
      ).resolves.not.toThrow();

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.createUser).toHaveBeenCalled();
    });

    it('should throw error if email format is invalid', async () => {
      await expect(
        authService.register({
          fullName: 'John Doe',
          email: 'invalid-email',
          password: 'SecurePassword123!',
        })
      ).rejects.toEqual({
        status: 400,
        message: 'Invalid email address format',
      });
    });

    it('should throw error if email already exists', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      } as any);

      await expect(
        authService.register({
          fullName: 'John Doe',
          email: 'test@example.com',
          password: 'SecurePassword123!',
        })
      ).rejects.toEqual({
        status: 409,
        message: 'Email already exists',
      });
    });
  });
});
