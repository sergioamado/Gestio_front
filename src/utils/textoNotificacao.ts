// src/utils/textoNotificacao.ts
/**
 * As mensagens de notificação usam *asteriscos* para negrito no Telegram.
 * Dentro do sistema eles apareceriam literalmente, então são removidos.
 */
export const textoSemMarcacao = (texto?: string | null) => (texto ?? '').replace(/\*/g, '');
