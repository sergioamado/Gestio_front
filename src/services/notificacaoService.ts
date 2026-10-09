// src/services/notificacaoService.ts
import api from './api';
import type { Notificacao, PreferenciasNotificacao } from '../types';


export const getNotificacoes = async (): Promise<Notificacao[]> => {
  const response = await api.get('/notificacoes');
  return response.data;
};

export const marcarComoLida = async (id: number) => {
  const response = await api.put(`/notificacoes/${id}/lida`);
  return response.data;
};

export const marcarTodasComoLidas = async () => {
  const response = await api.put('/notificacoes/lidas-todas');
  return response.data;
};

export const gerarLinkTelegram = async (): Promise<{ link: string }> => {
  const response = await api.get('/usuarios/telegram/gerar-link');
  return response.data;
};



export const salvarPreferencias = async (payload: PreferenciasNotificacao) => {
  const response = await api.put('/notificacoes/preferencias', payload);
  return response.data;
};