// src/services/relatorioService.ts
import api from './api';
import type { SolicitacoesPorTecnico, TopItens, GlobalStats, RelatorioDetalhadoParams, SolicitacaoRecente } from '../types';

export const getSolicitacoesPorTecnico = async (): Promise<SolicitacoesPorTecnico[]> => {
  const response = await api.get('/relatorios/solicitacoes-por-tecnico');
  return response.data;
};

export const getTopItens = async (): Promise<TopItens[]> => {
  const response = await api.get('/relatorios/top-itens');
  return response.data;
};

export const getStatsGlobal = async (): Promise<GlobalStats> => {
    const response = await api.get('/relatorios/stats-global');
    return response.data;
}

export const getRelatorioDetalhadoPorTecnico = async (params: RelatorioDetalhadoParams): Promise<any[]> => {
    const response = await api.get('/relatorios/detalhado-por-tecnico', { params });
    return response.data;
}

export const getLatestSolicitacoes = async (): Promise<SolicitacaoRecente[]> => {
  const response = await api.get('/solicitacoes/latest');
  return response.data;
};