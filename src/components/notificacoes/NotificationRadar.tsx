// src/components/notificacoes/NotificationRadar.tsx
// Dono único da conexão Socket.IO. Renderizado uma vez no App (fora das páginas),
// para que a navegação entre rotas não derrube e reabra a conexão.
import { useEffect } from 'react';
import { socket } from '../../services/socket';
import { useToast } from '../../contexts/ToastContext';
import * as notificacaoService from '../../services/notificacaoService';
import { useAuth } from '../../hooks/useAuth';
import { textoSemMarcacao } from '../../utils/textoNotificacao';

// Acima disto, as notificações acumuladas viram um único card de resumo (não cobrem a tela).
const MAX_CARDS_OFFLINE = 2;

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
      mostrarCard(textoSemMarcacao(notificacao.titulo), textoSemMarcacao(notificacao.mensagem), toTipo(notificacao.tipo));
    };

    // Conexão recusada pelo servidor (token vencido/ inválido, ou servidor reiniciando).
    // O socket.io NÃO tenta de novo depois de uma recusa: sem isto, as notificações paravam
    // em silêncio com a tela aberta. Aqui: confere a sessão pela API (se venceu, o interceptor
    // do axios leva ao login com o aviso) e, se a sessão estiver boa, tenta reconectar.
    let tentativa = 0;
    let timerReconexao: ReturnType<typeof setTimeout> | undefined;
    const onConnectError = (err: Error) => {
      if (socket.active) return; // queda de rede comum: o próprio socket.io já está tentando
      tentativa += 1;
      const atraso = Math.min(30_000, 2_000 * 2 ** Math.min(tentativa - 1, 4)); // 2 s, 4 s ... 30 s
      console.warn(`Radar: conexão recusada (${err.message}). Nova tentativa em ${atraso / 1000}s.`);
      clearTimeout(timerReconexao);
      timerReconexao = setTimeout(() => {
        notificacaoService
          .getNotificacoes() // 401 aqui = sessão vencida → interceptor redireciona para o login
          .then(() => socket.connect())
          .catch(() => { /* sem rede ou sessão vencida: o interceptor já cuidou */ });
      }, atraso);
    };
    const onConnect = () => { tentativa = 0; identificar(); };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
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
        const novas = unread.filter((n) => !exibidosAnteriormente.includes(n.id));
        const teveNovaNotificacao = novas.length > 0;

        if (novas.length > MAX_CARDS_OFFLINE) {
          mostrarCard(
            '🔔 Notificações enquanto você estava fora',
            `Você tem ${novas.length} notificações novas. Abra o sininho no topo da tela para ver todas.`,
            'info',
            8000,
          );
        } else {
          for (const notif of novas) {
            mostrarCard(textoSemMarcacao(notif.titulo) || 'Mensagem Retida', textoSemMarcacao(notif.mensagem), toTipo(notif.tipo));
          }
        }
        exibidosAnteriormente.push(...novas.map((n) => n.id));

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
      clearTimeout(timerReconexao);
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('nova_notificacao', onNovaNotificacao);
      socket.disconnect();
    };
  }, [userId, mostrarCard]);

  return null;
}
