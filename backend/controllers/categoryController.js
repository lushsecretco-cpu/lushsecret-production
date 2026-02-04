import pool from '../db.js';

// GET todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, description, image_url FROM categories ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

// GET categoría por slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT id, name, slug, description, image_url FROM categories WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ message: 'Error fetching category', error: err.message });
  }
};

// GET categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, slug, description, image_url FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ message: 'Error fetching category', error: err.message });
  }
};
