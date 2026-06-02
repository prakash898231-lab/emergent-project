import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { API } from '../lib/api';

export const SellerDashboard = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/seller/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/seller/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/seller/orders/${orderId}?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
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
    <div className="min-h-screen bg-slate-50 py-8" data-testid="seller-dashboard">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Seller Dashboard</h1>
          <div className="flex flex-wrap gap-3">
            <Link to="/seller/shops">
              <Button className="rounded-full">Manage Shops</Button>
            </Link>
            <Link to="/seller/products">
              <Button variant="outline" className="rounded-full">Manage Products</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-slate-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid="stat-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-value">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-12" data-testid="no-orders">
              <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="orders-table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100" data-testid="order-row">
                      <td className="py-3 px-4 text-sm text-slate-600">{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{order.items.length} items</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">₹{order.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="text-sm border border-slate-200 rounded-md px-2 py-1"
                          data-testid="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};