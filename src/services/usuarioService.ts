// src/services/usuarioService.ts
import api from './api';
import type { Usuario, UsuarioCreateData, UsuarioUpdateData } from '../types';

export const getAllUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const createUsuario = async (data: UsuarioCreateData): Promise<Usuario> => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: number, data: UsuarioUpdateData): Promise<Usuario> => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};

export const resetPasswordByAdmin = async (username: string, newPassword: string):Promise<void> => {
  await api.put('/usuarios/reset-password', { username, newPassword });
}

export const getTecnicos = async (): Promise<Usuario[]> => {
  const response = await api.get('/usuarios', { params: { role: 'tecnico' } });
  return response.data;
};