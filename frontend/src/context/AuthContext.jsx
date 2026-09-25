import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

//This is for the page we are protecting. It will check authentication.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Whenever the token changes, we will update localStorage.
  // This way, the user will stay logged in even if they refresh the page.
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // The login function will call the backend to authenticate the user.
  // If successful, it will store the token in state and localStorage.
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

  // The register function will call the backend to create a new user.
  // If successful, it will store the token in state and localStorage.
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

  // The logout function will clear the token from state and localStorage.
  const logout = () => {
    setToken(null);
    setError(null);
  };

  // The value provided by the AuthContext will include the token, authentication status, loading state, error state, 
  // and the login, register, and logout functions.
  const value = {
    token,
    isAuthenticated: !!token,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    userId: getUserIdFromToken(token),
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

// Read the user id stored inside the JWT (payload only, not a security check)
