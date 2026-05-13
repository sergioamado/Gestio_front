export type StatusSolicitacao = 'Pendente' | 'Em atendimento' | 'Concluída' | 'Cancelada';

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
  solicitacao_itens: {
    id: number;
    quantidade_solicitada: number;
    status_entrega: 'Pendente' | 'Entregue' | 'Cancelado' | 'Defeito';
    data_entrega: string | null;
    itens: {
      id: number;
      descricao: string;
    };
  }[];
}