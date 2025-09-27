// src/services/solicitacaoService.ts
import api from './api';
import type { Solicitacao, SolicitacaoDetalhada} from '../types';

export const getAllSolicitacoes = async (params?: any): Promise<Solicitacao[]> => {
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