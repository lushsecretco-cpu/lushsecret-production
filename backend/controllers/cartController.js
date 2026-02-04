import pool from '../db.js';

// GET carrito del usuario
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener o crear carrito
    let cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    
    if (cart.rows.length === 0) {
      cart = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    // Obtener items del carrito
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.main_image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      cartId,
      items,
      total: parseFloat(total.toFixed(2)),
      itemCount: items.length
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    // Verificar que el producto existe y tiene stock
    const product = await pool.query(
      'SELECT id, price, stock FROM products WHERE id = $1',
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Obtener o crear carrito
    let cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    
    if (cart.rows.length === 0) {
      cart = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    // Verificar si el producto ya está en el carrito
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Actualizar cantidad
      result = await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING id, product_id, quantity',
        [quantity, existingItem.rows[0].id]
      );
    } else {
      // Insertar nuevo item
      result = await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id, product_id, quantity',
        [cartId, productId, quantity]
      );
    }

    res.json({ message: 'Item added to cart', item: result.rows[0] });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Verificar que el item pertenece al usuario
    const cartItem = await pool.query(
      `SELECT ci.id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [itemId, userId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Error removing from cart', error: err.message });
  }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Si la cantidad es 0, eliminar el item
    if (quantity === 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
      return res.json({ message: 'Item removed from cart' });
    }

    // Verificar que el item pertenece al usuario
    const cartItem = await pool.query(
      `SELECT ci.id, ci.product_id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [itemId, userId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Verificar stock disponible
    const product = await pool.query(
      'SELECT stock FROM products WHERE id = $1',
      [cartItem.rows[0].product_id]
    );

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING id, product_id, quantity',
      [quantity, itemId]
    );

    res.json({ message: 'Cart item updated', item: result.rows[0] });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener carrito del usuario
    const cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    
    if (cart.rows.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.rows[0].id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
};
