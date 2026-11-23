// src/types/relatorioPersonalizado.ts
export type TipoCampo = 'texto' | 'numero' | 'moeda' | 'data' | 'mes' | 'booleano';
export type Valor = string | number | boolean | null;
export type LinhaRelatorio = Record<string, Valor>;

export interface CampoFonte {
  key: string;
  label: string;
  tipo: TipoCampo;
  /** false = número de identificação (Nº OS, ano...): só pode ser contado */
  agregavel?: boolean;
}

export interface FonteRelatorio {
  id: string;
  nome: string;
  grupo: string;
  descricao: string;
  tem_periodo: boolean;
  campos: CampoFonte[];
}

export type Operador = 'igual' | 'diferente' | 'contem' | 'nao_contem' | 'maior' | 'menor' | 'vazio' | 'nao_vazio';
export type Agregacao = 'contagem' | 'soma' | 'media' | 'minimo' | 'maximo';

export interface ConfigRelatorio {
  fonte: string;
  tipo: 'detalhado' | 'cruzado';
  titulo?: string;
  periodo?: { inicio?: string; fim?: string };
  unidade_id?: number | null;
  filtros: { campo: string; operador: Operador; valor?: string }[];
  colunas?: string[];
  ordenacao?: { campo: string; direcao: 'asc' | 'desc' } | null;
  linhas?: string[];
  coluna?: string | null;
  valores?: { campo: string; agregacao: Agregacao }[];
}

export interface ResultadoRelatorio {
  colunas: CampoFonte[];
  linhas: LinhaRelatorio[];
  totais: LinhaRelatorio | null;
  total_registros: number;
  avisos: string[];
  meta: {
    titulo: string;
    fonte: string;
    tipo: 'detalhado' | 'cruzado';
    gerado_em: string;
    gerado_por: { nome: string; papel: string };
    unidade: string;
    periodo: string | null;
    filtros: string[];
  };
}

export interface ModeloRelatorio {
  id: number;
  nome: string;
  descricao: string | null;
  compartilhado: boolean;
  configuracao: ConfigRelatorio;
  usuario_id: number;
  autor: string | null;
  atualizado_em: string;
}
