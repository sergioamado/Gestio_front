// src/services/unidadeService.ts
import api from './api';
import type { Unidade, UnidadeCreateData, UnidadeUpdateData } from '../types';

export const getAllUnidades = async (): Promise<Unidade[]> => {
  const response = await api.get('/unidades');
  return response.data;
};

export const createUnidade = async (data: UnidadeCreateData): Promise<Unidade> => {
  const response = await api.post('/unidades', data);
  return response.data;
};

export const updateUnidade = async (id: number, data: UnidadeUpdateData): Promise<Unidade> => {
  const response = await api.put(`/unidades/${id}`, data);
  return response.data;
};

export const deleteUnidade = async (id: number): Promise<void> => {
  await api.delete(`/unidades/${id}`);
};


