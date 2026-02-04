import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// GET órdenes del usuario
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT id, reference_number, total, status, payment_method, created_at, updated_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// GET orden por ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar si el usuario es admin o propietario de la orden
    const roleCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    const isAdmin = roleCheck.rows[0]?.role === 'ADMIN';

    const orderQuery = `
      SELECT o.id, o.reference_number, o.total, o.subtotal, o.tax, o.shipping_cost,
             o.status, o.payment_method, o.notes, o.created_at, o.updated_at,
             o.user_id, o.shipping_address_id,
             u.email as customer_email, u.name as customer_name, u.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;

    const params = [id];

    // Si no es admin, filtrar por usuario
    if (!isAdmin) {
      const result = await pool.query(
        orderQuery + ' AND o.user_id = $2',
        [...params, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      var order = result.rows[0];
    } else {
      const result = await pool.query(orderQuery, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      var order = result.rows[0];
    }

    // Obtener items de la orden
    const itemsResult = await pool.query(
      `SELECT oi.id, oi.product_id, oi.product_name, oi.quantity, oi.unit_price as price, oi.subtotal
       FROM order_items oi
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;

    // Obtener información de envío
    const shipmentResult = await pool.query(
      `SELECT id, guide_number, carrier, status, estimated_delivery_date, tracking_url
       FROM shipments
       WHERE order_id = $1`,
      [id]
    );

    order.shipment = shipmentResult.rows[0] || null;

    // Obtener dirección de envío
    if (order.shipping_address_id) {
      const addressResult = await pool.query(
        `SELECT * FROM addresses WHERE id = $1`,
        [order.shipping_address_id]
      );
      if (addressResult.rows[0]) {
        order.shipping_address = addressResult.rows[0];
      }
    }

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// CREATE orden (checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, shippingAddressId, notes } = req.body;

    if (!paymentMethod || !shippingAddressId) {
      return res.status(400).json({ message: 'Payment method and shipping address are required' });
    }

    // Obtener carrito del usuario
    const cartResult = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calcular total y verificar stock
    let subtotal = 0;
    const items = [];

    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for product: ${item.name}` 
        });
      }
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      items.push({ ...item, subtotal: itemTotal });
    }

    const tax = parseFloat((subtotal * 0.19).toFixed(2)); // IVA 19%
    const shippingCost = 15000; // COP
    const total = subtotal + tax + shippingCost;

    // Generar número de referencia único
    const referenceNumber = `LS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Crear orden
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, subtotal, tax, shipping_cost, total, status, 
                          payment_method, shipping_address_id, reference_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, reference_number, total, status, created_at`,
      [userId, subtotal, tax, shippingCost, total, 'PENDING', paymentMethod, shippingAddressId, referenceNumber, notes || null]
    );

    const orderId = orderResult.rows[0].id;

    // Insertar items de la orden
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.product_id, item.name, item.quantity, item.price, item.subtotal]
      );

      // Reducir stock del producto
      await pool.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Crear registro de pago
    await pool.query(
      `INSERT INTO payments (order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4)`,
      [orderId, total, 'COP', 'PENDING']
    );

    // Limpiar carrito
    const cartId = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartId.rows.length > 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId.rows[0].id]);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...orderResult.rows[0],
        items,
        subtotal,
        tax,
        shippingCost
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// GET todas las órdenes (ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `SELECT o.id, o.reference_number, o.user_id, o.total, o.subtotal, o.tax, 
                        o.shipping_cost, o.status, o.payment_method, o.shipping_address_id,
                        o.created_at, o.updated_at,
                        u.email as customer_email, u.name as customer_name, u.phone as customer_phone
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// UPDATE estado de orden (ADMIN)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status, updated_at',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Error updating order', error: err.message });
  }
};
