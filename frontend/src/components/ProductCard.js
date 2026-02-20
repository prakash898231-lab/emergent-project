import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }
    if (user.role !== 'customer') {
      toast.error('Only customers can add items to cart');
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer group"
      onClick={() => navigate(`/products/${product.id}`)}
      data-testid="product-card"
    >
      <div className="overflow-hidden rounded-t-xl">
        <img
          src={product.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350&w=350'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          data-testid="product-image"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1" data-testid="product-name">{product.name}</h3>
        <p className="text-sm text-slate-600 mb-3 line-clamp-2" data-testid="product-description">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary" data-testid="product-price">${product.price.toFixed(2)}</span>
          {product.stock > 0 ? (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="rounded-full"
              data-testid="add-to-cart-button"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          ) : (
            <span className="text-sm text-red-500" data-testid="out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};