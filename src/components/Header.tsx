// src/components/Header.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { List, PersonCircle, BellFill, GearFill } from 'react-bootstrap-icons';
import { Badge } from 'react-bootstrap';
import NotificacoesOffcanvas from './notificacoes/NotificacoesOffcanvas';
import ConfigurarNotificacoesModal from './notificacoes/ConfigurarNotificacoesModal';
import * as notificacaoService from '../services/notificacaoService';
import type { Notificacao } from '../services/notificacaoService';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

function Header({ title, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  
  // Estados para as Notificações
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotificacoes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificacaoService.getNotificacoes();
      setNotificacoes(data);

      // Lógica nativa do navegador para OS novas
      const naoLidas = data.filter(n => !n.lida);
      if (naoLidas.length > 0 && Notification.permission === 'granted') {
        // Mostra a notificação mais recente no sistema operacional (Windows/Mac/Linux)
        new Notification('COSUP+', { body: naoLidas[0].mensagem });
      }
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca as notificações quando o Header carrega e fica checando a cada 30 segundos (Polling)
  useEffect(() => {
    fetchNotificacoes();
    const interval = setInterval(() => {
      fetchNotificacoes();
    }, 30000); 
    return () => clearInterval(interval);
  }, [fetchNotificacoes]);

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  const formatRole = (role?: string) => {
    if (!role) return '';
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'gerente': 'Gerente de Unidade',
      'tecnico': 'Técnico',
      'tecnico_impressora': 'Técnico de Impressoras',
      'tecnico_eletronica': 'Técnico de Eletrônica'
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <header className="bg-white border-bottom shadow-sm px-4 py-3 sticky-top" style={{ zIndex: 1000 }}>
          <div className='d-flex justify-content-between align-items-center'>
              
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-link text-secondary p-0 me-3 shadow-none border-0" 
                  onClick={onToggleSidebar}
                  style={{ transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.classList.replace('text-secondary', 'text-primary')}
                  onMouseOut={(e) => e.currentTarget.classList.replace('text-primary', 'text-secondary')}
                >
                  <List size={28} />
                </button>
                <h4 className="m-0 fw-bold text-dark">{title}</h4>
              </div>
              
              <div className="d-flex align-items-center gap-4">
                 {/* BLOCO DE NOTIFICAÇÕES */}
                 <div className="d-flex align-items-center gap-2">
                    {/* Botão de Configuração de Alertas */}
                    <button 
                      className="btn btn-link text-muted p-1 border-0 shadow-none" 
                      onClick={() => setShowConfigModal(true)}
                      title="Configurar Telegram e Alertas"
                    >
                      <GearFill size={18} />
                    </button>

                    {/* O Sininho de Notificações */}
                    <button 
                      className="btn btn-link text-secondary p-1 border-0 shadow-none position-relative" 
                      onClick={() => setShowOffcanvas(true)}
                    >
                      <BellFill size={22} />
                      {unreadCount > 0 && (
                        <Badge 
                          bg="danger" 
                          pill 
                          className="position-absolute top-0 start-100 translate-middle border border-light border-2"
                          style={{ fontSize: '0.65rem' }}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </button>
                 </div>

                 {/* Linha divisória vertical sutil */}
                 <div className="vr d-none d-md-block opacity-25"></div>

                 {/* Perfil do Usuário */}
                 <div className="d-none d-md-flex align-items-center">
                    <div className="text-end me-3">
                      <span className="d-block fw-bold text-dark lh-1 mb-1" style={{ fontSize: '0.9rem' }}>
                          {user?.nome_completo || 'Usuário do Sistema'}
                      </span>
                      <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                          {formatRole(user?.role)}
                      </span>
                    </div>
                    <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center text-primary shadow-sm border">
                      <PersonCircle size={24} />
                    </div>
                 </div>
              </div>
              
          </div>
      </header>

      {/* COMPONENTES INVISÍVEIS ATÉ SEREM CHAMADOS */}
      <NotificacoesOffcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)} 
        notificacoes={notificacoes}
        onUpdate={fetchNotificacoes}
        loading={loading && notificacoes.length === 0}
      />

      <ConfigurarNotificacoesModal 
        show={showConfigModal} 
        onHide={() => setShowConfigModal(false)} 
      />
    </>
  );
}

export default Header;