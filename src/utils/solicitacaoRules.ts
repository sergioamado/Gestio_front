// src/utils/solicitacaoRules.ts
// Espelho das regras do backend (Gestio_back/src/rules/solicitacaoRules.ts), usado
// só para decidir o que mostrar na tela. Quem valida de verdade é o backend.
import type { StatusSolicitacao } from '../types';

export const ITEM = {
  PENDENTE: 'Pendente',
  ENTREGUE: 'Entregue',
  RECEBIDA: 'Recebida pelo Técnico',
  AGUARDANDO_DEVOLUCAO: 'Aguardando Devolução',
  DEVOLVIDA: 'Devolvida',
  DEVOLUCAO_ACEITE: 'Devolução Aceite',
  CANCELADO: 'Cancelado',
} as const;

export const ITEM_LABEL: Record<string, string> = {
  [ITEM.PENDENTE]: 'Pendente Almoxarifado',
  [ITEM.ENTREGUE]: 'Disponível para Retirada',
  [ITEM.RECEBIDA]: 'Em posse do Técnico',
  [ITEM.AGUARDANDO_DEVOLUCAO]: 'Aguardando Devolução (Teste)',
  [ITEM.DEVOLVIDA]: 'Devolvida c/ Defeito (Técnico)',
  [ITEM.DEVOLUCAO_ACEITE]: 'Devolução Aceite (Almoxarifado)',
  [ITEM.CANCELADO]: 'Cancelado (devolvido ao estoque)',
};

export const OS_LABEL: Record<string, string> = {
  PENDENTE: '⏳ Pendente',
  'EM ATENDIMENTO': '🛠️ Em Atendimento',
  'PRONTA PARA VISTORIA': '👀 Pronta para Vistoria',
  CONCLUIDA: '✅ Concluída',
  CANCELADA: '❌ Cancelada',
};

export const osEncerrada = (status: string) => status === 'CONCLUIDA' || status === 'CANCELADA';

/** Próximos status da OS que o gerente pode escolher. */
export const proximosStatusOSGerente = (atual: string): StatusSolicitacao[] => {
  if (osEncerrada(atual)) return [];
  const proximos: StatusSolicitacao[] = [];
  if (atual === 'PENDENTE' || atual === 'APROVADA') proximos.push('EM ATENDIMENTO');
  if (atual === 'PRONTA PARA VISTORIA') proximos.push('CONCLUIDA');
  proximos.push('CANCELADA');
  return proximos;
};

/** Próximos status de peça que o gerente pode escolher. */
export const proximosStatusItemGerente = (atual: string, tipoUso?: string): string[] => {
  const normalizado = tipoUso === 'TESTE' && atual === ITEM.RECEBIDA ? ITEM.AGUARDANDO_DEVOLUCAO : atual;
  if (normalizado === ITEM.PENDENTE) return [ITEM.ENTREGUE];
  if (normalizado === ITEM.ENTREGUE) return [ITEM.PENDENTE];
  if (normalizado === ITEM.AGUARDANDO_DEVOLUCAO || normalizado === ITEM.DEVOLVIDA) return [ITEM.DEVOLUCAO_ACEITE];
  return [];
};

export const tecnicoPodeReceber = (status: string) => status === ITEM.ENTREGUE;

export const tecnicoPodeDevolver = (status: string) =>
  status === ITEM.ENTREGUE || status === ITEM.RECEBIDA || status === ITEM.AGUARDANDO_DEVOLUCAO;

export const tecnicoPodeConverter = (status: string, tipoUso?: string) =>
  tipoUso === 'TESTE' && (status === ITEM.AGUARDANDO_DEVOLUCAO || status === ITEM.RECEBIDA);
