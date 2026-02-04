import pool from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../public/uploads');

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET todos los productos (con filtros)
export const getAllProducts = async (req, res) => {
  try {
    const { categoryId, categorySlug, search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, 
             p.stock, p.views, p.conversions, p.main_image_url, 
             p.created_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (categoryId) {
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
      paramCount++;
    }

    if (categorySlug) {
      query += ` AND c.slug = $${paramCount}`;
      params.push(categorySlug);
      paramCount++;
    }

    if (search) {
      query += ` AND p.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// GET producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Actualizar vistas
    await pool.query('UPDATE products SET views = views + 1 WHERE id = $1', [id]);

    const result = await pool.query(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, 
              p.stock, p.views, p.conversions, p.main_image_url, 
              p.created_at, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// GET producto por slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Actualizar vistas
    await pool.query('UPDATE products SET views = views + 1 WHERE slug = $1', [slug]);

    const result = await pool.query(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, 
              p.stock, p.views, p.conversions, p.main_image_url, 
              p.created_at, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// CREATE producto (ADMIN)
export const createProduct = async (req, res) => {
  try {
    const { categoryId, name, slug, description, price, stock } = req.body;
    const adminId = req.user?.id;

    if (!categoryId || !name || !slug || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verificar que el slug sea único
    const existingSlug = await pool.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      return res.status(409).json({ message: 'Product slug already exists' });
    }

    const result = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, price, stock, created_by_admin_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category_id, name, slug, description, price, stock, created_at`,
      [categoryId, name, slug, description, price, stock || 0, adminId]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

// UPDATE producto (ADMIN)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price), 
           stock = COALESCE($4, stock)
       WHERE id = $5
       RETURNING id, name, description, price, stock, updated_at`,
      [name, description, price, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

// DELETE producto (ADMIN)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', productId: result.rows[0].id });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

// GET productos trending (más vendidos)
export const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT id, name, slug, price, main_image_url, conversions
       FROM products
       WHERE stock > 0
       ORDER BY conversions DESC, views DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get trending error:', err);
    res.status(500).json({ message: 'Error fetching trending products', error: err.message });
  }
};

// GET estadísticas de producto (ADMIN)
export const getProductStats = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, price, stock, views, conversions,
              ROUND((CAST(conversions AS FLOAT) / NULLIF(views, 0) * 100)::NUMERIC, 2) as conversion_rate,
              (CAST(conversions AS FLOAT) * price) as revenue
       FROM products
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Crear nombre de archivo único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}-${req.file.originalname.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, fileName);

    // Guardar archivo
    fs.writeFileSync(filePath, req.file.buffer);

    // Construir URL pública (será reemplazada por Cloudflare R2 en producción)
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${fileName}`;

    res.json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};
