// src/components/notificacoes/NotificationRadar.tsx
import { useEffect } from 'react';
import { socket } from '../../services/socket';
import { useToast } from '../../contexts/ToastContext';
import * as notificacaoService from '../../services/notificacaoService';
import { useAuth } from '../../hooks/useAuth';

export function NotificationRadar() {
  const { mostrarCard } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    //  Liga o rádio e identifica o utilizador
    socket.connect();
    socket.emit('identificar_usuario', user.id);

    //  Fica a ouvir as novidades em Tempo Real (O Grito do Backend)
    socket.on('nova_notificacao', (notificacao) => {
      mostrarCard(notificacao.titulo, notificacao.mensagem, notificacao.tipo.toLowerCase());
    });

    // Recupera o histórico (Para mostrar o que aconteceu enquanto o utilizador estava deslogado)
    const checkNotificacoesOffline = async () => {
      try {
        const notificacoes = await notificacaoService.getNotificacoes();
        const unread = notificacoes.filter(n => !n.lida);
        
        const storageKey = `toasts_exibidos_${user.id}`;
        const exibidosAnteriormente: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let teveNovaNotificacao = false;

        for (const notif of unread) {
          if (!exibidosAnteriormente.includes(notif.id)) {
            const tipoFrontend = notif.tipo ? notif.tipo.toLowerCase() as 'sucesso'|'erro'|'alerta'|'info' : 'info';
            mostrarCard(notif.titulo || 'Mensagem Retida', notif.mensagem, tipoFrontend);
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

    // Executa a verificação retroativa APENAS UMA VEZ na montagem do componente
    checkNotificacoesOffline();

    // LIMPEZA CRÍTICA: Desliga o rádio ao sair da tela para evitar vazamento de memória e notificações duplicadas
    return () => {
      socket.off('nova_notificacao');
      socket.disconnect();
    };
  }, [user, mostrarCard]);

  return null; 
}