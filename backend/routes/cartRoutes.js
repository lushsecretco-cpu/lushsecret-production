import express from 'express';
import { getCart, addToCart, removeFromCart, updateCartItem, clearCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas
router.get('/', authenticateToken, getCart);
router.post('/', authenticateToken, addToCart);
router.delete('/:itemId', authenticateToken, removeFromCart);
router.put('/:itemId', authenticateToken, updateCartItem);
router.delete('/', authenticateToken, clearCart);

export default router;
