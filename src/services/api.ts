// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', 
});

api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem('authToken');
    
    // Se o token existir, ele é adicionado ao cabeçalho de autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Retorna a configuração modificada para que a requisição continue seu caminho
    return config;
  },
  (error) => {
    // Em caso de um erro na configuração da requisição, a promessa é rejeitada
    return Promise.reject(error);
  }
);

export default api;