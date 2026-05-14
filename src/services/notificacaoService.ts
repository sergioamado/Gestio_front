// src/services/notificacaoService.ts
import api from './api';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
  tipo: 'SISTEMA' | 'OS' | 'ESTOQUE' | 'ALERTA';
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

export const vincularTelegram = async (chatId: string) => {
  const response = await api.post('/usuarios/telegram', { telegram_chat_id: chatId });
  return response.data;
};

export const salvarPreferencias = async (dados: { 
  telegram_chat_id: string, 
  prefs_navegador: Record<string, boolean>, 
  prefs_telegram: Record<string, boolean> 
}) => {
  const response = await api.post('/usuarios/preferencias-notificacao', dados);
  return response.data;
};