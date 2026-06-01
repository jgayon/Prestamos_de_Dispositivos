import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (!res.data || !res.data.token) {
        throw new Error('Token no recibido');
      }

      const token = res.data.token;
      const loggedUser = res.data.user || { email };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
      setUser(loggedUser);
    } catch (err: any) {
      console.error('Auth error:', err);
      const raw = err?.response?.data?.message;
      const message = Array.isArray(raw)
        ? raw.join(', ')
        : raw || err.message || 'Error de autenticación';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
