// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext as React.Context<AuthContextType>);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};