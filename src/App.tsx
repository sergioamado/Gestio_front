// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home'; 
import GerenciarItens from './pages/GerenciarItens';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarUnidades from './pages/GerenciarUnidades'; 
import NovaSolicitacao from './pages/NovaSolicitacao';
import Dashboard from './pages/Dashboard';
import GerenciarSolicitacoes from './pages/GerenciarSolicitacoes';
import AlterarSenha from './pages/AlterarSenha'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota pública de Login */}
          <Route path="/login" element={<Login />} />

          {/* Container para todas as rotas que exigem login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/itens" element={<GerenciarItens />} />
            <Route path="/usuarios" element={<GerenciarUsuarios />} />
            <Route path="/unidades" element={<GerenciarUnidades />} />
            <Route path="/solicitacoes/nova" element={<NovaSolicitacao />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/solicitacoes" element={<GerenciarSolicitacoes />} />
            <Route path="/alterar-senha" element={<AlterarSenha />} />
            {/* Adicione outras rotas protegidas aqui */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;