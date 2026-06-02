import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const getErrorMessage = (error, defaultMsg) => {
    if (!error.response) {
      return `Network Error: Cannot connect to server at ${API}. Check if backend is running on port 8000.`;
    }
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') return detail;
      // FastAPI validation errors are usually arrays
      if (Array.isArray(detail)) return detail[0]?.msg || detail[0]?.message || JSON.stringify(detail);
      return detail.message || JSON.stringify(detail);
    }
    return error.message || defaultMsg;
  };

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          const userData = response.data.user || response.data;
          setUser(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);
        } catch (error) {
          console.error('Token verification failed:', error.response?.data?.detail || error.message);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user details if not provided in login response
      let userData = user;
      if (!userData) {
        const userRes = await axios.get(`${API}/auth/me`);
        userData = userRes.data.user || userRes.data;
      }
      
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data received from server');
      }

      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Authentication failed'));
    }
  };

  const updateProfile = async (updates) => {
    if (!token) throw new Error('Not authenticated');
    try {
      const response = await axios.put(`${API}/auth/me`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data.user || response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Update failed'));
    }
  };

  const register = async (email, password, name, role, phone = null, address = null) => {
    try {
      const body = { email, password, name, role };
      if (phone) body.phone = phone;
      if (address) body.address = address;
      const response = await axios.post(`${API}/auth/register`, body);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user details if not provided in register response
      let userData = user;
      if (!userData) {
        const userRes = await axios.get(`${API}/auth/me`);
        userData = userRes.data.user || userRes.data;
      }

      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Registration failed'));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};