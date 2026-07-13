import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { authenticate, validateRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, profileSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, validateRequest(profileSchema), updateProfile);

export default router;
