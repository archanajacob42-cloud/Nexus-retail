import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Truck,
  CheckCircle,
  Clock,
  Edit2,
  X,
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  // State for orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // State for products with low stock
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // State for status update modal
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // State for dashboard stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);

      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrdersError(
        error.response?.data?.message ||
          error.message ||
          'Failed to load orders'
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch products with low stock
  const fetchLowStockProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);

      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/api/products/low-stock`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setLowStockProducts(response.data.products);
        setStats((prev) => ({
          ...prev,
          lowStockCount: response.data.products.length,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setProductsError(
        error.response?.data?.message ||
          error.message ||
          'Failed to load products'
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/orders/stats/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          totalOrders: response.data.stats.totalOrders,
          totalRevenue: response.data.stats.totalRevenue,
          averageOrderValue: response.data.stats.averageOrderValue,
        }));
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchOrders();
    fetchLowStockProducts();
    fetchOrderStats();
  }, []);

  // Update order status
  const handleStatusUpdate = async () => {
    if (!editingOrderId || !newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = getAuthToken();

      const response = await axios.put(
        `${API_BASE_URL}/api/orders/${editingOrderId}/status`,
        {
          deliveryStatus: newStatus,
          trackingNumber: trackingNumber || undefined,
          notes: statusNotes || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update local order state
        setOrders(
          orders.map((order) =>
            order._id === editingOrderId
              ? {
                  ...order,
                  deliveryStatus: newStatus,
                  trackingNumber: trackingNumber || order.trackingNumber,
                }
              : order
          )
        );

        // Reset modal
        setEditingOrderId(null);
        setNewStatus('');
        setTrackingNumber('');
        setStatusNotes('');

        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to update order status'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-cyan-100 text-cyan-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage orders, inventory, and monitor business metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          {/* Avg Order Value Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </div>

          {/* Low Stock Items Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.lowStockCount}
                </p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Package size={22} />
                  Recent Orders
                </h2>
                <button
                  onClick={() => {
                    fetchOrders();
                    fetchOrderStats();
                  }}
                  className="bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-lg transition-colors"
                  title="Refresh orders"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Error Message */}
              {ordersError && (
                <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error loading orders</p>
                    <p className="text-red-700 text-sm">{ordersError}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loadingOrders && (
                <div className="p-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Orders Table */}
              {!loadingOrders && !ordersError && orders.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.slice(0, 10).map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.user?.firstName} {order.user?.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(order.pricing.total)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.deliveryStatus
                              )}`}
                            >
                              {getStatusIcon(order.deliveryStatus)}
                              {order.deliveryStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => {
                                setEditingOrderId(order._id);
                                setNewStatus(order.deliveryStatus);
                                setTrackingNumber(order.trackingNumber || '');
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No Orders Message */}
              {!loadingOrders && !ordersError && orders.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No orders found</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Report Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={22} />
                Low Stock Report
              </h2>
            </div>

            {/* Error Message */}
            {productsError && (
              <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-2">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-700 text-sm">{productsError}</p>
              </div>
            )}

            {/* Loading State */}
            {loadingProducts && (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
              </div>
            )}

            {/* Products List */}
            {!loadingProducts && !productsError && (
              <div className="divide-y max-h-96 overflow-y-auto">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={18} />
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        SKU: <span className="font-mono">{product.sku}</span>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            Available Stock
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {product.stock.quantity - product.stock.reserved}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-red-500"
                            style={{
                              width: `${Math.min(
                                ((product.stock.quantity -
                                  product.stock.reserved) /
                                  product.stock.quantity) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        Reorder Level:{' '}
                        <span className="font-semibold">
                          {product.stock.reorderLevel}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-sm">All products have adequate stock!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {editingOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Update Order Status
              </h3>
              <button
                onClick={() => {
                  setEditingOrderId(null);
                  setNewStatus('');
                  setTrackingNumber('');
                  setStatusNotes('');
                }}
                className="text-white hover:bg-blue-500 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Delivery Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              {/* Tracking Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status update"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingOrderId(null);
                    setNewStatus('');
                    setTrackingNumber('');
                    setStatusNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updatingStatus && <RefreshCw size={16} className="animate-spin" />}
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
