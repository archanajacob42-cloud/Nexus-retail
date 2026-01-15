const mongoose = require('mongoose');
const { createOrder } = require('./orderController');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

jest.mock('../models/Order');
jest.mock('../models/Product');
jest.mock('../models/AuditLog');

describe('POST /api/orders - createOrder', () => {
  let req, res, session;

  beforeEach(() => {
    req = {
      user: { id: 'user123' },
      body: {
        items: [{ productId: 'prod123', quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Test City' },
        paymentMethod: 'credit_card'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create order successfully', async () => {
    const mockProduct = {
      _id: 'prod123',
      name: 'Test Product',
      price: 50,
      isActive: true,
      availableStock: 10
    };
    const mockOrder = {
      _id: 'order123',
      orderNumber: 'ORD-123',
      pricing: { total: 110 },
      items: [{ product: 'prod123', quantity: 2 }],
      deliveryStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date()
    };

    Product.find.mockReturnValue({ session: jest.fn().mockResolvedValue([mockProduct]) });
    Order.create.mockResolvedValue([mockOrder]);
    Product.findByIdAndUpdate.mockResolvedValue(mockProduct);
    AuditLog.create.mockResolvedValue([{}]);

    await createOrder(req, res);

    expect(session.commitTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Order created successfully'
    }));
  });

  test('should fail when items array is empty', async () => {
    req.body.items = [];

    await createOrder(req, res);

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Order must contain at least one item'
    });
  });

  test('should fail when shipping address is missing', async () => {
    req.body.shippingAddress = null;

    await createOrder(req, res);

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Shipping address and payment method are required'
    });
  });

  test('should fail when product is out of stock', async () => {
    const mockProduct = {
      _id: 'prod123',
      name: 'Test Product',
      isActive: true,
      availableStock: 1
    };

    Product.find.mockReturnValue({ session: jest.fn().mockResolvedValue([mockProduct]) });

    await createOrder(req, res);

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('insufficient stock')
    }));
  });
});
