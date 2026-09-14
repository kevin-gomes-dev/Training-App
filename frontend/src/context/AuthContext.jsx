import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/users/login', { username, password });
      const jwt = typeof data === 'string' ? data : data.token ?? data;
      setToken(jwt);
      return true;
    } catch (err) {
      const message =
        err.response?.data ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(typeof message === 'string' ? message : 'Login failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, role = undefined) => {
    setLoading(true);
    setError(null);
    try {
      const body = { username, password };
      if (role) body.role = role;

      const { data } = await api.post('/users/register', body);
      const jwt = typeof data === 'string' ? data : data.token ?? data;
      setToken(jwt);
      return true;
    } catch (err) {
      const message =
        err.response?.data ||
        err.message ||
        'Registration failed.';
      setError(typeof message === 'string' ? message : 'Registration failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setError(null);
  };

  const value = {
    token,
    isAuthenticated: !!token,
    loading,
    error,
    setError,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}