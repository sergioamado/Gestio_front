// src/components/Header.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { List, PersonCircle, BellFill, GearFill } from 'react-bootstrap-icons';
import { Badge } from 'react-bootstrap';
import NotificacoesOffcanvas from './notificacoes/NotificacoesOffcanvas';
import ConfigurarNotificacoesModal from './notificacoes/ConfigurarNotificacoesModal';
import * as notificacaoService from '../services/notificacaoService';
import type { Notificacao } from '../services/notificacaoService';
import { socket } from '../services/socket'; 

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

function Header({ title, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // isSilent para a tela não piscar quando o Socket atualizar os dados
  const fetchNotificacoes = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await notificacaoService.getNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // 1. Carrega as notificações iniciais ao abrir o sistema
  useEffect(() => {
    fetchNotificacoes();
    
    // Pede permissão ao navegador para notificações nativas, se ainda não tiver
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [fetchNotificacoes]);

  // A ANTENA DO SININHO E DA BARRA LATERAL
  useEffect(() => {
    if (!user) return;

    const lidarComNovaNotificacao = (novaNotif: Notificacao) => {
      console.log("🔔 O Rádio tocou no Header! Atualizando o sininho...");
      
      // Atualiza a lista de notificações silenciosamente (a bolinha vermelha sobe sozinha)
      fetchNotificacoes(true);

      // Dispara a notificação nativa do sistema (Windows/Mac) apenas no momento em que ela chega!
      if (Notification.permission === 'granted') {
        new Notification('COSUP+', { 
            body: novaNotif.mensagem,
            icon: '/favicon.ico' // Opcional: coloque o caminho do seu logo aqui
        });
      }
    };

    socket.on('nova_notificacao', lidarComNovaNotificacao);

    return () => {
      socket.off('nova_notificacao', lidarComNovaNotificacao);
    };
  }, [user, fetchNotificacoes]);
  // ==========================================================================

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
                 <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-link text-muted p-1 border-0 shadow-none" 
                      onClick={() => setShowConfigModal(true)}
                      title="Configurar Telegram e Alertas"
                    >
                      <GearFill size={18} />
                    </button>

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

                 <div className="vr d-none d-md-block opacity-25"></div>

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

      <NotificacoesOffcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)} 
        notificacoes={notificacoes}
        onUpdate={() => fetchNotificacoes(true)} //  isSilent=true para atualizar sem Spinner
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