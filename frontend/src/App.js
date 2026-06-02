import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { ProductDetail } from './pages/ProductDetail';
import { Shop } from './pages/Shop';
import { ShopList } from './pages/ShopList';
import { SellerDashboard } from './pages/SellerDashboard';
import { SellerProducts } from './pages/SellerProducts';
import { SellerShops } from './pages/SellerShops';
import { Profile } from './pages/Profile';
import { Toaster } from './components/ui/sonner';
import './App.css';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to={user.role === 'seller' ? '/seller/dashboard' : '/'} />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/shops" element={<ShopList />} />
        <Route path="/shops/:id" element={<Shop />} />
        <Route path="/cart" element={<PrivateRoute allowedRole="customer"><Cart /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute allowedRole="customer"><Checkout /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute allowedRole="customer"><Orders /></PrivateRoute>} />
        <Route path="/seller/dashboard" element={<PrivateRoute allowedRole="seller"><SellerDashboard /></PrivateRoute>} />
        <Route path="/seller/products" element={<PrivateRoute allowedRole="seller"><SellerProducts /></PrivateRoute>} />
        <Route path="/seller/shops" element={<PrivateRoute allowedRole="seller"><SellerShops /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;