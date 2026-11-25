// src/services/api.ts
import axios from 'axios';
import { API_URL } from '../config';
import { getToken, limparSessao } from './sessao';

// Cria a instância do Axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de REQUISIÇÃO 
// Antes de qualquer requisição sair injeta o token
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // token DESTA aba
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPOSTA
// Analisa resposta do backend
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 nas rotas de login/troca de senha é "senha errada", não "sessão expirada":
    // não pode deslogar (antes, errar a senha atual ao trocá-la expulsava o usuário).
    const rotaDeAutenticacao = /\/auth\//.test(error.config?.url ?? '');
    if (error.response && error.response.status === 401 && !rotaDeAutenticacao) {
      console.warn("🔒 Sessão expirada ou não autorizada. A redirecionar...");
      
      limparSessao();
      
      // Redireciona para a tela de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    if (error.response && error.response.status === 403) {
      console.error("⛔ Acesso negado. Nível de permissão insuficiente.");
    }

    return Promise.reject(error);
  }
);

export default api;