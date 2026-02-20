import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export const Cart = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const total = cart.items.reduce((sum, item) => {
    if (item.product) {
      return sum + (item.product.price * item.quantity);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" data-testid="loading">
        <ShoppingBag className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Add some products to get started</p>
          <Button onClick={() => navigate('/')} className="rounded-full" data-testid="continue-shopping">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="cart-page">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              item.product && (
                <div key={item.product_id} className="bg-white rounded-xl p-6 border border-slate-200" data-testid="cart-item">
                  <div className="flex gap-4">
                    <img
                      src={item.product.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150&w=150'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                      data-testid="cart-item-image"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900" data-testid="cart-item-name">{item.product.name}</h3>
                      <p className="text-slate-600 text-sm mb-2" data-testid="cart-item-price">${item.product.price.toFixed(2)}</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-testid="decrease-quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 text-slate-900" data-testid="cart-item-quantity">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            data-testid="increase-quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.product_id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid="remove-item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900" data-testid="cart-item-total">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span data-testid="subtotal">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-semibold text-slate-900">
                  <span>Total</span>
                  <span data-testid="total">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full rounded-full"
                onClick={() => navigate('/checkout')}
                data-testid="checkout-button"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};