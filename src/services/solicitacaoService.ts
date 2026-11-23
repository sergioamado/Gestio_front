// src/services/solicitacaoService.ts
import api from './api';
import type { Solicitacao, SolicitacaoDetalhada, SolicitacaoCreateData, SolicitacaoPaginada } from '../types/index';

export const getAllSolicitacoes = async (params?: any): Promise<SolicitacaoPaginada> => {
  const response = await api.get('/solicitacoes', { params });
  return response.data;
};

export const getSolicitacaoById = async (id: number): Promise<SolicitacaoDetalhada> => {
    const response = await api.get(`/solicitacoes/${id}`);
    return response.data;
}

export const createSolicitacao = async (data: SolicitacaoCreateData): Promise<Solicitacao> => {
  const response = await api.post('/solicitacoes', data);
  return response.data;
};

export interface UpdateSolicitacaoPayload {
  status?: string;
  numero_pedido_externo?: string | null;
  justificativa?: string | null;
  itens_entrega?: { solicitacao_item_id: number; status_entrega: string; motivo?: string }[];
}

// Único caminho para mudar status da OS e das peças (regras validadas no backend).
export const updateSolicitacao = async (id: number, data: UpdateSolicitacaoPayload) => {
  const response = await api.put(`/solicitacoes/${id}`, data);
  return response.data;
};

export const converterTesteEmConsumo = async (itemId: number) => {
  const response = await api.put(`/solicitacoes/item/${itemId}/converter-consumo`);
  return response.data;
};