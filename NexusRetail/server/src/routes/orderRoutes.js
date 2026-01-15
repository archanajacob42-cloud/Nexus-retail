const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes (customer)
router.post('/', protect, orderController.createOrder); // Create order
router.get('/', protect, orderController.getOrders); // Get user's orders

// Admin only routes (must come before :id route to avoid conflicts)
router.get('/admin/all', protect, authorize('admin'), orderController.getAllOrders);

router.get('/stats/dashboard', protect, authorize('admin'), orderController.getOrderStats); // Order statistics

// Dynamic routes (must come last)
router.get('/:id', protect, orderController.getOrderById); // Get single order
router.put('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus); // Update status
router.delete('/:id/cancel', protect, authorize('admin'), orderController.cancelOrder); // Cancel order

module.exports = router;
