// src/components/notificacoes/NotificationRadar.tsx
import { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import * as notificacaoService from '../../services/notificacaoService';
import { useAuth } from '../../hooks/useAuth';

export function NotificationRadar() {
  const { mostrarCard } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkNotificacoes = async () => {
      try {
        //  Busca as notificações do usuário no Backend
        const notificacoes = await notificacaoService.getNotificacoes();
        
        //  Separa apenas as que ainda não foram lidas
        const unread = notificacoes.filter(n => !n.lida);

        //  Lê da memória do navegador quais Toasts já foram mostrados nesta máquina
        const storageKey = `toasts_exibidos_${user.id}`;
        const exibidosAnteriormente: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let teveNovaNotificacao = false;

        //  Analisa cada notificação não lida
        for (const notif of unread) {
          // Se o ID da notificação não estiver na memória, é uma novidade! Dispara o Toast.
          if (!exibidosAnteriormente.includes(notif.id)) {
            const tipoFrontend = notif.tipo ? notif.tipo.toLowerCase() as 'sucesso'|'erro'|'alerta'|'info' : 'info';
            
            mostrarCard(notif.titulo || 'Nova Atualização', notif.mensagem, tipoFrontend);
            
            exibidosAnteriormente.push(notif.id);
            teveNovaNotificacao = true;
          }
        }

        //  Se mostrámos algo novo, guardamos a nova lista na memória do navegador
        if (teveNovaNotificacao) {
          // Limpa as muito antigas para não pesar a memória (mantém os últimos 50 IDs)
          if (exibidosAnteriormente.length > 50) {
            exibidosAnteriormente.splice(0, exibidosAnteriormente.length - 50);
          }
          localStorage.setItem(storageKey, JSON.stringify(exibidosAnteriormente));
        }

      } catch (error) {
        console.error('Radar: Falha ao buscar novas notificações em background.', error);
      }
    };

    // Executa a primeira verificação mal o utilizador faz Login
    checkNotificacoes();

    // Configura o Radar para dar uma "espreitadela" ao servidor a cada 15 segundos
    const intervalId = setInterval(checkNotificacoes, 15000);

    // Desliga o Radar se o utilizador fechar a página ou fizer Logout
    return () => clearInterval(intervalId);
  }, [user, mostrarCard]);

  return null; 
}