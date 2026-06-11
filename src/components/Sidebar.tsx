// src/components/Sidebar.tsx
import { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ufsLogo from '../assets/ufs_principal_negativa.png';
import { 
  HouseDoorFill, PeopleFill, BoxSeamFill, BuildingFill, KeyFill, 
  BoxArrowRight, PencilSquare, ListCheck, Tools, PrinterFill, 
  InboxesFill, ArchiveFill, LayoutSidebarInset, ClipboardCheckFill, CloudUploadFill
} from 'react-bootstrap-icons';
import PrimaryButton from './PrimaryButton';

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Estado que controla se a barra está expandida ou encolhida
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Estilo dinâmico que se ajusta dependendo se a barra está encolhida ou não
  const getNavLinkStyle = (collapsed: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '0.85rem 0' : '0.85rem 1rem',
    borderRadius: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  });

  return (
    <div 
      className="sidebar-container d-flex flex-column bg-dark text-white" 
      style={{ 
        width: isCollapsed ? '90px' : '280px', 
        transition: 'width 0.3s ease',
        height: '100vh',
        padding: '1.5rem 1rem'
      }}
    >
      {/* Botão de Recolher/Expandir Barra */}
      <div className={`d-flex ${isCollapsed ? 'justify-content-center' : 'justify-content-end'} mb-2`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="btn btn-link text-white-50 p-0 border-0 shadow-none"
          title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          <LayoutSidebarInset size={24} />
        </button>
      </div>

      <div className="text-center mb-4">
        <img src={ufsLogo} alt="Logo UFS" style={{ width: isCollapsed ? '45px' : '80px', transition: 'width 0.3s' }} />
        {!isCollapsed && <h4 className="mt-3 fw-bold text-white tracking-wide" style={{ letterSpacing: '1px' }}>COSUP<span className="text-primary">+</span></h4>}
      </div>

      <div className="invisible-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Nav className="flex-column">
          
          <Nav.Link onClick={() => navigate('/dashboard')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
            <HouseDoorFill size={22} className={isCollapsed ? "" : "me-3"} />
            {!isCollapsed && <span>Painel Inicial</span>}
          </Nav.Link>
        
          {user?.role !== 'gerente' && (
           <Nav.Link onClick={() => navigate('/nova-solicitacao')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
            <PencilSquare size={22} className={isCollapsed ? "" : "me-3"} />
            {!isCollapsed && <span>Nova Solicitação</span>}
           </Nav.Link>
          )}

          {/* SESSÃO: SUPORTE E ATENDIMENTOS */}
          {!isCollapsed && <div className="text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Atendimentos</div>}
          
          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <Nav.Link onClick={() => navigate('/gerenciar-solicitacoes')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
              <ListCheck size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span>Gerenciar OS</span>}
            </Nav.Link>
          )}

          {(user?.role === 'admin' || user?.role.startsWith('tecnico') || user?.role === 'gerente') && (
            <Nav.Link onClick={() => navigate('/fila-manutencao-eletronica')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
              <Tools size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span>Manut. Eletrônica</span>}
            </Nav.Link>
          )}

          {/* SESSÃO: MATERIAIS E ESTOQUE */}
          {!isCollapsed && <div className="text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Estoque</div>}

          <Nav.Link onClick={() => navigate('/itens')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
            <BoxSeamFill size={22} className={isCollapsed ? "" : "me-3"} />
            {!isCollapsed && <span>Catálogo de Peças</span>}
          </Nav.Link>

          {(user?.role === 'admin' || user?.role === 'tecnico_impressora' || user?.role === 'gerente') && (
          <>
            <Nav.Link onClick={() => navigate('/impressoras')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
              <PrinterFill size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span>Impressoras</span>}
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/suprimentos')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
              <InboxesFill size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span>Saída de Suprimentos</span>}
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/estoque-suprimentos')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
              <ArchiveFill size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span>Entrada de Toners</span>}
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/atendimentos')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
              <Tools size={22} className={isCollapsed ? "" : "me-3"} />
              {!isCollapsed && <span>Atend. Impressoras</span>}
            </Nav.Link>
          </>
          )}

          {/* SESSÃO: PATRIMÔNIO (Somente Admin e Gerente) */}
          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <>
              {!isCollapsed && <div className="text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Patrimônio</div>}
              
              <Nav.Link onClick={() => navigate('/lista-bens')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
                <BoxSeamFill size={22} className={isCollapsed ? "" : "me-3"} />
                {!isCollapsed && <span>Inventário de Bens</span>}
              </Nav.Link>

              <Nav.Link onClick={() => navigate('/levantamento')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
                <ClipboardCheckFill size={22} className={isCollapsed ? "" : "me-3"} />
                {!isCollapsed && <span>Auditoria Física</span>}
              </Nav.Link>

              <Nav.Link onClick={() => navigate('/importar-sipac')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
                <CloudUploadFill size={22} className={isCollapsed ? "" : "me-3"} />
                {!isCollapsed && <span>Importar SIPAC</span>}
              </Nav.Link>
            </>
          )}
          
          {/* SESSÃO: ADMINISTRAÇÃO */}
          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <>
              {!isCollapsed && <div className="text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Sistema</div>}
              <Nav.Link onClick={() => navigate('/usuarios')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
                <PeopleFill size={22} className={isCollapsed ? "" : "me-3"} />
                {!isCollapsed && <span>Usuários</span>}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/unidades')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
                <BuildingFill size={22} className={isCollapsed ? "" : "me-3"} />
                {!isCollapsed && <span>Unidades</span>}
              </Nav.Link>
            </>
          )}
        </Nav>
      </div>

      {/* RODAPÉ DA SIDEBAR */}
      <div className="mt-auto pt-3 border-top border-secondary">
        <Nav className="flex-column">
            <Nav.Link onClick={() => navigate('/alterar-senha')} style={getNavLinkStyle(isCollapsed)} className="sidebar-nav-link text-white">
                <KeyFill size={22} className={isCollapsed ? "" : "me-3"} />
                {!isCollapsed && <span>Alterar Senha</span>}
            </Nav.Link>
        </Nav>
        <div className="d-grid mt-2">
          {isCollapsed ? (
             <button onClick={handleLogout} className="btn btn-danger p-2 rounded" title="Sair do Sistema">
               <BoxArrowRight size={20} />
             </button>
          ) : (
            <PrimaryButton variant="danger" onClick={handleLogout} className="fw-bold py-2">
              <BoxArrowRight size={20} className="me-2" />
              Sair do Sistema
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;