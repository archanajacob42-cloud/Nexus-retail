import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navigation from '../components/Navigation';

const CartPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
    clearCart,
  } = useCart();

  const handleCheckout = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!user) {
        setError('Please log in to proceed with checkout');
        setIsLoading(false);
        return;
      }

      if (!user._id) {
        setError('User information is incomplete');
        setIsLoading(false);
        return;
      }

      // Mocked address and payment info since there is no UI to collect it
      const mockShippingAddress = {
        street: '123 Test St',
        city: 'Testville',
        zip: '10001',
        country: 'USA',
      };
      const mockPaymentMethod = 'credit_card'; // Or 'debit_card', 'paypal', 'apple_pay', 'google_pay'

      const orderData = {
        shippingAddress: mockShippingAddress,
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        // The server will calculate subtotal, shipping, tax, and total
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server error: Invalid response format. Check that /api/orders endpoint exists.');
      }

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      clearCart();
      // The server returns order: {_id, ...} from orderController.js line 203
      navigate(`/order-confirmation/${result.order._id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Navigation */}
          <nav className="bg-white shadow-md rounded-lg p-4 mb-8">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                NexusRetail
              </Link>
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <Link to="/products" className="text-gray-600 hover:text-gray-900">
                  Products
                </Link>
                <Link to="/orders" className="text-gray-600 hover:text-gray-900">
                  Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </nav>

          {/* Empty Cart Message */}
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <nav className="bg-white shadow-md rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              NexusRetail
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
            </div>
          </div>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="border-b border-gray-200 p-6 flex gap-6 hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">SKU: {item.sku}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-l border-r border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-600 mb-2">
                      ${(item.discountPrice || item.price).toFixed(2)} each
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${((item.discountPrice || item.price) * item.quantity).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              className="mt-6 w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-semibold"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="font-semibold border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="apple_pay">Apple Pay</option>
                    <option value="google_pay">Google Pay</option>
                  </select>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Shipping
                    {getShipping() === 0 && (
                      <span className="text-green-600 text-sm ml-2">(Free)</span>
                    )}
                  </span>
                  <span className="font-semibold">
                    ${getShipping().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold">${getTax().toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <Link
                to="/products"
                className="block text-center bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </Link>

              {getShipping() > 0 && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Free shipping on orders over $100
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
