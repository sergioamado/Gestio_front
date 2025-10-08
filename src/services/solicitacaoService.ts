// src/services/solicitacaoService.ts
import api from './api';
// CORRIGIDO: A função agora retorna o tipo SolicitacaoDetalhada
import type { Solicitacao, SolicitacaoDetalhada, SolicitacaoCreateData } from '../types/index';

export const getAllSolicitacoes = async (params?: any): Promise<SolicitacaoDetalhada[]> => {
    const response = await api.get('/solicitacoes', { params });
    return response.data;
}

export const getSolicitacaoById = async (id: number): Promise<SolicitacaoDetalhada> => {
    const response = await api.get(`/solicitacoes/${id}`);
    return response.data;
}

export const updateSolicitacaoStatus = async (id: number, status: string): Promise<Solicitacao> => {
    const response = await api.patch(`/solicitacoes/${id}/status`, { status });
    return response.data;
}

export const updateSolicitacaoItemStatus = async (itemId: number, status_entrega: 'Pendente' | 'Entregue'): Promise<void> => {
    await api.patch(`/solicitacoes/item/${itemId}/status`, { status_entrega });
}

export const createSolicitacao = async (data: SolicitacaoCreateData): Promise<Solicitacao> => {
  const response = await api.post('/solicitacoes', data);
  return response.data;
};