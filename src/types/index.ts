// src/types/index.ts


export type StatusSolicitacao = 'Pendente' | 'Em atendimento' | 'Concluída' | 'Cancelada';

export type Role = 'admin' | 'gerente' | 'tecnico' | 'tecnico_impressora' | 'tecnico_eletronica';
export interface Unidade {
  id: number;
  nome: string;
  sigla: string | null;
  campus: string | null;
}

export interface User {
  id: number;
  username: string;
  nome_completo: string;
  role: Role;
  telefone?: string | null;
  email?: string | null;   
  unidade_id: number | null;
  unidades_organizacionais?: {
    nome: string;
  };
}
export interface AdminResetPasswordFormProps {
  users: User[];
  onSuccess: (message: string) => void;
}

export type UserCreateData = Omit<User, 'id' | 'unidades_organizacionais'> & { password?: string };
export type UserUpdateData = Omit<User, 'id' | 'username' | 'unidades_organizacionais' | 'password'>;


export interface Item {
  id: number;
  descricao: string;
  codigo_sipac: string | null;
  pregao: string | null;
  tipo: string | null;
  unidade_medida: string;
  localizacao: string | null;
  quantidade: number;
  preco_unitario: number;
  unidade_id: number;
  unidades_organizacionais?: {
    nome: string;
  };
}

export interface Solicitacao {
  id: number;
  data_solicitacao: string; 
  status: 'Pendente' | 'Em atendimento' | 'Concluída' | 'Cancelada';
  tecnico_responsavel: string; 
  setor_equipamento: string | null;
  numero_glpi: string | null;
  patrimonio: string | null;
  usuario_id: number; 
  responsavel_usuario_id: number; 
  unidade_id: number;
}


// --- TIPOS PARA PAYLOADS DE API (CRIAÇÃO/ATUALIZAÇÃO) ---

export type UnidadeCreateData = Omit<Unidade, 'id'>;
export type UnidadeUpdateData = Omit<Unidade, 'id'>;

export type ItemCreateData = Omit<Item, 'id'>;
export type ItemUpdateData = Omit<Item, 'id' | 'unidade_id'>;

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
    status_entrega: 'Pendente' | 'Entregue';
    data_entrega: string | null;
    itens: {
      id: number;
      descricao: string;
    };
  }[];
}

// --- TIPOS PARA RESPOSTAS DE API DE RELATÓRIOS ---

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

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface CartItem {
  id: number;
  descricao: string;
  quantidade: number;
  quantidade_estoque: number;
}

export type StatusManutencao = 'Pendente' | 'Em_manutencao' | 'Concluido';

export interface ManutencaoEletronica {
  id: number;
  glpi: string | null;
  tecnico_responsavel_id: number | null; 
  equipamento: string;
  descricao_problema: string;
  laudo_tecnico: string | null; 
  data_entrada: string;
  status: StatusManutencao;
  tecnico_responsavel: { 
    nome_completo: string;
  } | null;
}

export type ManutencaoEletronicaCreateData = Omit<ManutencaoEletronica, 'id' | 'data_entrada' | 'status' | 'tecnico_responsavel' | 'laudo_tecnico' | 'tecnico_responsavel_id'> & {
  tecnico_responsavel_id: number; // No formulário de criação, o técnico é obrigatório
};

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