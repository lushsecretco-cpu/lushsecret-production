import express from 'express';
import {
  register,
  login,
  requestRegisterCode,
  oauthLogin,
  requestPasswordlessCode,
  verifyPasswordlessCode,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { authenticateToken, adminSecretAuth } from '../middleware/auth.js';

const router = express.Router();

// Auth endpoints
router.post('/register', register);
router.post('/register/request-code', requestRegisterCode);
router.post('/login', login);
router.post('/oauth', oauthLogin);
router.post('/admin-login', adminSecretAuth); // Login vía URL secreta

// Passwordless authentication
router.post('/passwordless/request', requestPasswordlessCode);
router.post('/passwordless/verify', verifyPasswordlessCode);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
