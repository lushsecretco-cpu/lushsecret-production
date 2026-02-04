import express from 'express';
import { getAllCategories, getCategoryBySlug, getCategoryById } from '../controllers/categoryController.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

export default router;
