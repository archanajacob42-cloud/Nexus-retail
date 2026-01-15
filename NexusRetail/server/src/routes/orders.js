const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Order = require('../../models/Order');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { userId, items, subtotal, shipping, tax, total } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const order = new Order({
      userId,
      items,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
    });

    const saved = await order.save();
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: saved._id,
        orderId: saved._id
      }
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
