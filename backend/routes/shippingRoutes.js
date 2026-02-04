import express from 'express';
import { getAdminOrders, updateOrderStatus, generateTrackingNumber, markAsDelivered, trackShipment } from '../controllers/shippingController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/admin/orders', authenticateToken, authorizeAdmin, getAdminOrders);
router.put('/admin/order-status', authenticateToken, authorizeAdmin, updateOrderStatus);
router.post('/admin/generate-tracking/:orderId', authenticateToken, authorizeAdmin, generateTrackingNumber);
router.put('/admin/mark-delivered', authenticateToken, authorizeAdmin, markAsDelivered);

// Public tracking route
router.get('/track/:trackingNumber', trackShipment);

export default router;
