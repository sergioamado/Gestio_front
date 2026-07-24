export interface Unidade {
  id: number;
  nome: string;
  sigla: string | null;
  campus: string | null;
}

export type UnidadeCreateData = Omit<Unidade, 'id'>;
export type UnidadeUpdateData = Omit<Unidade, 'id'>;