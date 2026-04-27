// src/services/patrimonioService.ts
import api from './api';
import type { BemPatrimonial } from '../types/index';

export const importarSipac = async (formData: FormData) => {
  const response = await api.post('/patrimonio/importar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const conferirTombamento = async (tombamento: string, levantamentoId: number) => {
  const response = await api.post('/patrimonio/conferir', { tombamento, levantamento_id: levantamentoId });
  return response.data;
};

// Retorna a lista de bens para conferência antes de salvar definitivamente
export const processarSipac = async (unidadeId: number, file: File): Promise<Partial<BemPatrimonial>[]> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('unidade_id', unidadeId.toString());
  
  const response = await api.post('/patrimonio/processar-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data; // Lista de bens extraídos
};

export const confirmarImportacao = async (unidadeId: number, bens: Partial<BemPatrimonial>[]) => {
  const response = await api.post('/patrimonio/confirmar-importacao', { 
    unidade_id: unidadeId, 
    bens 
  });
  return response.data;
};

export const getAllBens = async (params?: any): Promise<BemPatrimonial[]> => {
  const response = await api.get('/patrimonio', { params });
  return response.data;
};

export const atribuirBem = async (data: { bem_id: number; tecnico_id: number; observacoes?: string }) => {
  return (await api.post('/patrimonio/atribuir', data)).data;
};

export const registrarMovimentacao = async (data: any) => {
  return (await api.post('/patrimonio/movimentar', data)).data;
};

export const uploadFoto = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append('foto', file);
  return (await api.post(`/patrimonio/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data;
};
