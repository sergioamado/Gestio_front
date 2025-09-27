// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { Usuario } from '../types/index';

export interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const { token, user: userDataFromApi } = await authService.login(username, password);
    const usuarioFormatado: Usuario = {
      ...(userDataFromApi as any), 
      username: (userDataFromApi as any).login || userDataFromApi.username, 
      unidade_id: (userDataFromApi as any).unidade?.id, 
    };

    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(usuarioFormatado));
    setUser(usuarioFormatado); 
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};