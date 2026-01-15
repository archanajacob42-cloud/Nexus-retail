import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderConfirmationPage = ({ user }) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
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
            </div>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Order ID: {orderId}</p>
          {order && (
            <div className="text-left mb-6 p-4 bg-gray-50 rounded">
              <p className="mb-2"><strong>Total:</strong> ${order.pricing?.total?.toFixed(2)}</p>
              <p className="mb-2"><strong>Status:</strong> {order.deliveryStatus}</p>
              <p><strong>Items:</strong> {order.items?.length}</p>
            </div>
          )}
          <Link to="/products" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
