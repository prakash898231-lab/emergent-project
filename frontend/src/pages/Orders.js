import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { API } from '../lib/api';

export const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" data-testid="loading">
        <Package className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="orders-page">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200" data-testid="no-orders">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-600">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-xl p-6 border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid="order-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Order ID: {order.id.slice(0, 8)}</p>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`} data-testid="order-status">
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm" data-testid="order-item">
                      <span className="text-slate-600">{item.product_name} × {item.quantity}</span>
                      <span className="text-slate-900 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Delivery Address:</span>
                    <span className="text-sm text-slate-900">{order.delivery_address}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <span className="text-sm text-slate-900">{order.phone}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Payment:</span>
                    <span className="text-sm text-slate-900">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-primary" data-testid="order-total">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};