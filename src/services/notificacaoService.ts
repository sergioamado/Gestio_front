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

export interface StatusTelegram {
  bot_ativo: boolean;
  bot_username: string | null;
  bot_link: string | null;
  vinculado: boolean;
  telegram_chat_id: string | null;
  notificacoes_bot: boolean;
  notificacoes_app: boolean;
}

/** Situação real da vinculação, lida do servidor (o usuário salvo no navegador pode estar desatualizado). */
export const getStatusTelegram = async (): Promise<StatusTelegram> => {
  const response = await api.get('/notificacoes/telegram/status');
  return response.data;
};

export const gerarLinkTelegram = async (): Promise<{ link: string }> => {
  const response = await api.get('/notificacoes/telegram/gerar-link');
  return response.data;
};



export const salvarPreferencias = async (payload: PreferenciasNotificacao) => {
  const response = await api.put('/notificacoes/preferencias', payload);
  return response.data;
};