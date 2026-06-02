import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { API } from '../lib/api';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
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
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" data-testid="loading">
        <Package className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="product-detail-page">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6" data-testid="back-button">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Shop
        </Button>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl p-8 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <img
              src={product.image_url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=650'}
              alt={product.name}
              className="w-full rounded-xl"
              data-testid="product-image"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-primary font-semibold mb-2" data-testid="product-category">{product.category}</span>
            <h1 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }} data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }} data-testid="product-description">
              {product.description}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary" data-testid="product-price">₹{product.price.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-2">Availability:</p>
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold" data-testid="in-stock">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-500 font-semibold" data-testid="out-of-stock">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mb-6">
                <Label className="text-sm text-slate-600 mb-2 block">Quantity:</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="decrease-quantity"
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center" data-testid="quantity">{quantity}</span>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    data-testid="increase-quantity"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {product.stock > 0 && (
              <Button
                onClick={handleAddToCart}
                className="w-full rounded-full"
                size="lg"
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Label = ({ children, className }) => <label className={className}>{children}</label>;