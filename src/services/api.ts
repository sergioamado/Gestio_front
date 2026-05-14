// src/services/api.ts
import axios from 'axios';

// Cria a instância do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api', 
});


// Interceptor de REQUISIÇÃO 
// Antes de qualquer requisição sair injeta o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
    if (error.response && error.response.status === 401) {
      console.warn("🔒 Sessão expirada ou não autorizada. A redirecionar...");
      
      // Limpa os dados mortos do navegador
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redireciona para o ecrã de login
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