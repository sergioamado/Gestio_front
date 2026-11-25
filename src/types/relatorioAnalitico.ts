// src/types/relatorioAnalitico.ts
export type StatusRelatorioAnalitico = 'PENDENTE' | 'DEVOLVIDO' | 'ASSINADO' | 'ANULADO';

export interface ItemRelatorioAnalitico {
  equipamento: string;
  patrimonio: string;
}

/** "Fotografia" guardada na assinatura: o PDF assinado é sempre gerado a partir dela. */
export interface DocumentoRelatorioAnalitico {
  modelo: { versao: number; cabecalho: string[]; local: string; titulo: string; paragrafos: string[] };
  numero: number;
  ano: number;
  numero_formatado: string;
  unidade: { nome: string; sigla: string | null };
  data_documento: string;
  itens: ItemRelatorioAnalitico[];
  tecnico: { nome: string };
  assinante: { nome: string; cargo: string };
  assinado_em: string;
  codigo_verificacao: string;
}

export interface RelatorioAnalitico {
  id: number;
  unidade_id: number;
  tecnico_id: number;
  status: StatusRelatorioAnalitico;
  numero: number | null;
  ano: number | null;
  numero_formatado: string | null;
  criado_em: string;
  atualizado_em: string;
  motivo_devolucao: string | null;
  assinado_em: string | null;
  cargo_assinante: string | null;
  codigo_verificacao: string | null;
  documento: DocumentoRelatorioAnalitico | null;
  anulado_em: string | null;
  motivo_anulacao: string | null;
  origem_id: number | null;
  itens: (ItemRelatorioAnalitico & { id: number; ordem: number })[];
  tecnico: { id: number; nome_completo: string };
  assinado_por: { id: number; nome_completo: string } | null;
  anulado_por: { id: number; nome_completo: string } | null;
  unidade: { id: number; nome: string; sigla: string | null };
  avisos?: string[];
}

export interface VerificacaoRelatorioAnalitico {
  valido: boolean;
  status: StatusRelatorioAnalitico;
  numero_formatado: string | null;
  unidade: string;
  assinado_por?: string;
  assinado_em?: string;
  anulado_em?: string | null;
  motivo_anulacao?: string | null;
  itens: ItemRelatorioAnalitico[];
}
