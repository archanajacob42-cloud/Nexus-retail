/**
 * Database Seeding Script
 * Run: node server/src/scripts/seedDatabase.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment');
    }
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);

    // Create sample users
    const users = await User.create([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@nexusretail.com',
        password: await bcrypt.hash('admin123', salt),
        phone: '+1 (555) 123-4567',
        role: 'admin',
        isActive: true,
        address: {
          street: '123 Admin Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        totalOrders: 0,
        totalSpent: 0,
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'customer@nexusretail.com',
        password: await bcrypt.hash('customer123', salt),
        phone: '+1 (555) 234-5678',
        role: 'customer',
        isActive: true,
        address: {
          street: '456 Customer Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        totalOrders: 0,
        totalSpent: 0,
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', salt),
        phone: '+1 (555) 345-6789',
        role: 'customer',
        isActive: true,
        address: {
          street: '789 Main Street',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        totalOrders: 0,
        totalSpent: 0,
      },
    ]);

    console.log('✅ Created 3 users');

    // Create sample products
    const products = await Product.create([
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality',
        price: 199.99,
        discountPrice: 149.99,
        category: 'Electronics',
        subCategory: 'Audio',
        stock: {
          quantity: 50,
          reserved: 5,
          reorderLevel: 10,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Wireless+Headphones',
            altText: 'Wireless Headphones',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.5,
          count: 128,
        },
        sku: 'ELEC-001-WH',
        weight: { value: 0.25, unit: 'kg' },
        dimensions: {
          length: 20,
          width: 18,
          height: 8,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable and durable 100% cotton t-shirt, available in multiple colors',
        price: 29.99,
        discountPrice: 19.99,
        category: 'Clothing',
        subCategory: 'Shirts',
        stock: {
          quantity: 200,
          reserved: 20,
          reorderLevel: 50,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Cotton+TShirt',
            altText: 'Cotton T-Shirt',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.2,
          count: 256,
        },
        sku: 'CLOTH-001-TS',
        weight: { value: 0.15, unit: 'kg' },
        dimensions: {
          length: 70,
          width: 50,
          height: 2,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Keep your drinks hot or cold for 24 hours with this insulated water bottle',
        price: 39.99,
        discountPrice: null,
        category: 'Home & Garden',
        subCategory: 'Kitchen',
        stock: {
          quantity: 3,
          reserved: 1,
          reorderLevel: 15,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Water+Bottle',
            altText: 'Water Bottle',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.7,
          count: 89,
        },
        sku: 'HOME-001-WB',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: {
          length: 10,
          width: 10,
          height: 25,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap, perfect for home or studio practice',
        price: 45.99,
        discountPrice: 34.99,
        category: 'Sports',
        subCategory: 'Fitness',
        stock: {
          quantity: 75,
          reserved: 10,
          reorderLevel: 20,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Yoga+Mat',
            altText: 'Yoga Mat',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.3,
          count: 167,
        },
        sku: 'SPORT-001-YM',
        weight: { value: 1.2, unit: 'kg' },
        dimensions: {
          length: 183,
          width: 61,
          height: 0.6,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        name: 'The Art of Programming',
        description: 'Comprehensive guide to mastering programming concepts and best practices',
        price: 59.99,
        discountPrice: 44.99,
        category: 'Books',
        subCategory: 'Technology',
        stock: {
          quantity: 2,
          reserved: 0,
          reorderLevel: 25,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Programming+Book',
            altText: 'Programming Book',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.6,
          count: 342,
        },
        sku: 'BOOK-001-AP',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: {
          length: 23,
          width: 15,
          height: 3,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        name: 'Organic Face Serum',
        description: 'Anti-aging organic serum with vitamin C and hyaluronic acid',
        price: 79.99,
        discountPrice: null,
        category: 'Beauty',
        subCategory: 'Skincare',
        stock: {
          quantity: 30,
          reserved: 5,
          reorderLevel: 10,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Face+Serum',
            altText: 'Face Serum',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.8,
          count: 94,
        },
        sku: 'BEAUTY-001-FS',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: {
          length: 5,
          width: 5,
          height: 10,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        name: 'Action Figure Set',
        description: 'Set of 5 collectible action figures with detailed sculpting',
        price: 49.99,
        discountPrice: 34.99,
        category: 'Toys',
        subCategory: 'Action Figures',
        stock: {
          quantity: 15,
          reserved: 2,
          reorderLevel: 5,
        },
        images: [
          {
            url: 'https://via.placeholder.com/500?text=Action+Figures',
            altText: 'Action Figure Set',
            isMain: true,
          },
        ],
        ratings: {
          average: 4.4,
          count: 76,
        },
        sku: 'TOYS-001-AF',
        weight: { value: 0.4, unit: 'kg' },
        dimensions: {
          length: 20,
          width: 15,
          height: 25,
          unit: 'cm',
        },
        isActive: true,
        createdBy: users[0]._id,
      },
    ]);

    console.log('✅ Created 7 sample products');

    console.log('\n📊 Database Seeding Complete!\n');
    console.log('Sample Login Credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin User:');
    console.log('  Email: admin@nexusretail.com');
    console.log('  Password: admin123');
    console.log('\nCustomer User:');
    console.log('  Email: customer@nexusretail.com');
    console.log('  Password: customer123');
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(() => seedDatabase());
