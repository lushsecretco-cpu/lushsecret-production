import express from 'express';
import {
  getOrderPayment,
  generatePaymentLink,
  payuWebhook,
  getAllPayments,
  getPaymentStats
} from '../controllers/paymentController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas (Usuario)
router.get('/:orderId', authenticateToken, getOrderPayment);
router.post('/link/:orderId', authenticateToken, generatePaymentLink);

// Webhook público (PayU)
router.post('/payu-webhook', payuWebhook);

// Rutas admin
router.get('/', authenticateToken, authorizeAdmin, getAllPayments);
router.get('/stats', authenticateToken, authorizeAdmin, getPaymentStats);

export default router;
