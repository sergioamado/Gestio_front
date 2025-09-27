// src/types/index.ts

// --- TIPOS DE ENTIDADES BASE (ESPELHAM O BANCO DE DADOS) ---

export interface Unidade {
  id: number;
  nome: string;
  sigla: string | null;
  campus: string | null;
}

export interface Usuario {
  id: number;
  username: string;
  nome_completo: string;
  role: 'admin' | 'gerente' | 'tecnico';
  unidade_id: number | null;
  // Propriedade opcional para quando incluímos dados da unidade
  unidades_organizacionais?: {
    nome: string;
  } | null;
}

export interface Item {
  id: number;
  codigo_sipac: string | null;
  pregao: string | null;
  descricao: string;
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
  tecnico_responsavel: string; // Simplificado pelo backend
}


// --- TIPOS PARA PAYLOADS DE API (CRIAÇÃO/ATUALIZAÇÃO) ---

export type UnidadeCreateData = Omit<Unidade, 'id'>;
export type UnidadeUpdateData = Omit<Unidade, 'id'>;

export type ItemCreateData = Omit<Item, 'id'>;
export type ItemUpdateData = Omit<Item, 'id' | 'unidade_id'>;

export type UsuarioCreateData = Omit<Usuario, 'id' | 'unidades_organizacionais'> & { password?: string };
export type UsuarioUpdateData = Omit<Usuario, 'id' | 'unidades_organizacionais' | 'username'>;

export interface SolicitacaoCreateItem {
  id: number;
  quantidade: number;
}

export interface SolicitacaoCreateData {
  responsavel_usuario_id: number;
  setor_equipamento?: string;
  numero_glpi?: string;
  patrimonio?: string;
  unidade_id: number;
  itens: SolicitacaoCreateItem[];
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

export interface SolicitacaoDetalhada extends Solicitacao {
    solicitacao_itens: {
        id: number;
        quantidade_solicitada: number;
        status_entrega: 'Pendente' | 'Entregue';
        itens: {
            id: number;
            descricao: string;
        }
    }[];
}

export interface RelatorioDetalhadoParams {
    tecnicoId: number;
    dataInicio: string;
    dataFim: string;
}

