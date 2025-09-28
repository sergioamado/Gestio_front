// src/services/authService.ts
import api from './api';

// Tipos para os dados do usuário e da resposta da API
interface User {
  id: number;
  nome_completo: string;
  role: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

/**
 * Realiza o login do usuário, armazena o token e os dados do usuário.
 * @param username - O nome de usuário.
 * @param password - A senha do usuário.
 * @returns Os dados do usuário logado.
 */
export const login = async (username : string, password : string): Promise<User> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });

    const { token, user } = response.data;

    // Armazena o token e as informações do usuário no localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));

    return user;
  } catch (error: any) {
    // Re-lança o erro para que o componente possa tratá-lo
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Falha no login.');
    }
    throw new Error('Não foi possível conectar ao servidor.');
  }
};

/**
 * Remove os dados de autenticação do localStorage.
 */
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};

/**
 * Retorna os dados do usuário armazenados, se existirem.
 * @returns Os dados do usuário ou null.
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('authUser');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};