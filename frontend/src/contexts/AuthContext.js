import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
  try {
    setLoading(true);

    const data = await authService.login(credentials);
    setUser(data.user);

    return data;

  } catch (error) {
    console.log(error);
    throw error;

  } finally {
    setLoading(false);
  }
};

  const register = async (userData) => {
  try {
    setLoading(true);

    const data = await authService.register(userData);
    setUser(data.user);

    return data;

  } catch (error) {
    console.log(error);
    throw error;

  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);