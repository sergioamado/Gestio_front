// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnidadesPage from './pages/UnidadesPage';
import UsuariosPage from './pages/UsuariosPage';
import AlterarSenhaPage from './pages/AlterarSenhaPage';
import ItensPage from './pages/ItensPage';
import NovaSolicitacaoPage from './pages/NovaSolicitacaoPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/unidades" element={<UnidadesPage />} /> 
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/alterar-senha" element={<AlterarSenhaPage />} />
            <Route path="/itens" element={<ItensPage />} />
            <Route path="/nova-solicitacao" element={<NovaSolicitacaoPage />} /> 
            {/* Adicione outras rotas protegidas aqui */}
          </Route>

          {/* Rota padrão: redireciona para o dashboard se logado, senão para o login */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;