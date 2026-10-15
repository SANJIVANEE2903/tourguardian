import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { connectSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tg_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('tg_user', JSON.stringify(user));
      connectSocket();
    } else {
      localStorage.removeItem('tg_user');
      disconnectSocket();
    }
  }, [user]);

  async function login(email, password) {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('tg_token', data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      return false;
    } finally { setLoading(false); }
  }

  async function register(payload) {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('tg_token', data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      return false;
    } finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem('tg_token');
    localStorage.removeItem('tg_user');
    disconnectSocket();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
