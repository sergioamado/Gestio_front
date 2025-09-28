// src/services/usuarioService.ts
import api from './api';
import type { User, UserCreateData, UserUpdateData } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (data: UserCreateData): Promise<User> => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateData): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const resetPasswordByAdmin = async (username: string, newPassword: string):Promise<void> => {
  await api.put('/users/reset-password', { username, newPassword });
}

export const getTecnicos = async (): Promise<User[]> => {
  const response = await api.get('/usuarios', { params: { role: 'tecnico' } });
  return response.data;
};