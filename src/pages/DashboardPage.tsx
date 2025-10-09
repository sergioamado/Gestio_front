// src/pages/DashboardPage.tsx
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import GerenteDashboard from '../components/dashboard/GerenteDashboard';
import TecnicoDashboard from '../components/dashboard/TecnicoDashboard';
import { Card } from 'react-bootstrap';

const renderDashboardByRole = (role?: string) => {
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'gerente':
      return <GerenteDashboard />;
    case 'tecnico':
    case 'tecnico_impressora':
    case 'tecnico_eletronica':
      return <TecnicoDashboard />;
    default:
      return <p>O seu perfil não tem um painel de controle definido.</p>;
  }
};

function DashboardPage() {
  const { user } = useAuth();

  return (
    <MainLayout pageTitle="🏢 Painel de Controle">     
      <Card className="p-4 mb-4 floating-card bg-primary text-white">
        <h3>Bem-vindo(a), {user?.nome_completo}!</h3>
        <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
          Aqui está um resumo das atividades recentes com base no seu perfil de acesso.
        </p>
      </Card>

      {renderDashboardByRole(user?.role)}
    </MainLayout>
  );
}

export default DashboardPage;