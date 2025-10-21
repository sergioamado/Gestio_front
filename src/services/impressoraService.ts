// src/services/impressoraService.ts
import api from './api';
import type { Impressora, ImpressoraCreateData, ImpressoraFiltros, ImpressoraUpdateData } from '../types';

// Função para buscar TODAS as impressoras (sem filtros)
export const getAllImpressoras = async (): Promise<Impressora[]> => {
  const response = await api.get('/gestao-impressoras/impressoras');
  return response.data;
};

// Função para buscar impressoras COM filtros
export const getFilteredImpressoras = async (filtros: ImpressoraFiltros): Promise<Impressora[]> => {
  const response = await api.get('/gestao-impressoras/impressoras', { params: filtros });
  return response.data;
};

// Função para criar uma impressora
export const createImpressora = async (data: ImpressoraCreateData): Promise<Impressora> => {
  const response = await api.post('/gestao-impressoras/impressoras', data);
  return response.data;
};

// Função para atualizar uma impressora
export const updateImpressora = async (id: number, data: ImpressoraUpdateData): Promise<Impressora> => {
  const response = await api.put(`/gestao-impressoras/impressoras/${id}`, data);
  return response.data;
};

// Função para fazer o soft delete de uma impressora
export const deleteImpressora = async (id: number): Promise<void> => {
  await api.delete(`/gestao-impressoras/impressoras/${id}`);
};