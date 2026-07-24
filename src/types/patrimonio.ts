export interface BemPatrimonial {
  id: number;
  tombamento: string;
  descricao: string;
  marca?: string;
  localizacao_fisica: string;
  foto_url?: string;
  status_atual: string;
}

export interface ConferenciaResultado {
  bem: BemPatrimonial;
  status_conferido: 'OK' | 'Transferido' | 'Nao Encontrado';
  info_adicional?: string;
}

export interface PatrimonioPaginado {
  data: BemPatrimonial[];
  meta: { total: number; page: number; limit: number; totalPages: number; };
}

export interface BemDetailsModalProps {
  show: boolean;
  onHide: () => void;
  bem: BemPatrimonial | null;
  onUpdate: () => void;
}

export interface BemPatrimonial {
  id: number;
  tombamento: string;
  descricao: string;
  marca?: string;
  localizacao_fisica: string;
  foto_url?: string;
  status_atual: string;
  unidade_id: number;
  data_importacao: string;
  unidade_nome?: string;
  tecnico_responsavel?: string | null; 
}