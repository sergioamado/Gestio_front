// src/services/usuarioService.ts
import api from './api';
import type { User, UserCreateData, UserUpdateData } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const createUser = async (data: UserCreateData): Promise<User> => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateData): Promise<User> => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};

export const resetPasswordByAdmin = async (username: string, newPassword: string):Promise<void> => {
  await api.put('/usuarios/reset-password', { username, newPassword });
}

export const getTecnicos = async (): Promise<User[]> => {
  const response = await api.get('/usuarios', { params: { role: 'tecnico' } });
  return response.data;
};

export const resetPasswordByAdminUsers = async (username: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.put('/usuarios/reset-password', {
    username,
    newPassword,
  });
  return response.data;
};