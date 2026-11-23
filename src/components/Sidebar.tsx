// src/components/Sidebar.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasRole, ABRIR_SOLICITACAO, MODULO_ADMINISTRACAO, MODULO_ELETRONICA, MODULO_IMPRESSORAS, MODULO_PATRIMONIO } from '../utils/permissions';
import ufsLogo from '../assets/ufs_principal_negativa.png';
import { 
  HouseDoorFill, PeopleFill, BoxSeamFill, BuildingFill, KeyFill, 
  BoxArrowRight, PencilSquare, ListCheck, Tools, PrinterFill, 
  InboxesFill, ArchiveFill, ClipboardCheckFill, CloudUploadFill,
  MotherboardFill, JournalText, FileEarmarkBarGraphFill, BarChartLineFill, Boxes, XLg, ChevronDown
} from 'react-bootstrap-icons';
import { useSidebar } from '../contexts/SidebarContext';

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { closeSidebar, closeSidebarIfMobile } = useSidebar();

  // Indicador "mais opções abaixo": em telas baixas (ex.: notebook 1366x768) parte do menu
  // fica escondida e a barra de rolagem nem sempre aparece.
  const rolagemRef = useRef<HTMLDivElement>(null);
  const [temMaisAbaixo, setTemMaisAbaixo] = useState(false);
  const verificarRolagem = useCallback(() => {
    const el = rolagemRef.current;
    if (el) setTemMaisAbaixo(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);
  useEffect(() => {
    verificarRolagem();
    const el = rolagemRef.current;
    if (!el) return;
    const obs = new ResizeObserver(verificarRolagem);
    obs.observe(el);
    if (el.firstElementChild) obs.observe(el.firstElementChild);
    return () => obs.disconnect();
  }, [verificarRolagem, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar-container d-flex flex-column bg-dark text-white w-100 border-end border-secondary position-relative" aria-label="Menu principal">
      
      {/* Celular: botão para fechar a barra */}
      <button
        type="button"
        className="btn btn-link text-white position-absolute top-0 end-0 m-2 p-2 d-lg-none"
        onClick={closeSidebar}
        aria-label="Fechar menu"
        title="Fechar menu"
      >
        <XLg size={22} />
      </button>

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

      <div className="position-relative flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
      <div ref={rolagemRef} onScroll={verificarRolagem} className="sidebar-scroll flex-grow-1 pe-1" style={{ overflowY: 'auto', overflowX: 'hidden' }} onClick={closeSidebarIfMobile}>
        <Nav className="flex-column gap-1">
          
          <Nav.Link as={NavLink} to="/dashboard" className="sidebar-nav-link text-white rounded" title="Painel Inicial">
            <HouseDoorFill size={22} className="me-3" />
            <span>Painel Inicial</span>
          </Nav.Link>
        
        
          {/* MÓDULO: CHAMADOS E PEÇAS                   */}
          
          <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Chamados & Peças
          </div>
          
          {/* Nova Solicitação: só técnicos (gerente gere, admin só visualiza) */}
          {hasRole(user, ABRIR_SOLICITACAO) && (
           <Nav.Link as={NavLink} to="/nova-solicitacao" className="sidebar-nav-link text-white rounded" title="Nova Solicitação">
            <PencilSquare size={22} className="me-3" />
            <span>Nova Solicitação</span>
           </Nav.Link>
          )}

          <Nav.Link as={NavLink} to="/gerenciar-solicitacoes" className="sidebar-nav-link text-white rounded" title="Gerenciar OS">
            <ListCheck size={22} className="me-3" />
            <span>Gerenciar OS</span>
          </Nav.Link>

          <Nav.Link as={NavLink} to="/itens" className="sidebar-nav-link text-white rounded" title="Catálogo de Peças">
            <BoxSeamFill size={22} className="me-3" />
            <span>Catálogo de Peças</span>
          </Nav.Link>

          <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            Produção & Serviços
          </div>
          {/* MÓDULO SERVIÇOS E PRECIFICAÇÃO*/}
          <Nav.Link as={NavLink} to="/producao-servicos" className="sidebar-nav-link text-white rounded" title="Minha Produção">
            <Tools size={22} className="me-3" />
            <span>Minha Produção</span>
          </Nav.Link>



          {/* MÓDULO: IMPRESSORAS E SUPRIMENTOS          */}
          
          {hasRole(user, MODULO_IMPRESSORAS) && (
          <>
            <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
              Gestão de Impressoras
            </div>
            
            <Nav.Link as={NavLink} to="/impressoras" className="sidebar-nav-link text-white rounded" title="Impressoras">
              <PrinterFill size={22} className="me-3" />
              <span>Impressoras</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/atendimentos" className="sidebar-nav-link text-white rounded" title="Atend. Técnico">
              <Tools size={22} className="me-3" />
              <span>Atend. Técnico</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/estoque-suprimentos" className="sidebar-nav-link text-white rounded" title="Entrada de Toners">
              <ArchiveFill size={22} className="me-3" />
              <span>Entrada de Toners</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/suprimentos" className="sidebar-nav-link text-white rounded" title="Saída Suprimentos">
              <InboxesFill size={22} className="me-3" />
              <span>Saída Suprimentos</span>
            </Nav.Link>
          </>
          )}



          {/* MÓDULO: MANUTENÇÃO ELETRÔNICA              */}
          
          {hasRole(user, MODULO_ELETRONICA) && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Eletrônica
              </div>
              <Nav.Link as={NavLink} to="/fila-manutencao-eletronica" className="sidebar-nav-link text-white rounded" title="Fila de Manutenção">
                <MotherboardFill size={22} className="me-3" /> 
                <span>Fila de Manutenção</span>
              </Nav.Link>
            </>
          )}



          {/* MÓDULO: PATRIMÔNIO                         */}
          
          {hasRole(user, MODULO_PATRIMONIO) && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Patrimônio
              </div>
              
              <Nav.Link as={NavLink} to="/lista-bens" className="sidebar-nav-link text-white rounded" title="Inventário de Bens">
                <Boxes size={22} className="me-3" />
                <span>Inventário de Bens</span>
              </Nav.Link>

              <Nav.Link as={NavLink} to="/levantamento" className="sidebar-nav-link text-white rounded" title="Auditoria Física">
                <ClipboardCheckFill size={22} className="me-3" />
                <span>Auditoria Física</span>
              </Nav.Link>

              <Nav.Link as={NavLink} to="/importar-sipac" className="sidebar-nav-link text-white rounded" title="Importar SIPAC">
                <CloudUploadFill size={22} className="me-3" />
                <span>Importar SIPAC</span>
              </Nav.Link>
            </>
          )}
          
          
          
          
          {/* MÓDULO: SISTEMA / ADMINISTRAÇÃO            */}
          
          {hasRole(user, MODULO_ADMINISTRACAO) && (
            <>
              <div className="sidebar-title text-uppercase text-white-50 small fw-bold mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Administração
              </div>
              {/* MÓDULO SERVIÇOS E PRECIFICAÇÃO*/}
              <Nav.Link as={NavLink} to="/catalogo-servicos" className="sidebar-nav-link text-white rounded" title="Catálogo de Serviços">
              <JournalText size={22} className="me-3" />
              <span>Catálogo de Serviços</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/relatorios-producao" className="sidebar-nav-link text-white rounded" title="Relatórios">
              <FileEarmarkBarGraphFill size={22} className="me-3" />
              <span>Relatórios</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/analises-bi" className="sidebar-nav-link text-white rounded" title="Análises">
              <BarChartLineFill size={22} className="me-3" />
              <span>Análises</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/usuarios" className="sidebar-nav-link text-white rounded" title="Usuários">
                <PeopleFill size={22} className="me-3" />
                <span>Usuários</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/unidades" className="sidebar-nav-link text-white rounded" title="Unidades">
                <BuildingFill size={22} className="me-3" />
                <span>Unidades</span>
              </Nav.Link>
            </>
          )}
        </Nav>
      </div>
      {temMaisAbaixo && (
        <button
          type="button"
          className="sidebar-mais-opcoes"
          onClick={() => rolagemRef.current?.scrollBy({ top: 240, behavior: 'smooth' })}
          aria-label="Mostrar mais opções do menu"
          title="Mais opções abaixo"
        >
          <ChevronDown size={14} className="me-1" /><span>mais opções</span>
        </button>
      )}
      </div>


      {/* RODAPÉ DA SIDEBAR                          */}

      <div className="mt-auto pt-3 border-top border-secondary">
        <Nav className="flex-column gap-2">
            <Nav.Link as={NavLink} to="/alterar-senha" className="sidebar-nav-link text-white rounded" title="Alterar Senha">
                <KeyFill size={22} className="me-3" />
                <span>Alterar Senha</span>
            </Nav.Link>
            
            <Nav.Link as="button" onClick={handleLogout} title="Sair do Sistema" className="sidebar-nav-link text-white bg-danger rounded border-0 text-start">
                <BoxArrowRight size={22} className="me-3" />
                <span>Sair do Sistema</span>
            </Nav.Link>
        </Nav>
      </div>
    </nav>
  );
}

export default Sidebar;