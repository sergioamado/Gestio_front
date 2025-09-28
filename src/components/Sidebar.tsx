// src/components/Sidebar.tsx
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ufsLogo from '../assets/ufs-logo.svg';
import { HouseDoorFill, PeopleFill, BoxSeam, BuildingFill } from 'react-bootstrap-icons';
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

const navLinkBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  fontSize: '1rem',
  fontWeight: 500,
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

      <Nav className="flex-column flex-grow-1">
        <Nav.Link
          onClick={() => navigate('/dashboard')}
          style={navLinkBaseStyle}
          className="sidebar-nav-link"
        >
          <HouseDoorFill size={20} className="me-3" /> Painel
        </Nav.Link>
        <Nav.Link style={navLinkBaseStyle} className="sidebar-nav-link">
          <BoxSeam size={20} className="me-3" /> Itens
        </Nav.Link>
        {user?.role === 'admin' && (
          <>
            <Nav.Link
              onClick={() => navigate('/usuarios')}
              style={navLinkBaseStyle}
              className="sidebar-nav-link"
            >
              <PeopleFill size={20} className="me-3" /> Usuários
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate('/unidades')}
              style={navLinkBaseStyle}
              className="sidebar-nav-link"
            >
              <BuildingFill size={20} className="me-3" /> Unidades
            </Nav.Link>
          </>
        )}
      </Nav> {/* <-- A TAG DE FECHAMENTO FOI ADICIONADA AQUI */}

      <div className="mt-auto">
        <div className="d-grid">
          <PrimaryButton onClick={handleLogout}>
            Sair
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;