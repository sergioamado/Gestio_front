export interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  numero_serie: string;
  ip?: string;
  localizacao: string;
  servidor?: string;
  politicas_aplicadas: boolean;
  status_verificacao: string;
  unidade_id: number;
  is_colorida: boolean;
  unidades_organizacionais?: {
    nome: string;
  };
}

export type ImpressoraCreateData = Omit<Impressora, 'id' | 'unidades_organizacionais'>;
export type ImpressoraUpdateData = Omit<ImpressoraCreateData, 'unidade_id'>;

export interface ImpressoraFiltros {
  ip?: string;
  numero_serie?: string;
  unidade_id_filtro?: string;
  politicas_aplicadas?: string;
}

export interface ControleSuprimentos {
    id: number;
    data: string;
    numero_glpi?: string | null;
    unidade_imagem_solicitadas: number;
    toner_preto_solicitados: number;
    toner_ciano_solicitados: number;
    toner_magenta_solicitados: number;
    toner_amarelo_solicitados: number;
    tecnico_id: number;
    impressora_id: number;
    tecnico?: {
      nome_completo: string;
    };
    impressora?: {
        nome: string;
        modelo: string;
    };
}

export type ControleSuprimentosCreateData = Omit<ControleSuprimentos, 'id' | 'data' | 'tecnico_id' | 'tecnico' | 'impressora'>;

export interface EstoqueSuprimentos {
  id: number;
  unidade_imagem_total: number;
  toner_preto_total: number;
  toner_ciano_total: number;
  toner_magenta_total: number;
  toner_amarelo_total: number;
  data_ultima_atualizacao: string;
}

export type StatusAtendimento = 
  | 'Aguardando_Assistencia'
  | 'Em_Atendimento'
  | 'Aguardando_Peca'
  | 'Aguardando_Peca_Com_Backup'
  | 'Aguardando_Peca_Impressao_Redirecionada'
  | 'Concluido'
  | 'Cancelado';

export interface AtendimentoImpressora {
  id: number;
  data: string;
  data_visita?: string | null;
  numero_glpi: string;
  status: StatusAtendimento;
  setor_visitado: boolean;
  necessita_pecas: boolean;
  descricao_pecas?: string | null;
  chamado_assistencia?: string | null;
  assistencia_realizada: boolean;
  parecer_tecnico?: string | null;
  assistencia_concluiu: boolean;
  parecer_final_assistencia?: string | null;
  necessita_backup: boolean;
  backup_impressora_nome?: string | null;
  backup_impressora_modelo?: string | null;
  backup_numero_serie?: string | null;
  backup_ip?: string | null;
  backup_data_disponibilizacao?: string | null;
  backup_data_retirada?: string | null;
  unidade_id: number;
  impressora_id: number;
  tecnico_id: number;
  impressora?: {
    nome: string;
    modelo: string;
    localizacao: string;
  };
  tecnico_responsavel?: {
    nome_completo: string;
  };
  unidades_organizacionais?: {
      nome: string;
  }
}

export type AtendimentoCreateData = Omit<AtendimentoImpressora, 'id' | 'data' | 'status' | 'tecnico_id' | 'impressora' | 'tecnico_responsavel' | 'unidades_organizacionais'>;
export type AtendimentoUpdateData = Partial<Omit<AtendimentoImpressora, 'id' | 'impressora_id' | 'unidade_id' | 'tecnico_id'>>;

export interface AtendimentosTableProps {
  atendimentos: AtendimentoImpressora[];
  onDetails: (atendimento: AtendimentoImpressora) => void; 
  onEdit: (atendimento: AtendimentoImpressora) => void;  
}