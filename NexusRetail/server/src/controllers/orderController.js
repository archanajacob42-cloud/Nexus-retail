const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Create a new order with transaction support
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validation
    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (!shippingAddress || !paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required',
      });
    }

    // Step 1: Validate and fetch all products, check stock levels
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    if (products.length !== productIds.length) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'One or more products not found',
      });
    }

    // Check stock availability for all items
    const stockCheckResults = [];
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      if (!product.isActive) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is no longer available`,
        });
      }

      const availableStock = product.availableStock;

      if (availableStock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" has insufficient stock. Available: ${availableStock}, Requested: ${item.quantity}`,
        });
      }

      stockCheckResults.push({
        product,
        quantity: item.quantity,
      });
    }

    // Step 2: Build order items and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { product, quantity } = stockCheckResults[i];

      const priceAtPurchase = product.discountPrice || product.price;
      const itemSubtotal = priceAtPurchase * quantity;

      orderItems.push({
        product: product._id,
        quantity,
        priceAtPurchase,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Calculate taxes and final total
    const tax = subtotal * 0.1; // 10% tax (adjustable)
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const orderDiscount = req.body.couponDiscount || 0;
    const total = subtotal + tax + shippingCost - orderDiscount;

    // Step 3: Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Step 4: Create order record
    const order = await Order.create(
      [
        {
          orderNumber,
          user: userId,
          items: orderItems,
          pricing: {
            subtotal,
            tax,
            shippingCost,
            discount: orderDiscount,
            total,
          },
          shippingAddress,
          paymentMethod,
          paymentStatus: 'completed',
          deliveryStatus: 'pending',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date(),
              notes: 'Order created successfully',
            },
          ],
        },
      ],
      { session }
    );

    const createdOrder = order[0];

    // Step 5: Update product stock levels
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);

      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: {
            'stock.quantity': -item.quantity,
            'stock.reserved': item.quantity,
          },
        },
        { session, new: true }
      );
    }

    // Step 6: Create audit log entry
    await AuditLog.create(
      [
        {
          adminUser: userId,
          action: 'CREATE',
          entityType: 'Order',
          entityId: createdOrder._id,
          entityName: orderNumber,
          description: `Order created with ${orderItems.length} item(s), Total: $${total.toFixed(2)}`,
          status: 'success',
          severity: 'low',
          affectedRecords: orderItems.length,
          changes: {
            before: null,
            after: {
              orderNumber,
              total,
              itemCount: orderItems.length,
              deliveryStatus: 'pending',
            },
          },
          metadata: {
            items: orderItems.length,
            total,
          },
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.pricing.total,
        itemCount: createdOrder.items.length,
        deliveryStatus: createdOrder.deliveryStatus,
        paymentStatus: createdOrder.paymentStatus,
        createdAt: createdOrder.createdAt,
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();

    console.error('Order creation error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get all orders for current user
 * @route   GET /api/orders
 * @access  Private
 */
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };

    if (status) {
      query.deliveryStatus = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price discountPrice images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders',
    });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private (Admin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments();

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders',
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name price discountPrice sku images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns this order or is admin
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order',
    });
  }
};

/**
 * @desc    Update order delivery status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin)
 */
exports.updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { deliveryStatus, trackingNumber, notes } = req.body;
    const adminId = req.user.id;

    // Validation
    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
    ];

    if (!validStatuses.includes(deliveryStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    // Find order
    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Store old data for audit log
    const oldData = {
      deliveryStatus: order.deliveryStatus,
      trackingNumber: order.trackingNumber,
    };

    // Update order
    order.deliveryStatus = deliveryStatus;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    order.statusHistory.push({
      status: deliveryStatus,
      timestamp: new Date(),
      notes: notes || '',
    });

    // Set estimated delivery date if shipped
    if (deliveryStatus === 'shipped' && !order.estimatedDeliveryDate) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days delivery
      order.estimatedDeliveryDate = deliveryDate;
    }

    if (deliveryStatus === 'delivered') {
      order.actualDeliveryDate = new Date();
    }

    await order.save({ session });

    // Create audit log
    await AuditLog.create(
      [
        {
          adminUser: adminId,
          action: 'UPDATE',
          entityType: 'Order',
          entityId: order._id,
          entityName: order.orderNumber,
          description: `Order status updated from ${oldData.deliveryStatus} to ${deliveryStatus}`,
          status: 'success',
          severity: 'medium',
          changes: {
            before: oldData,
            after: {
              deliveryStatus,
              trackingNumber: trackingNumber || null,
            },
          },
          metadata: {
            notes,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        deliveryStatus: order.deliveryStatus,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status',
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Cancel order (Admin only, with stock rollback)
 * @route   DELETE /api/orders/:id/cancel
 * @access  Private (Admin)
 */
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Cannot cancel delivered or already cancelled orders
    if (
      order.deliveryStatus === 'delivered' ||
      order.deliveryStatus === 'cancelled'
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is ${order.deliveryStatus}`,
      });
    }

    // Restore stock for all items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            'stock.quantity': item.quantity,
            'stock.reserved': -item.quantity,
          },
        },
        { session, new: true }
      );
    }

    // Update order
    const oldStatus = order.deliveryStatus;
    order.deliveryStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      notes: reason || 'Order cancelled by admin',
    });

    await order.save({ session });

    // Create audit log
    await AuditLog.create(
      [
        {
          adminUser: adminId,
          action: 'DELETE',
          entityType: 'Order',
          entityId: order._id,
          entityName: order.orderNumber,
          description: `Order cancelled. Previous status: ${oldStatus}. Reason: ${reason || 'Not specified'}`,
          status: 'success',
          severity: 'high',
          affectedRecords: order.items.length,
          changes: {
            before: { deliveryStatus: oldStatus },
            after: { deliveryStatus: 'cancelled' },
          },
          metadata: {
            reason,
            itemsRestored: order.items.length,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        deliveryStatus: order.deliveryStatus,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order',
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get order statistics (Admin only)
 * @route   GET /api/orders/stats/dashboard
 * @access  Private (Admin)
 */
exports.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totalOrders: [{ $count: 'count' }],
          totalRevenue: [
            {
              $group: {
                _id: null,
                total: { $sum: '$pricing.total' },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$deliveryStatus',
                count: { $sum: 1 },
              },
            },
          ],
          byPaymentStatus: [
            {
              $group: {
                _id: '$paymentStatus',
                count: { $sum: 1 },
              },
            },
          ],
          averageOrderValue: [
            {
              $group: {
                _id: null,
                average: { $avg: '$pricing.total' },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders: stats[0].totalOrders[0]?.count || 0,
        totalRevenue: stats[0].totalRevenue[0]?.total || 0,
        averageOrderValue: stats[0].averageOrderValue[0]?.average || 0,
        byStatus: stats[0].byStatus,
        byPaymentStatus: stats[0].byPaymentStatus,
      },
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order statistics',
    });
  }
};
