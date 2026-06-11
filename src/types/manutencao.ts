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
  tecnico_responsavel_id: number;
};

export interface ManutencaoCardProps {
  manutencao: ManutencaoEletronica;
  onDetailsClick: (manutencao: ManutencaoEletronica) => void;
  onUpdate: () => void;
}