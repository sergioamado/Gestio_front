// src/services/patrimonioService.ts
import api from './api';
import type { BemPatrimonial, PatrimonioPaginado } from '../types/index';

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

export const getAllBens = async (params?: any): Promise<PatrimonioPaginado> => {
  const response = await api.get('/patrimonio', { params });
  return response.data;
};


export const uploadFoto = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append('foto', file);
  return (await api.post(`/patrimonio/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data;
};

export const atribuirBem = async (dados: { bem_id: number; tecnico_id: number; observacoes?: string }) => {
  const response = await api.post('/patrimonio/atribuir', dados);
  return response.data;
};

export const devolverBem = async (bem_id: number) => {
  const response = await api.post('/patrimonio/devolver', { bem_id });
  return response.data;
};

export const createBem = async (data: any) => {
  const response = await api.post('/patrimonio', data);
  return response.data;
};

export const updateBem = async (id: number, data: any) => {
  const response = await api.put(`/patrimonio/${id}`, data);
  return response.data;
};

export const deleteBem = async (id: number) => {
  const response = await api.delete(`/patrimonio/${id}`);
  return response.data;
};

export const registrarMovimentacao = async (dados: { 
  bem_ids: number[], 
  origem_unidade_id?: number, 
  destino_unidade_id: number, 
  observacao?: string 
}) => {
  const response = await api.post('/patrimonio/transferencia', dados);
  return response.data;
};

export const getHistoricoBem = async (bem_id: number) => {
  const response = await api.get(`/patrimonio/${bem_id}/historico`);
  return response.data;
};

export const iniciarLevantamento = async () => {
  const response = await api.post('/patrimonio/levantamento/iniciar');
  return response.data;
};

export const getLevantamentoAtual = async (unidade_id: number) => {
  const response = await api.get('/patrimonio/levantamento/atual', { params: { unidade_id } });
  return response.data;
};

export const biparItemLevantamento = async (dados: { tombamento: string, unidade_id: number }) => {
  const response = await api.post('/patrimonio/levantamento/bipar', dados);
  return response.data;
};

export const finalizarLevantamento = async () => {
  const response = await api.post('/patrimonio/levantamento/finalizar');
  return response.data;
};