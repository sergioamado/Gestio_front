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
      return <p className="text-muted mt-3">O seu perfil não tem um painel de controle definido.</p>;
  }
};

function DashboardPage() {
  const { user } = useAuth();

  return (
    <MainLayout pageTitle="Painel de Controle">     
      {/* Cartão de Boas-Vindas Modernizado */}
      <Card className="p-4 mb-4 card-welcome text-white">
        <h3 className="fw-bold">Bem-vindo(a), {user?.nome_completo}! 👋</h3>
        <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Aqui está o resumo das atividades e o panorama geral da sua unidade.
        </p>
      </Card>

      {/* Renderiza os dados reais que vêm do Backend */}
      {renderDashboardByRole(user?.role)}
    </MainLayout>
  );
}

export default DashboardPage;