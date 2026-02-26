// src/components/Sidebar.tsx
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ufsLogo from '../assets/ufs_principal_negativa.png';
import { HouseDoorFill, PeopleFill, BoxSeam, BuildingFill, KeyFill, BoxArrowRight, PencilSquare, ListCheck, Tools, PrinterFill, InboxesFill, ArchiveFill } from 'react-bootstrap-icons';
import PrimaryButton from './PrimaryButton';

const navLinkBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  fontSize: '1.1rem',
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
    <div className="sidebar-container">
      <div className="text-center mb-5">
        <img src={ufsLogo} alt="Logo UFS" style={{ width: '80px' }} />
        <h4 className="mt-2 cosup-plus-logo-sidebar">COSUP<span>+</span></h4>
      </div>

      <div className="invisible-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
        <Nav className="flex-column">
          <Nav.Link
            onClick={() => navigate('/dashboard')}
            style={navLinkBaseStyle}
            className="sidebar-nav-link"
          >
            <HouseDoorFill size={24} className="me-3" /> Painel
          </Nav.Link>
        
        
        {user?.role !== 'gerente' && (
         <Nav.Link onClick={() => navigate('/nova-solicitacao')} style={navLinkBaseStyle} className="sidebar-nav-link">
          <PencilSquare size={24} className="me-3" /> Nova Solicitação
         </Nav.Link>
        )}

        {(user?.role === 'admin' || user?.role.startsWith('tecnico')) && (
          <Nav.Link onClick={() => navigate('/fila-manutencao-eletronica')} style={navLinkBaseStyle} className="sidebar-nav-link">
            <Tools size={24} className="me-3" /> Man. Eletrônica
          </Nav.Link>
        )}

        {(user?.role === 'admin' || user?.role === 'gerente') && (
          <Nav.Link onClick={() => navigate('/gerenciar-solicitacoes')} style={navLinkBaseStyle} className="sidebar-nav-link">
            <ListCheck size={24} className="me-3" /> Gerenciar Solicitações
          </Nav.Link>
        )}

        <Nav.Link onClick={() => navigate('/itens')} style={navLinkBaseStyle} className="sidebar-nav-link">
          <BoxSeam size={24} className="me-3" /> Itens
        </Nav.Link>


        {(user?.role === 'admin' || user?.role === 'tecnico_impressora') && (
        <>
          <Nav.Link 
            onClick={() => navigate('/impressoras')}
            style={navLinkBaseStyle} 
            className="sidebar-nav-link"
          >
            <PrinterFill size={24} className="me-3" /> Impressoras
          </Nav.Link>

          <Nav.Link 
            onClick={() => navigate('/suprimentos')}
            style={navLinkBaseStyle} 
            className="sidebar-nav-link"
          >
            <InboxesFill size={24} className="me-3" /> Controle de Suprimentos
          </Nav.Link>

          <Nav.Link
            onClick={() => navigate('/estoque-suprimentos')}
            style={navLinkBaseStyle}
            className="sidebar-nav-link"
          >
            <ArchiveFill size={24} className="me-3" /> Gerir Estoque de Suprimentos
          </Nav.Link>
        </>
      )}
        
        {user?.role === 'admin' && (
          <>
            <Nav.Link onClick={() => navigate('/usuarios')} style={navLinkBaseStyle} className="sidebar-nav-link">
              <PeopleFill size={24} className="me-3" /> Usuários
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/unidades')} style={navLinkBaseStyle} className="sidebar-nav-link">
              <BuildingFill size={24} className="me-3" /> Unidades
            </Nav.Link>
          </>
        )}
      </Nav>
    </div>

      <div className="mt-auto">
        <Nav className="flex-column">
            <Nav.Link onClick={() => navigate('/alterar-senha')} style={navLinkBaseStyle} className="sidebar-nav-link">
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