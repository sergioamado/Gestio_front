// src/services/atendimentoService.ts
import api from './api';
import type { AtendimentoImpressora, AtendimentoCreateData, AtendimentoUpdateData } from '../types';

export const getAllAtendimentos = async (): Promise<AtendimentoImpressora[]> => {
  const response = await api.get('/gestao-impressoras/atendimentos');
  return response.data;
};

export const createAtendimento = async (data: AtendimentoCreateData): Promise<AtendimentoImpressora> => {
  const response = await api.post('/gestao-impressoras/atendimentos', data);
  return response.data;
};

export const updateAtendimento = async (id: number, data: AtendimentoUpdateData): Promise<AtendimentoImpressora> => {
  const response = await api.put(`/gestao-impressoras/atendimentos/${id}`, data);
  return response.data;
};