// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { SidebarProvider } from './contexts/SidebarContext'; 

import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnidadesPage from './pages/usuarios/UnidadesPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import AlterarSenhaPage from './pages/usuarios/AlterarSenhaPage';
import ItensPage from './pages/estoque/ItensPage';
import NovaSolicitacaoPage from './pages/requisicoes/NovaSolicitacaoPage';
import GerenciarSolicitacoesPage from './pages/requisicoes/GerenciarSolicitacoesPage';
import ManutencaoEletronicaPage from './pages/eletronica/ManutencaoEletronicaPage';
import ImpressorasPage from './pages/impressoras/ImpressorasPage';
import ControleSuprimentosPage from './pages/impressoras/ControleSuprimentosPage';
import EstoqueSuprimentosPage from './pages/impressoras/EstoqueSuprimentosPage';
import AtendimentosPage from './pages/impressoras/AtendimentosPage';
import ListaBensPage from './pages/Patrimonio/ListaBensPage';
import LevantamentoPage from './pages/Patrimonio/LevantamentoPage';
import ImportarSipacPage from './pages/Patrimonio/ImportarSipacPage';
import CatalogoServicosPage from './pages/servicos/CatalogoServicosPage';
import ProducaoServicosPage from './pages/servicos/ProducaoServicosPage';
import RelatoriosProducaoPage from './pages/servicos/RelatoriosProducaoPage';
import AnalisesDashboardPage from './pages/AnalisesDashboardPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider> 
        <ConfirmProvider>
          {/*   provedor global do layout aqui */}
          <SidebarProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Rotas Protegidas - arquitetura segura */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/unidades" element={<UnidadesPage />} /> 
                  <Route path="/usuarios" element={<UsuariosPage />} />
                  <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
                  <Route path="/itens" element={<ItensPage />} />
                  <Route path="/nova-solicitacao" element={<NovaSolicitacaoPage />} /> 
                  <Route path="/gerenciar-solicitacoes" element={<GerenciarSolicitacoesPage />} />
                  <Route path="/fila-manutencao-eletronica" element={<ManutencaoEletronicaPage />} />
                  <Route path="/impressoras" element={<ImpressorasPage />} />
                  <Route path="/suprimentos" element={<ControleSuprimentosPage />} />
                  <Route path="/estoque-suprimentos" element={<EstoqueSuprimentosPage />} />
                  <Route path="/atendimentos" element={<AtendimentosPage />} />
                  <Route path="/levantamento" element={<LevantamentoPage/>} />
                  <Route path="/lista-bens" element={<ListaBensPage/>} />
                  <Route path="/importar-sipac" element={<ImportarSipacPage/>} />
                  <Route path="/catalogo-servicos" element={<CatalogoServicosPage/>} />
                  <Route path="/producao-servicos" element={<ProducaoServicosPage/>} />
                  <Route path="/relatorios-producao" element={<RelatoriosProducaoPage/>} />
                  <Route path="/analises-bi" element={<AnalisesDashboardPage/>} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" />} />          
              </Routes>        
            </Router>
          </SidebarProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;