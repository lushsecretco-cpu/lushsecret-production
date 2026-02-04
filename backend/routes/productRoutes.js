import express from 'express';
import multer from 'multer';
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
  getProductStats,
  uploadMedia
} from '../controllers/productController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Rutas públicas
router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);

// Rutas protegidas (Admin)
router.post('/', authenticateToken, authorizeAdmin, createProduct);
router.put('/:id', authenticateToken, authorizeAdmin, updateProduct);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteProduct);
router.get('/stats/:id', authenticateToken, authorizeAdmin, getProductStats);
router.post('/upload-media', authenticateToken, authorizeAdmin, upload.single('file'), uploadMedia);

export default router;
