// src/types/index.ts

// --- TIPOS DE ENTIDADES BASE (ESPELHAM O BANCO DE DADOS) ---

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
  role: 'admin' | 'gerente' | 'tecnico';
  telefone?: string | null; // <-- CORREÇÃO: Assegura que o tipo está correto
  email?: string | null;   // Adicionado
  unidade_id: number | null;
  unidades_organizacionais?: {
    nome: string;
  };
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
}

export interface Solicitacao {
  id: number;
  data_solicitacao: string; // O backend envia como string ISO
  status: 'Pendente' | 'Em atendimento' | 'Concluída' | 'Cancelada';
  tecnico_responsavel: string; // Nome completo do responsável
  setor_equipamento: string | null;
  numero_glpi: string | null;
  patrimonio: string | null;
  usuario_id: number; // ID do solicitante
  responsavel_usuario_id: number; // ID do técnico
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
}