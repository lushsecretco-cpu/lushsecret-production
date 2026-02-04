import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendShippingNotificationEmail, sendDeliveryConfirmationEmail } from '../services/emailService.js';

export const getAdminOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email, u.full_name,
              json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'product_name', p.name, 'quantity', oi.quantity, 'price', oi.price)) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id, u.id, u.email, u.full_name
       ORDER BY o.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const result = await pool.query(
      'UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [orderStatus, orderId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

export const generateTrackingNumber = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const orderResult = await pool.query(
      'SELECT o.*, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const trackingNumber = `LSH-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Update order with tracking number and shipping date
    const updateResult = await pool.query(
      `UPDATE orders 
       SET tracking_number = $1, order_status = 'enviado', shipping_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [trackingNumber, orderId]
    );

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.product_id, p.name as product_name, oi.quantity, oi.price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Send email with tracking number
    await sendShippingNotificationEmail(
      order.email,
      {
        orderId,
        items: itemsResult.rows,
      },
      trackingNumber
    );

    res.json({
      trackingNumber,
      order: updateResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating tracking number' });
  }
};

export const markAsDelivered = async (req, res) => {
  try {
    const { orderId, trackingNumber } = req.body;

    const orderResult = await pool.query(
      'SELECT o.*, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Update order status
    const updateResult = await pool.query(
      `UPDATE orders 
       SET order_status = 'recibido', delivery_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [orderId]
    );

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.product_id, p.name as product_name, oi.quantity
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Send delivery confirmation email
    await sendDeliveryConfirmationEmail(
      order.email,
      {
        orderId,
        items: itemsResult.rows,
      },
      trackingNumber || order.tracking_number
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking order as delivered' });
  }
};

export const trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const result = await pool.query(
      `SELECT o.id, o.tracking_number, o.order_status, o.shipping_date, o.delivery_date, 
              u.full_name, u.email,
              s.guide_number, s.carrier, s.tracking_url,
              json_agg(json_build_object('product_name', p.name, 'quantity', oi.quantity)) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN shipments s ON s.order_id = o.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.tracking_number = $1 OR s.guide_number = $1
       GROUP BY o.id, u.id, s.id`,
      [trackingNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tracking number not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error tracking shipment' });
  }
};
