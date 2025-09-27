// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // Define a URL base para todas as requisições. 
  // Agora, em vez de chamar axios.post('http://localhost:3001/api/auth/login'),
  // podemos chamar api.post('/auth/login').
  baseURL: 'http://localhost:3001/api', 
});

// Interceptor de Requisição: Uma função que "intercepta" e modifica 
// cada requisição ANTES de ela ser enviada ao backend.
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage (onde o salvamos após o login)
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