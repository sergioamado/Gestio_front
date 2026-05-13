export interface SolicitacoesPorTecnico {
  tecnico: string;
  total_solicitacoes: number;
}

export interface TopItens {
  descricao: string;
  quantidade_total: number;
}

export interface GlobalStats {
  total_unidades: number;
  total_usuarios: number;
  total_itens: number;
  solicitacoes_pendentes: number;
}

export interface RelatorioDetalhadoParams {
    tecnicoId: number;
    dataInicio: string;
    dataFim: string;
}

export interface SolicitacaoRecente {
  id: number;
  data_solicitacao: string;
  status: string;
  tecnico_responsavel: string;
  numero_glpi: string | null;
}