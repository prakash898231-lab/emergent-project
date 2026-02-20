import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Store, Package } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const { user, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50" data-testid="header">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>LocalMart</span>
          </Link>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/" data-testid="home-link">
                      <Button variant="ghost" size="sm">Shop</Button>
                    </Link>
                    <Link to="/orders" data-testid="orders-link">
                      <Button variant="ghost" size="sm">Orders</Button>
                    </Link>
                    <Link to="/cart" className="relative" data-testid="cart-link">
                      <Button variant="ghost" size="sm" className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {cartItemsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="cart-count">
                            {cartItemsCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </>
                )}
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller/dashboard" data-testid="seller-dashboard-link">
                      <Button variant="ghost" size="sm">Dashboard</Button>
                    </Link>
                    <Link to="/seller/products" data-testid="seller-products-link">
                      <Button variant="ghost" size="sm">
                        <Package className="h-5 w-5 mr-2" />
                        Products
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-button">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth" data-testid="login-link">
                <Button variant="default" size="sm" className="rounded-full">
                  <User className="h-5 w-5 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};