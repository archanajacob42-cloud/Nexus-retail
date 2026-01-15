/**
 * Product Controller
 * Handles all product-related operations
 */

const Product = require('../models/Product');

// Get all products with filtering options
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;

    // Build filter object
    let filter = { isActive: true };

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by search term
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    let sortOptions = {};
    if (sortBy === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { 'ratings.average': -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    // Get products with population
    const products = await Product.find(filter)
      .sort(sortOptions)
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// Get single product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'createdBy',
      'firstName lastName email'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// Get low stock products (admin only)
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $addFields: {
          isLowStock: { $lt: ['$stock.quantity', '$stock.reorderLevel'] }
        }
      },
      {
        $match: { isLowStock: true }
      },
      {
        $sort: { 'stock.quantity': 1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          isLowStock: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message,
    });
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      subCategory,
      stock,
      images,
      sku,
      weight,
      dimensions,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if product with SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
      });
    }

    // Create new product
    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      category,
      subCategory,
      stock: stock || { quantity: 0, reserved: 0, reorderLevel: 10 },
      images: images || [],
      sku,
      weight,
      dimensions,
      createdBy: req.user._id,
      isActive: true,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find and update product
    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
  try {
    const stats = {
      totalProducts: await Product.countDocuments({ isActive: true }),
      lowStockCount: await Product.countDocuments({
        isActive: true,
        $expr: { $lt: ['$stock.quantity', '$stock.reorderLevel'] },
      }),
      outOfStock: await Product.countDocuments({
        isActive: true,
        'stock.quantity': 0,
      }),
      averagePrice: await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgPrice: { $avg: '$price' } } },
      ]),
      totalStock: await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalQty: { $sum: '$stock.quantity' } } },
      ]),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: error.message,
    });
  }
};
