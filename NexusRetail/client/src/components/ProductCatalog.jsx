import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navigation from './Navigation';

const ProductCatalog = ({ user, onLogout }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.products) {
          setProducts(data.products);

          // Extract unique categories
          const uniqueCategories = [
            'All',
            ...new Set(data.products.map((p) => p.category)),
          ];
          setCategories(uniqueCategories);
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Fetch products error:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Check if product has low stock
  const isLowStock = (product) => {
    return product.stock.quantity - product.stock.reserved < 5;
  };

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Get discount percentage
  const getDiscountPercentage = (original, discounted) => {
    if (!discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    if (product.stock.quantity - product.stock.reserved <= 0) {
      alert('This product is out of stock');
      return;
    }

    addToCart(product, 1);
    
    // Show confirmation message
    setAddedToCart((prev) => ({
      ...prev,
      [product._id]: true,
    }));

    // Clear the message after 2 seconds
    setTimeout(() => {
      setAddedToCart((prev) => ({
        ...prev,
        [product._id]: false,
      }));
    }, 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navigation user={user} onLogout={onLogout} />
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Catalog
          </h1>
          <p className="text-gray-600">
            Discover our curated collection of {products.length} products
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Products</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {/* Product Image Container */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-600">No image</span>
                    </div>
                  )}

                  {/* Low Stock Badge */}
                  {isLowStock(product) && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <AlertCircle size={14} />
                      Low Stock
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discountPrice && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {getDiscountPercentage(product.price, product.discountPrice)}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Category */}
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    {product.category}
                  </span>

                  {/* Product Name */}
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* SKU */}
                  <div className="text-xs text-gray-500 mb-3">
                    SKU: <span className="font-mono">{product.sku}</span>
                  </div>

                  {/* Pricing */}
                  <div className="mb-3">
                    {product.discountPrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Stock
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {product.stock.quantity - product.stock.reserved} available
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isLowStock(product) ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            ((product.stock.quantity - product.stock.reserved) /
                              product.stock.quantity) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Ratings */}
                  {product.ratings && (
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {product.ratings.average.toFixed(1)}
                      </span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-sm">
                            {i < Math.round(product.ratings.average)
                              ? '★'
                              : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({product.ratings.count})
                      </span>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock.quantity - product.stock.reserved === 0 || !product.isActive}
                    className={`w-full mt-auto py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                      product.stock.quantity - product.stock.reserved === 0 ||
                      !product.isActive
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {addedToCart[product._id] ? '✓ Added!' : product.stock.quantity - product.stock.reserved === 0
                      ? 'Out of Stock'
                      : !product.isActive
                      ? 'Unavailable'
                      : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
