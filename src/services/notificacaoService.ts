// src/services/notificacaoService.ts
import api from './api';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
  tipo: 'SISTEMA' | 'OS' | 'ESTOQUE' | 'ALERTA';
  link_acao?: string |null;
}

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

export const salvarPreferencias = async (dados: { 
  notificacoes_app: boolean, 
  notificacoes_bot: boolean,
  desvincular_telegram?: boolean
}) => {
  const response = await api.put('/usuarios/preferencias-notificacoes', dados);
  return response.data;
};