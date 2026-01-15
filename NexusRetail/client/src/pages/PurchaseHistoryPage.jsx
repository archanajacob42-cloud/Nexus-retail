import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';

const PurchaseHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="bg-white shadow-md rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">NexusRetail</Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link to="/cart" className="text-gray-600 hover:text-gray-900">Cart</Link>
            </div>
          </div>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Purchase History</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.deliveryStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.deliveryStatus === 'in_transit' ? 'bg-purple-100 text-purple-800' :
                    order.deliveryStatus === 'out_for_delivery' ? 'bg-cyan-100 text-cyan-800' :
                    order.deliveryStatus === 'processing' ? 'bg-indigo-100 text-indigo-800' :
                    order.deliveryStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.deliveryStatus === 'returned' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.deliveryStatus}
                  </span>
                </div>
                
                {/* Order Items */}
                <div className="mb-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product?.name || 'Product'} x {item.quantity}</span>
                      <span className="text-gray-900 font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-gray-600" />
                    <span className="text-gray-600">{order.items.length} item(s)</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">${order.pricing.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;
