
// MÓDULO DE SERVIÇOS E PRODUÇÃO
export interface CatalogoServico {
  id: number;
  nome_servico: string;
  categoria: string;
  valor_estimado: number | string; // Pode vir como string do Prisma Decimal
  ativo: boolean;
}

export interface ProducaoServico {
  id: number;
  data_registro: string;
  tecnico_id: number;
  servico_id: number;
  solicitacao_peca_id?: number | null;
  atendimento_impr_id?: number | null;
  manutencao_eletr_id?: number | null;
  numero_glpi?: string | null;
  valor_servico_aplicado: number | string;
  valor_pecas_aplicado: number | string;
  valor_total_produzido: number | string;
  observacoes?: string | null;
  
  // Relacionamentos que vêm populados do backend (opcionais)
  servico?: { nome_servico: string; categoria: string; };
  tecnico?: { nome_completo: string; };
}