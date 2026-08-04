// src/components/ProtectedRoute.tsx (ou src/routes/ProtectedRoute.tsx)
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from 'react-bootstrap';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Array opcional de cargos que podem acessar a rota
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    ); 
  }

  //  Se não estiver logado, manda para o Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exigir cargos específicos e o usuário NÃO tiver permissão, manda pro Dashboard
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    console.warn(`Acesso negado: Usuário ${user.role} tentou acessar uma rota restrita para ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  // Se passou em tudo, renderiza a página
  return <Outlet />;
};

export default ProtectedRoute;