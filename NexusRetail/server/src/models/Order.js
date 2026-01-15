const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        priceAtPurchase: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, 'Discount cannot be negative'],
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
      },
      tax: {
        type: Number,
        required: true,
        min: [0, 'Tax cannot be negative'],
      },
      shippingCost: {
        type: Number,
        required: true,
        min: [0, 'Shipping cost cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative'],
      },
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    isReturned: {
      type: Boolean,
      default: false,
    },
    returnReason: {
      type: String,
      default: null,
    },
    returnDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ deliveryStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'statusHistory.timestamp': -1 });

// Method to update delivery status
orderSchema.methods.updateDeliveryStatus = function (newStatus, notes = '') {
  this.deliveryStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    notes: notes,
  });

  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }

  return this.save();
};

// Virtual for order age in days
orderSchema.virtual('orderAgeDays').get(function () {
  const now = new Date();
  const orderDate = new Date(this.createdAt);
  return Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Order', orderSchema);
