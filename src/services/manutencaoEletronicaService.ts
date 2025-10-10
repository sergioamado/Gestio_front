// src/services/manutencaoEletronicaService.ts
import api from './api';
import type { ManutencaoEletronica, ManutencaoEletronicaCreateData } from '../types';

export const getAll = async (): Promise<ManutencaoEletronica[]> => {
  const response = await api.get('/manutencao-eletronica');
  return response.data;
};

export const create = async (data: ManutencaoEletronicaCreateData): Promise<ManutencaoEletronica> => {
  const response = await api.post('/manutencao-eletronica', data);
  return response.data;
};

export const updateStatus = async (id: number, status: string): Promise<ManutencaoEletronica> => {
  const response = await api.patch(`/manutencao-eletronica/${id}/status`, { status });
  return response.data;
};

export const iniciarManutencao = async (id: number): Promise<ManutencaoEletronica> => {
  const response = await api.patch(`/manutencao-eletronica/${id}/iniciar`);
  return response.data;
};

export const finalizarManutencao = async (id: number, laudo_tecnico: string): Promise<ManutencaoEletronica> => {
  const response = await api.patch(`/manutencao-eletronica/${id}/finalizar`, { laudo_tecnico });
  return response.data;
};