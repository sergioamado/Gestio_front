// src/utils/notificacaoNavegador.ts
// Notificações nativas do navegador (o "balão" do Windows/Mac/Android), com proteção.
//
// Por que existe: a API `Notification` NÃO existe em todo lugar. No Safari do iPhone (fora do app
// instalado) e em alguns navegadores de celular, só citar `Notification` lança
// "Notification is not defined" e derrubava a tela inteira (tela branca logo após o login).
// No Chrome do Android ela existe, mas `new Notification()` lança erro (lá exige service worker).
// Tudo aqui falha em silêncio: os cards do sistema e o sininho continuam funcionando.

export const navegadorSuportaNotificacao = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const permissaoNotificacao = (): NotificationPermission | 'indisponivel' =>
  navegadorSuportaNotificacao() ? Notification.permission : 'indisponivel';

export const pedirPermissaoNotificacao = async (): Promise<NotificationPermission | 'indisponivel'> => {
  if (!navegadorSuportaNotificacao()) return 'indisponivel';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const mostrarNotificacaoNativa = (titulo: string, corpo: string) => {
  if (permissaoNotificacao() !== 'granted') return;
  try {
    new Notification(titulo, { body: corpo, icon: '/favicon.ico' });
  } catch {
    /* Android/Chrome sem service worker: fica só o card do sistema */
  }
};
