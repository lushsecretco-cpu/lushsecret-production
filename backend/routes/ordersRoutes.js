import express from 'express';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/ordersController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas admin (deben ir primero para evitar conflictos)
router.get('/admin/all', authenticateToken, authorizeAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, authorizeAdmin, updateOrderStatus);

// Rutas protegidas (Usuario)
router.get('/', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);
router.post('/', authenticateToken, createOrder);
export default router;