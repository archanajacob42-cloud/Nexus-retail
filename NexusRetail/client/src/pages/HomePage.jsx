import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const HomePage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-600">NexusRetail</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Orders
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to NexusRetail
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your premier destination for enterprise-grade e-commerce. Discover thousands of products, manage your orders, and enjoy seamless shopping.
          </p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Explore Products
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Wide Product Selection
            </h3>
            <p className="text-gray-600">
              Browse through thousands of products across multiple categories with detailed descriptions and customer reviews.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Order Management
            </h3>
            <p className="text-gray-600">
              Track your orders in real-time, manage deliveries, and view your complete order history all in one place.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Admin Tools
            </h3>
            <p className="text-gray-600">
              Powerful admin dashboard for managing products, orders, inventory, and tracking business metrics.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Platform Statistics
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">7+</div>
              <p className="text-gray-600 mt-2">Products</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">3</div>
              <p className="text-gray-600 mt-2">Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">100%</div>
              <p className="text-gray-600 mt-2">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <p className="text-gray-600 mt-2">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
