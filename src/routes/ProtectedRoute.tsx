// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login.
    // O 'replace' evita que o usuário volte para a página anterior no histórico.
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza a rota filha (Dashboard, Itens, etc.).
  // O <Outlet /> é o marcador de onde as rotas aninhadas serão renderizadas.
  return <Outlet />;
};

export default ProtectedRoute;