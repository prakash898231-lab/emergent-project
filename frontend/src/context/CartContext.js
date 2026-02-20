import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token || !user || user.role !== 'customer') return;
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        `${API}/cart`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await axios.put(
        `${API}/cart/${productId}?quantity=${quantity}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API}/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const cartItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartItemsCount, addToCart, updateCartItem, removeFromCart, fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};