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
      return (
        <Card className="border-0 shadow-sm text-center p-5 mt-4">
          <div className="fs-1 mb-3">🔒</div>
          <h5 className="fw-bold text-dark">Painel Indisponível</h5>
          <p className="text-muted mb-0">O seu perfil de acesso atual não possui um painel de controle definido. Contate o administrador.</p>
        </Card>
      );
  }
};

function DashboardPage() {
  const { user } = useAuth();

  const primeiroNome = user?.nome_completo?.split(' ')[0] || 'Usuário';

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dataFormatada = dataAtual.charAt(0).toUpperCase() + dataAtual.slice(1);

  return (
    <MainLayout pageTitle="Painel de Controle">   
      <Card className="border-0 shadow-sm mb-4 bg-primary bg-gradient text-white overflow-hidden position-relative">
       
        <div 
          className="position-absolute top-0 end-0 h-100 w-50" 
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))', transform: 'skewX(-15deg) translateX(20%)' }}
        ></div>
        
        <Card.Body className="p-4 p-md-5 position-relative z-1">
          <h3 className="fw-bold mb-2 tracking-tight">Olá, {primeiroNome}! 👋</h3>
          <p className="mb-0 fs-6" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            <span className="fw-medium text-white">{dataFormatada}</span> <br className="d-md-none" /> 
            <span className="d-none d-md-inline"> • </span> Aqui está o resumo das atividades e o panorama geral do sistema.
          </p>
        </Card.Body>
      </Card>

      <div className="animate__animated animate__fadeInUp animate__faster">
        {renderDashboardByRole(user?.role)}
      </div>
    </MainLayout>
  );
}

export default DashboardPage;