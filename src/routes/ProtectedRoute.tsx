// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Enquanto verifica o estado de autenticação, não renderiza nada
  if (isLoading) {
    return null; // Ou um componente de spinner global
  }

  // Se estiver autenticado, permite o acesso à rota filha (Outlet)
  // Caso contrário, redireciona para a página de login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;