const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllProducts,
  getProduct,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require('../controllers/productController');

const router = express.Router();

// GET routes with specific paths FIRST
// Get low stock products
router.get('/low-stock', protect, authorize('admin'), getLowStockProducts);

// Get product stats
router.get('/stats', protect, authorize('admin'), getProductStats);

// Get all products
router.get('/', getAllProducts);

// GET routes with dynamic paths LAST
// Get single product
router.get('/:id', getProduct);

// POST routes
// Create product (admin only)
router.post('/', protect, authorize('admin'), createProduct);

// PUT routes
// Update product (admin only)
router.put('/:id', protect, authorize('admin'), updateProduct);

// DELETE routes
// Delete product (admin only)
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
