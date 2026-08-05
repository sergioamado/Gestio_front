export type StatusSolicitacao = 'PENDENTE' | 'EM ATENDIMENTO' | 'PRONTA PARA VISTORIA' | 'CONCLUIDA' | 'CANCELADA';

export interface Solicitacao {
  id: number;
  data_solicitacao: string; 
  status: StatusSolicitacao;
  tecnico_responsavel: string; 
  setor_equipamento: string | null;
  numero_glpi: string | null;
  patrimonio: string | null;
  usuario_id: number; 
  responsavel_usuario_id: number; 
  unidade_id: number;
  justificativa: string;
  numero_pedido_externo?: string | null;
  documento_emitido_em?: string | null;
}

export interface SolicitacaoCreateItem {
  id: number;
  quantidade: number;
}

export interface SolicitacaoCreateData {
  responsavel_usuario_id: number;
  setor_equipamento: string;
  numero_glpi: string;
  patrimonio: string;
  unidade_id: number;
  itens: SolicitacaoCreateItem[];
}

export interface SolicitacaoDetalhada extends Solicitacao {
  responsavel?: { 
    nome_completo: string;
  };
  unidades_organizacionais?: {
    id: number;
    nome: string;
    sigla?: string;
  };
  usuarios_solicitacoes_usuario_idTousuarios?: {
    id: number;
    nome_completo: string;
  };
  usuarios_solicitacoes_responsavel_usuario_idTousuarios?: {
    id: number;
    nome_completo: string;
  };
  solicitacao_itens: {
    id: number;
    quantidade_solicitada: number;
    status_entrega: 'Pendente' | 'Entregue' | 'Cancelado' | 'Defeito' | 'Recebida pelo Técnico' | 'Devolvida';
    data_entrega: string | null;
    itens: {
      id: number;
      descricao: string;
      codigo_sipac?: string | null;
    };
  }[];
}
export interface PaginacaoMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SolicitacaoPaginada {
  data: SolicitacaoDetalhada[];
  meta: PaginacaoMeta;
}