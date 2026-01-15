const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Electronics',
          'Clothing',
          'Home & Garden',
          'Sports',
          'Books',
          'Beauty',
          'Toys',
          'Other',
        ],
        message: 'Please select a valid category',
      },
    },
    subCategory: {
      type: String,
      default: null,
    },
    stock: {
      quantity: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0,
      },
      reserved: {
        type: Number,
        default: 0,
        min: [0, 'Reserved stock cannot be negative'],
      },
      reorderLevel: {
        type: Number,
        default: 10,
        min: [0, 'Reorder level cannot be negative'],
      },
      lastRestocked: {
        type: Date,
        default: null,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        altText: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ 'stock.quantity': 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for available stock
productSchema.virtual('availableStock').get(function () {
  return this.stock.quantity - this.stock.reserved;
});

// Method to check if product is low on stock
productSchema.methods.isLowStock = function () {
  return this.availableStock <= this.stock.reorderLevel;
};

module.exports = mongoose.model('Product', productSchema);
