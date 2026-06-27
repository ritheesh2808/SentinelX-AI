import { Router } from 'express';
import {
  register,
  login,
  logout,
  profile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  deleteAccount,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, profile);

// New auth & account management routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authenticate, changePassword);
router.put('/profile', authenticate, updateProfile);
router.delete('/account', authenticate, deleteAccount);

export default router;
