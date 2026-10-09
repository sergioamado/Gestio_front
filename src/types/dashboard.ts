export interface WidgetContainerProps {
  widget: {
    id?: number;
    titulo: string;
    tipo: 'bar' | 'line' | 'pie';
    dataset: string;
    configuracao: {
      dimensoes: string[];
      metricas: string[];
    };
  };
  refreshTrigger: number; 
}

export interface DashboardProps {
  refreshTrigger?: number;
}

export interface GraficoStatus {
  name: string;
  quantidade: number;
}

export interface Estatisticas {
  os_pendentes: number;
  baixo_estoque: number;
  patrimonio_ativo: number;
  grafico_status?: GraficoStatus[];
}