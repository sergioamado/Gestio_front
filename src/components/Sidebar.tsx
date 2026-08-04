// src/components/Sidebar.tsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ufsLogo from '../assets/ufs_principal_negativa.png';
import { 
  HouseDoorFill, PeopleFill, BoxSeamFill, BuildingFill, KeyFill, 
  BoxArrowRight, PencilSquare, ListCheck, Tools, PrinterFill, 
  InboxesFill, ArchiveFill, ClipboardCheckFill, CloudUploadFill
} from 'react-bootstrap-icons';

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar-container d-flex flex-column bg-dark text-white w-100 border-end border-secondary">
      
      {/* LOGOMARCA E TÍTULO */}
      <div className="text-center mb-4 mt-2">
        <img 
          src={ufsLogo} 
          alt="Logo UFS" 
          className="img-fluid" 
          style={{ maxWidth: '60px', transition: 'max-width 0.3s ease' }} 
        />
        <h4 className="mt-3 fw-bold text-white tracking-wide logo-text" style={{ letterSpacing: '1px' }}>
          COSUP<span className="text-primary">+</span>
        </h4>
      </div>

      <div className="invisible-scrollbar flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <Nav className="flex-column gap-1">
          
          <Nav.Link as={NavLink} to="/dashboard" className="sidebar-nav-link text-white rounded">
            <HouseDoorFill size={22} className="me-3" />
            <span>Painel Inicial</span>
          </Nav.Link>
        
          {/* Nova Solicitação: Oculto para o gerente. Admin vê (com aviso na página) e técnicos veem */}
          {user?.role !== 'gerente' && (
           <Nav.Link as={NavLink} to="/nova-solicitacao" className="sidebar-nav-link text-white rounded">
            <PencilSquare size={22} className="me-3" />
            <span>Nova Solicitação</span>
           </Nav.Link>
          )}

          {/* SESSÃO: SUPORTE E ATENDIMENTOS */}
          <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Atendimentos
          </div>
          
          {/*  Gerenciar OS: Liberado para TODOS (A página bloqueia as edições para técnicos, mas eles podem ver e cancelar as deles) */}
          <Nav.Link as={NavLink} to="/gerenciar-solicitacoes" className="sidebar-nav-link text-white rounded">
            <ListCheck size={22} className="me-3" />
            <span>Gerenciar OS</span>
          </Nav.Link>

          {/*  Fila Manutenção Eletrónica: Estrito a Admin, Gerente e Técnico de Eletrónica */}
          {(user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_eletronica') && (
            <Nav.Link as={NavLink} to="/fila-manutencao-eletronica" className="sidebar-nav-link text-white rounded">
              <Tools size={22} className="me-3" />
              <span>Manut. Eletrônica</span>
            </Nav.Link>
          )}

          {/* SESSÃO: MATERIAIS E ESTOQUE */}
          <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Estoque
          </div>

          {/* Catálogo de Peças: Liberado para todos (A página oculta quantidades/ações aos técnicos) */}
          <Nav.Link as={NavLink} to="/itens" className="sidebar-nav-link text-white rounded">
            <BoxSeamFill size={22} className="me-3" />
            <span>Catálogo de Peças</span>
          </Nav.Link>

          {/*  Módulo Impressoras: Estrito a Admin, Gerente e Técnico de Impressoras */}
          {(user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_impressora') && (
          <>
            <Nav.Link as={NavLink} to="/impressoras" className="sidebar-nav-link text-white rounded">
              <PrinterFill size={22} className="me-3" />
              <span>Impressoras</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/suprimentos" className="sidebar-nav-link text-white rounded">
              <InboxesFill size={22} className="me-3" />
              <span>Saída de Suprimentos</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/estoque-suprimentos" className="sidebar-nav-link text-white rounded">
              <ArchiveFill size={22} className="me-3" />
              <span>Entrada de Toners</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/atendimentos" className="sidebar-nav-link text-white rounded">
              <Tools size={22} className="me-3" />
              <span>Atend. Impressoras</span>
            </Nav.Link>
          </>
          )}

          {/* SESSÃO: PATRIMÔNIO */}
          {/*  Módulo Património: Estrito a Admin e Gerente */}
          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Patrimônio
              </div>
              
              <Nav.Link as={NavLink} to="/lista-bens" className="sidebar-nav-link text-white rounded">
                <BoxSeamFill size={22} className="me-3" />
                <span>Inventário de Bens</span>
              </Nav.Link>

              <Nav.Link as={NavLink} to="/levantamento" className="sidebar-nav-link text-white rounded">
                <ClipboardCheckFill size={22} className="me-3" />
                <span>Auditoria Física</span>
              </Nav.Link>

              <Nav.Link as={NavLink} to="/importar-sipac" className="sidebar-nav-link text-white rounded">
                <CloudUploadFill size={22} className="me-3" />
                <span>Importar SIPAC</span>
              </Nav.Link>
            </>
          )}
          
          {/* SESSÃO: ADMINISTRAÇÃO */}
          {/*  Módulo Sistema: Estrito a Admin e Gerente */}
          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Sistema
              </div>
              <Nav.Link as={NavLink} to="/usuarios" className="sidebar-nav-link text-white rounded">
                <PeopleFill size={22} className="me-3" />
                <span>Usuários</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/unidades" className="sidebar-nav-link text-white rounded">
                <BuildingFill size={22} className="me-3" />
                <span>Unidades</span>
              </Nav.Link>
            </>
          )}
        </Nav>
      </div>

      {/*  RODAPÉ DA SIDEBAR */}
      <div className="mt-auto pt-3 border-top border-secondary">
        <Nav className="flex-column gap-2">
            <Nav.Link as={NavLink} to="/alterar-senha" className="sidebar-nav-link text-white rounded">
                <KeyFill size={22} className="me-3" />
                <span>Alterar Senha</span>
            </Nav.Link>
            
            <Nav.Link as="button" onClick={handleLogout} className="sidebar-nav-link text-white bg-danger rounded border-0 text-start">
                <BoxArrowRight size={22} className="me-3" />
                <span>Sair do Sistema</span>
            </Nav.Link>
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;