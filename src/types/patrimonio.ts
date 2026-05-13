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