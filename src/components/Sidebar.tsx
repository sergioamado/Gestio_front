// src/components/Sidebar.tsx
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ufsLogo from '../assets/ufs-logo.svg';
import { HouseDoorFill, PeopleFill, BoxSeam, BuildingFill, KeyFill, BoxArrowRight, PencilSquare } from 'react-bootstrap-icons';
import PrimaryButton from './PrimaryButton';

const sidebarStyle: React.CSSProperties = {
  backgroundColor: 'var(--ufs-blue)',
  color: '#ffffff',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem 1rem',
  position: 'fixed',
  width: 'var(--sidebar-width)',
};

// ATUALIZADO: Aumentado o tamanho da fonte e o espaçamento
const navLinkBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.85rem 1rem', // Aumenta o espaçamento vertical
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  fontSize: '1.1rem', // Fonte maior
  fontWeight: 500,
  cursor: 'pointer',
};

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={sidebarStyle}>
      <div className="text-center mb-5">
        <img src={ufsLogo} alt="Logo UFS" style={{ width: '80px' }} />
        <h4 className="mt-2">Gestio</h4>
      </div>

      {/* Container principal para os links, que ocupa o espaço restante */}
      <Nav className="flex-column flex-grow-1">
        <Nav.Link
          onClick={() => navigate('/dashboard')}
          style={navLinkBaseStyle}
          className="sidebar-nav-link"
        >
          <HouseDoorFill size={24} className="me-3" /> Painel
        </Nav.Link>
        
         <Nav.Link
          onClick={() => navigate('/nova-solicitacao')}
          style={navLinkBaseStyle}
          className="sidebar-nav-link"
        >
          <PencilSquare size={24} className="me-3" /> Nova Solicitação
        </Nav.Link>

        <Nav.Link 
          onClick={() => navigate('/itens')}
          style={navLinkBaseStyle} 
          className="sidebar-nav-link"
        >
          <BoxSeam size={24} className="me-3" /> Itens
        </Nav.Link>
        
        {user?.role === 'admin' && (
          <>
            <Nav.Link
              onClick={() => navigate('/usuarios')}
              style={navLinkBaseStyle}
              className="sidebar-nav-link"
            >
              <PeopleFill size={24} className="me-3" /> Usuários
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate('/unidades')}
              style={navLinkBaseStyle}
              className="sidebar-nav-link"
            >
              <BuildingFill size={24} className="me-3" /> Unidades
            </Nav.Link>
          </>
        )}
      </Nav>

      {/* Container inferior para os botões de ação */}
      <div className="mt-auto">
        <Nav className="flex-column">
            <Nav.Link
                onClick={() => navigate('/alterar-senha')}
                style={navLinkBaseStyle}
                className="sidebar-nav-link"
            >
                <KeyFill size={24} className="me-3" /> Alterar Senha
            </Nav.Link>
        </Nav>
        <div className="d-grid mt-2">
          <PrimaryButton variant="danger" onClick={handleLogout}>
            <BoxArrowRight size={20} className="me-2" />
            Sair
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;