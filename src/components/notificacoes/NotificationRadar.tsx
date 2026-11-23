// src/components/notificacoes/NotificationRadar.tsx
// Dono único da conexão Socket.IO. Renderizado uma vez no App (fora das páginas),
// para que a navegação entre rotas não derrube e reabra a conexão.
import { useEffect } from 'react';
import { socket } from '../../services/socket';
import { useToast } from '../../contexts/ToastContext';
import * as notificacaoService from '../../services/notificacaoService';
import { useAuth } from '../../hooks/useAuth';

type TipoToast = 'sucesso' | 'erro' | 'alerta' | 'info';

const toTipo = (tipo?: string): TipoToast => {
  const t = tipo?.toLowerCase();
  return t === 'sucesso' || t === 'erro' || t === 'alerta' ? t : 'info';
};

export function NotificationRadar() {
  const { mostrarCard } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    // Re-identifica a cada (re)conexão, inclusive após queda de rede.
    const identificar = () => socket.emit('identificar_usuario', userId);

    const onNovaNotificacao = (notificacao: { titulo: string; mensagem: string; tipo?: string }) => {
      mostrarCard(notificacao.titulo, notificacao.mensagem, toTipo(notificacao.tipo));
    };

    socket.on('connect', identificar);
    socket.on('nova_notificacao', onNovaNotificacao);
    if (socket.connected) identificar();
    else socket.connect();

    // Mostra o que chegou enquanto o usuário estava deslogado (uma vez por login).
    const checkNotificacoesOffline = async () => {
      try {
        const notificacoes = await notificacaoService.getNotificacoes();
        const unread = notificacoes.filter(n => !n.lida);

        const storageKey = `toasts_exibidos_${userId}`;
        const exibidosAnteriormente: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let teveNovaNotificacao = false;

        for (const notif of unread) {
          if (!exibidosAnteriormente.includes(notif.id)) {
            mostrarCard(notif.titulo || 'Mensagem Retida', notif.mensagem, toTipo(notif.tipo));
            exibidosAnteriormente.push(notif.id);
            teveNovaNotificacao = true;
          }
        }

        if (teveNovaNotificacao) {
          if (exibidosAnteriormente.length > 50) {
            exibidosAnteriormente.splice(0, exibidosAnteriormente.length - 50);
          }
          localStorage.setItem(storageKey, JSON.stringify(exibidosAnteriormente));
        }
      } catch (error) {
        console.error('Radar: Falha ao buscar notificações em background.', error);
      }
    };
    checkNotificacoesOffline();

    // Só roda no logout (userId muda) ou ao desmontar o App.
    return () => {
      socket.off('connect', identificar);
      socket.off('nova_notificacao', onNovaNotificacao);
      socket.disconnect();
    };
  }, [userId, mostrarCard]);

  return null;
}
