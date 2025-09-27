// src/services/authService.ts
import type { Usuario } from '../types/index';
import api from './api';

interface LoginResponse {
  token: string;
  user: Usuario;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', { username, password });
  return response.data;
};