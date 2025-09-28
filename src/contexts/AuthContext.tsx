// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as authService from '../services/authService';
import api from '../services/api';

// Tipos
interface User {
  id: number;
  nome_completo: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username : string, password : string) => Promise<void>;
  logout: () => void;
}

// 1. Cria o Contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Cria o Provedor (Componente)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Para verificar o estado inicial

  // Efeito para verificar se já existe um usuário logado no localStorage
  useEffect(() => {
    const checkLoggedInUser = () => {
      const storedUser = authService.getCurrentUser();
      const token = localStorage.getItem('authToken');

      if (storedUser && token) {
        setUser(storedUser);
        // Reconfigura o cabeçalho do Axios caso a página seja recarregada
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setIsLoading(false);
    };

    checkLoggedInUser();
  }, []);

  const login = async (username : string, password : string) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  // Renderiza um loader enquanto verifica a autenticação, depois renderiza os filhos
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};