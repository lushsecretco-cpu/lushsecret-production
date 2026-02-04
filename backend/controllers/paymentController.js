import axios from 'axios';
import pool from '../db.js';
import crypto from 'crypto';

// GET información de pago de una orden
export const getOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verificar que la orden pertenece al usuario
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await pool.query(
      'SELECT id, order_id, amount, currency, status, transaction_id, created_at FROM payments WHERE order_id = $1',
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ message: 'Error fetching payment', error: err.message });
  }
};

// GENERAR LINK DE PAGO PayU
export const generatePaymentLink = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Obtener orden
    const orderResult = await pool.query(
      `SELECT o.id, o.reference_number, o.total, o.payment_method, u.email, u.name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Aquí iría la lógica de generación de link de PayU
    // Por ahora retornamos un mock
    const paymentLink = `https://gateway.payulatam.com/ppp-web-gateway/pb.zul?merchantId=${process.env.PAYU_MERCHANT_ID}&accountId=2&referenceCode=${order.reference_number}&amount=${order.total}&currency=COP&buyerEmail=${order.email}`;

    res.json({
      message: 'Payment link generated',
      paymentLink,
      referenceNumber: order.reference_number,
      amount: order.total,
      currency: 'COP'
    });
  } catch (err) {
    console.error('Generate payment link error:', err);
    res.status(500).json({ message: 'Error generating payment link', error: err.message });
  }
};

// WEBHOOK de PayU (confirmar pago)
export const payuWebhook = async (req, res) => {
  try {
    const { reference_pol, state_pol, description_pol, value, currency, reference_code } = req.body;

    console.log('📥 PayU Webhook received:', {
      reference_code,
      state_pol,
      value,
      description_pol
    });

    // States: 4=Approved, 5=Declined, 6=Pending, 7=Expired, 8=Abandoned, 14=Refunded
    const isPaid = state_pol === '4';

    // Buscar orden por referencia
    const orderResult = await pool.query(
      'SELECT id FROM orders WHERE reference_number = $1',
      [reference_code]
    );

    if (orderResult.rows.length === 0) {
      console.warn('⚠️ Order not found for reference:', reference_code);
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderId = orderResult.rows[0].id;

    // Actualizar estado de pago
    await pool.query(
      `UPDATE payments 
       SET status = $1, transaction_id = $2, payu_response = $3
       WHERE order_id = $4`,
      [isPaid ? 'APPROVED' : 'DECLINED', reference_pol, JSON.stringify(req.body), orderId]
    );

    // Actualizar estado de orden
    if (isPaid) {
      await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        ['PAYMENT_CONFIRMED', orderId]
      );

      console.log('✅ Payment confirmed for order:', orderId);

      // TODO: Enviar email de confirmación de pago
      // TODO: Incrementar conversiones del producto
    } else {
      await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        ['CANCELLED', orderId]
      );

      console.log('❌ Payment declined for order:', orderId);
    }

    // PayU requiere respuesta 200
    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('PayU webhook error:', err);
    res.status(500).json({ message: 'Error processing webhook', error: err.message });
  }
};

// GET todas las transacciones (ADMIN)
export const getAllPayments = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `SELECT p.id, p.order_id, p.amount, p.currency, p.status, 
                        p.transaction_id, p.created_at, p.updated_at
                 FROM payments p
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get all payments error:', err);
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
};

// GET estadísticas de pagos (ADMIN)
export const getPaymentStats = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'DECLINED' THEN 1 ELSE 0 END) as declined_count,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'APPROVED' THEN amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'APPROVED' THEN amount END) as avg_transaction
       FROM payments`
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get payment stats error:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

// Generic order creation
export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentMethod } = req.body;

    // Get user email
    const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const userEmail = userResult.rows[0]?.email;

    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total_amount, status, payment_method, order_status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, totalAmount, 'pending', paymentMethod, 'preparando']
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.price]
      );

      // Decrease stock
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    // Clear cart
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    // Get order items with product names
    const itemsResult = await pool.query(
      `SELECT oi.product_id, p.name as productName, oi.quantity, oi.price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Send purchase confirmation email to customer
    await sendPurchaseConfirmationEmail(userEmail, {
      orderId,
      totalAmount,
      items: itemsResult.rows,
      createdAt: new Date(),
    });

    // Send confirmation email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendPaymentConfirmationEmail(adminEmail, {
        orderId,
        customerEmail: userEmail,
        totalAmount,
        paymentMethod,
        items: itemsResult.rows,
        createdAt: new Date(),
      });
    }

    res.status(201).json({ orderId, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, paymentId } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1, payment_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, paymentId, orderId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order' });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object('product_id', oi.product_id, 'product_name', p.name, 'quantity', oi.quantity, 'price', oi.price)) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
