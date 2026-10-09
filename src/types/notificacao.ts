
export interface OffcanvasProps {
  show: boolean;
  onHide: () => void;
  notificacoes: Notificacao[];
  onUpdate: () => void;
  loading: boolean;  
}

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
  tipo: 'SISTEMA' | 'OS' | 'ESTOQUE' | 'ALERTA';
  link_acao?: string | null;
  usuario_id?: number;
}

export interface PreferenciasNotificacao {
  notificacoes_app: boolean;
  notificacoes_bot: boolean;
  desvincular_telegram?: boolean;
  telegram_chat_id?: string | null;
}