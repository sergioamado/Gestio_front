// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as authService from '../services/authService';
import api from '../services/api';
import { getToken, atualizarUsuarioSalvo } from '../services/sessao';
import type { User } from '../types'; 

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Atualiza o usuário na tela E no armazenamento da aba. Antes só mudava a memória:
  // depois de um F5 as preferências de notificação voltavam ao valor antigo, e um novo
  // "Salvar" regravava no servidor o que a pessoa já tinha desligado.
  const setUser: React.Dispatch<React.SetStateAction<User | null>> = useCallback((valor) => {
    setUserState((anterior) => {
      const novo = typeof valor === 'function' ? (valor as (u: User | null) => User | null)(anterior) : valor;
      if (novo && anterior) atualizarUsuarioSalvo(novo);
      return novo;
    });
  }, []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = () => {
      const storedUser = authService.getCurrentUser();
      const token = getToken();
      if (storedUser && token) {
        setUser(storedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setIsLoading(false);
    };
    checkLoggedInUser();
  }, [setUser]);

  const login = async (username: string, password: string) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  //  Inclui o setUser no objeto value passado  aplicação
  const value = { user, setUser, isAuthenticated: !!user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};