// src/services/authService.ts
import api from './api';
import type { User } from '../types';
import type {LoginResponse} from '../types';
import { salvarSessao, limparSessao, getUsuarioSalvo } from './sessao';

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

    // Sessão desta aba (e "último login" para abas novas): ver services/sessao.ts
    salvarSessao(token, user);

    return user;
  } catch (error: any) {
    // Re-lança o erro para que o componente possa tratá-lo
    if (error.response && error.response.data) {
      const erro = new Error(error.response.data.message || 'Falha no login.') as Error & { retryAfter?: number };
      // 429 = bloqueio por excesso de tentativas; o backend informa quantos segundos esperar.
      if (error.response.status === 429) erro.retryAfter = Number(error.response.data.retry_after) || undefined;
      throw erro;
    }
    throw new Error('Não foi possível conectar ao servidor.');
  }
};

/**
 * Encerra a sessão desta aba.
 */
export const logout = (): void => {
  limparSessao();
};

/**
 * Retorna os dados do usuário armazenados, se existirem.
 * @returns Os dados do usuário ou null.
 */
export const getCurrentUser = (): User | null => getUsuarioSalvo<User>();

export const changeOwnPassword = async (currentPassword : string, newPassword : string): Promise<{ message: string }> => {
  const response = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};