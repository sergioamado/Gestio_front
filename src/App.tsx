// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { NotificationRadar } from './components/notificacoes/NotificationRadar';
import { ABRIR_SOLICITACAO, MODULO_ADMINISTRACAO, MODULO_IMPRESSORAS, MODULO_PATRIMONIO } from './utils/permissions';

import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Páginas carregadas sob demanda: cada uma vira um chunk separado no build
// (evita que Plotly/Recharts entrem no carregamento inicial).
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UnidadesPage = lazy(() => import('./pages/usuarios/UnidadesPage'));
const UsuariosPage = lazy(() => import('./pages/usuarios/UsuariosPage'));
const AlterarSenhaPage = lazy(() => import('./pages/usuarios/AlterarSenhaPage'));
const ItensPage = lazy(() => import('./pages/estoque/ItensPage'));
const NovaSolicitacaoPage = lazy(() => import('./pages/requisicoes/NovaSolicitacaoPage'));
const GerenciarSolicitacoesPage = lazy(() => import('./pages/requisicoes/GerenciarSolicitacoesPage'));
const ManutencaoEletronicaPage = lazy(() => import('./pages/eletronica/ManutencaoEletronicaPage'));
const ImpressorasPage = lazy(() => import('./pages/impressoras/ImpressorasPage'));
const ControleSuprimentosPage = lazy(() => import('./pages/impressoras/ControleSuprimentosPage'));
const EstoqueSuprimentosPage = lazy(() => import('./pages/impressoras/EstoqueSuprimentosPage'));
const AtendimentosPage = lazy(() => import('./pages/impressoras/AtendimentosPage'));
const ListaBensPage = lazy(() => import('./pages/Patrimonio/ListaBensPage'));
const LevantamentoPage = lazy(() => import('./pages/Patrimonio/LevantamentoPage'));
const ImportarSipacPage = lazy(() => import('./pages/Patrimonio/ImportarSipacPage'));
const CatalogoServicosPage = lazy(() => import('./pages/servicos/CatalogoServicosPage'));
const ProducaoServicosPage = lazy(() => import('./pages/servicos/ProducaoServicosPage'));
const RelatoriosProducaoPage = lazy(() => import('./pages/servicos/RelatoriosProducaoPage'));
const AnalisesDashboardPage = lazy(() => import('./pages/AnalisesDashboardPage'));

const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <Spinner animation="border" variant="primary" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          {/* Conexão em tempo real única para toda a sessão */}
          <NotificationRadar />
          <SidebarProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  {/* Qualquer usuário autenticado */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
                    <Route path="/itens" element={<ItensPage />} />
                    <Route path="/gerenciar-solicitacoes" element={<GerenciarSolicitacoesPage />} />
                    <Route path="/producao-servicos" element={<ProducaoServicosPage />} />
                    {/* A própria página restringe a admin, gerente e técnicos */}
                    <Route path="/fila-manutencao-eletronica" element={<ManutencaoEletronicaPage />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={ABRIR_SOLICITACAO} />}>
                    <Route path="/nova-solicitacao" element={<NovaSolicitacaoPage />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={MODULO_IMPRESSORAS} />}>
                    <Route path="/impressoras" element={<ImpressorasPage />} />
                    <Route path="/suprimentos" element={<ControleSuprimentosPage />} />
                    <Route path="/estoque-suprimentos" element={<EstoqueSuprimentosPage />} />
                    <Route path="/atendimentos" element={<AtendimentosPage />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={MODULO_PATRIMONIO} />}>
                    <Route path="/levantamento" element={<LevantamentoPage />} />
                    <Route path="/lista-bens" element={<ListaBensPage />} />
                    <Route path="/importar-sipac" element={<ImportarSipacPage />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={MODULO_ADMINISTRACAO} />}>
                    <Route path="/usuarios" element={<UsuariosPage />} />
                    <Route path="/unidades" element={<UnidadesPage />} />
                    <Route path="/catalogo-servicos" element={<CatalogoServicosPage />} />
                    <Route path="/relatorios-producao" element={<RelatoriosProducaoPage />} />
                    <Route path="/analises-bi" element={<AnalisesDashboardPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </SidebarProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
