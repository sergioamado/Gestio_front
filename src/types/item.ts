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
  is_permanente: boolean;
  patrimonio_item?: string;
  unidades_organizacionais?: {
    nome: string;
  };
}

export type ItemCreateData = Omit<Item, 'id'>;
export type ItemUpdateData = Omit<Item, 'id' | 'unidade_id'>;

export interface CartItem {
  id: number;
  descricao: string;
  quantidade: number;
  quantidade_estoque: number;
}