// src/services/api.ts
import axios from 'axios';
import { API_URL } from '../config';

// Cria a instância do Axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de REQUISIÇÃO 
// Antes de qualquer requisição sair injeta o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
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
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
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