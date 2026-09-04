// src/components/Sidebar.tsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ufsLogo from '../assets/ufs_principal_negativa.png';
import { 
  HouseDoorFill, PeopleFill, BoxSeamFill, BuildingFill, KeyFill, 
  BoxArrowRight, PencilSquare, ListCheck, Tools, PrinterFill, 
  InboxesFill, ArchiveFill, ClipboardCheckFill, CloudUploadFill,
  MotherboardFill 
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
        
        
          {/* MÓDULO: CHAMADOS E PEÇAS                   */}
          
          <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Chamados & Peças
          </div>
          
          {/* Nova Solicitação: Oculto para o gerente. Admin e técnicos veem */}
          {user?.role !== 'gerente' && (
           <Nav.Link as={NavLink} to="/nova-solicitacao" className="sidebar-nav-link text-white rounded">
            <PencilSquare size={22} className="me-3" />
            <span>Nova Solicitação</span>
           </Nav.Link>
          )}

          <Nav.Link as={NavLink} to="/gerenciar-solicitacoes" className="sidebar-nav-link text-white rounded">
            <ListCheck size={22} className="me-3" />
            <span>Gerenciar OS</span>
          </Nav.Link>

          <Nav.Link as={NavLink} to="/itens" className="sidebar-nav-link text-white rounded">
            <BoxSeamFill size={22} className="me-3" />
            <span>Catálogo de Peças</span>
          </Nav.Link>

          <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Produção & Serviços
          </div>
          {/* MÓDULO SERVIÇOS E PRECIFICAÇÃO*/}
          <Nav.Link as={NavLink} to="/producao-servicos" className="sidebar-nav-link text-white rounded">
            <Tools size={22} className="me-3" />
            <span>Minha Produção</span>
          </Nav.Link>



          {/* MÓDULO: IMPRESSORAS E SUPRIMENTOS          */}
          
          {(user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_impressora') && (
          <>
            <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
              Gestão de Impressoras
            </div>
            
            <Nav.Link as={NavLink} to="/impressoras" className="sidebar-nav-link text-white rounded">
              <PrinterFill size={22} className="me-3" />
              <span>Impressoras</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/atendimentos" className="sidebar-nav-link text-white rounded">
              <Tools size={22} className="me-3" />
              <span>Atend. Técnico</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/estoque-suprimentos" className="sidebar-nav-link text-white rounded">
              <ArchiveFill size={22} className="me-3" />
              <span>Entrada de Toners</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/suprimentos" className="sidebar-nav-link text-white rounded">
              <InboxesFill size={22} className="me-3" />
              <span>Saída Suprimentos</span>
            </Nav.Link>
          </>
          )}



          {/* MÓDULO: MANUTENÇÃO ELETRÔNICA              */}
          
          {(user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_eletronica') && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Eletrônica
              </div>
              <Nav.Link as={NavLink} to="/fila-manutencao-eletronica" className="sidebar-nav-link text-white rounded">
                <MotherboardFill size={22} className="me-3" /> 
                <span>Fila de Manutenção</span>
              </Nav.Link>
            </>
          )}



          {/* MÓDULO: PATRIMÔNIO                         */}
          
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
          
          
          
          
          {/* MÓDULO: SISTEMA / ADMINISTRAÇÃO            */}
          
          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Administração
              </div>
              {/* MÓDULO SERVIÇOS E PRECIFICAÇÃO*/}
              <Nav.Link as={NavLink} to="/catalogo-servicos" className="sidebar-nav-link text-white rounded">
              <ListCheck size={22} className="me-3" />
              <span>Catálogo de Serviços</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/relatorios-producao" className="sidebar-nav-link text-white rounded">
              <ListCheck size={22} className="me-3" />
              <span>Relatórios</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/analises-bi" className="sidebar-nav-link text-white rounded">
              <ListCheck size={22} className="me-3" />
              <span>Analises</span>
              </Nav.Link>
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


      {/* RODAPÉ DA SIDEBAR                          */}

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