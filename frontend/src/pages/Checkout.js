import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.items.reduce((sum, item) => {
    if (item.product) {
      return sum + (item.product.price * item.quantity);
    }
    return sum;
  }, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !phone) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(
        `${API}/orders`,
        { delivery_address: address, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully!');
      await fetchCart();
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="checkout-page">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Delivery Information</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete address"
                    required
                    data-testid="address-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    data-testid="phone-input"
                  />
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Payment Method</h2>
              <div className="flex items-center space-x-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                <Package className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-slate-900">Cash on Delivery</p>
                  <p className="text-sm text-slate-600">Pay when you receive your order</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  item.product && (
                    <div key={item.product_id} className="flex justify-between text-sm" data-testid="order-item">
                      <span className="text-slate-600">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-slate-900 font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                ))}
                <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-semibold text-slate-900">
                  <span>Total</span>
                  <span data-testid="order-total">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full rounded-full"
                onClick={handlePlaceOrder}
                disabled={loading}
                data-testid="place-order-button"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};