// src/components/notificacoes/NotificacoesOffcanvas.tsx
import { useState } from 'react';
import { Offcanvas, ListGroup, Badge, Button, Spinner, Form } from 'react-bootstrap';
import { CheckAll, BoxSeam, Tools, BellFill, ShieldExclamation, BoxArrowUpRight, GearFill, Telegram, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import type { Notificacao } from '../../services/notificacaoService';
import * as notificacaoService from '../../services/notificacaoService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';

interface OffcanvasProps {
  show: boolean;
  onHide: () => void;
  notificacoes: Notificacao[];
  onUpdate: () => void;
  loading: boolean;
}

function NotificacoesOffcanvas({ show, onHide, notificacoes, onUpdate, loading }: OffcanvasProps) {
  const navigate = useNavigate();
  const { mostrarCard } = useToast();
  const { user, setUser } = useAuth();
  
  // Estado para alternar entre "Lista" e "Configurações"
  const [view, setView] = useState<'lista' | 'config'>('lista');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados locais para os switches
  const [prefsApp, setPrefsApp] = useState(user?.notificacoes_app ?? true);
  const [prefsBot, setPrefsBot] = useState(user?.notificacoes_bot ?? true);

  const handleMarcarLida = async (id: number) => {
    await notificacaoService.marcarComoLida(id);
    onUpdate();
  };

  const handleMarcarTodasLidas = async () => {
    await notificacaoService.marcarTodasComoLidas();
    onUpdate();
  };

  const handleNotificacaoClick = (notif: Notificacao) => {
    if (!notif.lida) handleMarcarLida(notif.id);
    if (notif.link_acao) {
      navigate(notif.link_acao);
      onHide();
    }
  };

  const gerarLink = async () => {
    setIsGenerating(true);
    try {
      const { link } = await notificacaoService.gerarLinkTelegram();
      window.open(link, '_blank');
      mostrarCard('Telegram', 'O Telegram será aberto para iniciar o Bot.', 'info');
    } catch (error) {
      mostrarCard('Erro', 'Não foi possível gerar o link do Telegram.', 'erro');
    } finally {
      setIsGenerating(false);
    }
  };

  const salvarConfigs = async () => {
    setIsSaving(true);
    try {
      const resposta = await notificacaoService.salvarPreferencias({
        notificacoes_app: prefsApp,
        notificacoes_bot: prefsBot
      });
      // Atualiza o contexto global do utilizador
      if (user) {
        setUser({ ...user, notificacoes_app: prefsApp, notificacoes_bot: prefsBot });
      }
      mostrarCard('Sucesso', resposta.message || 'Preferências salvas!', 'sucesso');
    } catch (error) {
      mostrarCard('Erro', 'Erro ao salvar configurações.', 'erro');
    } finally {
      setIsSaving(false);
    }
  };

  const desvincularTelegram = async () => {
    setIsSaving(true);
    try {
      await notificacaoService.salvarPreferencias({
        notificacoes_app: prefsApp,
        notificacoes_bot: false,
        desvincular_telegram: true
      });
      setPrefsBot(false);
      mostrarCard('Desvinculado', 'O seu Telegram foi removido do sistema.', 'info');
    } catch (error) {
      mostrarCard('Erro', 'Erro ao desvincular conta.', 'erro');
    } finally {
      setIsSaving(false);
    }
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'OS': return <Tools className="text-primary" />;
      case 'ESTOQUE': return <BoxSeam className="text-warning" />;
      case 'ALERTA': return <ShieldExclamation className="text-danger" />;
      default: return <BellFill className="text-info" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  // Se fechar o Offcanvas, reseta para a view de lista
  const handleClose = () => {
    setView('lista');
    onHide();
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" className="border-0 shadow">
      <Offcanvas.Header closeButton className="bg-light border-bottom">
        {view === 'lista' ? (
          <Offcanvas.Title className="fw-bold text-dark fs-5 d-flex align-items-center w-100 justify-content-between">
            <div className="d-flex align-items-center"><BellFill className="me-2 text-primary" /> Alertas</div>
            <Button variant="link" className="text-secondary p-0 ms-auto me-3" onClick={() => setView('config')} title="Configurações">
              <GearFill size={20} />
            </Button>
          </Offcanvas.Title>
        ) : (
          <Offcanvas.Title className="fw-bold text-dark fs-5 d-flex align-items-center">
            <Button variant="link" className="text-secondary p-0 me-3" onClick={() => setView('lista')}>
              <ArrowLeft size={20} />
            </Button>
            <GearFill className="me-2 text-secondary" /> Configurações
          </Offcanvas.Title>
        )}
      </Offcanvas.Header>
      
      <Offcanvas.Body className="p-0 bg-white">
        
        {/* VIEW: LISTA DE NOTIFICAÇÕES */}
        {view === 'lista' && (
          <>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
               <span className="small fw-bold text-muted text-uppercase">Recentes</span>
               <Button variant="link" size="sm" className="text-decoration-none p-0 fw-medium" onClick={handleMarcarTodasLidas}>
                 <CheckAll size={18} className="me-1" /> Marcar todas lidas
               </Button>
            </div>

            {loading ? (
              <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
            ) : notificacoes.length === 0 ? (
              <div className="text-center p-5 text-muted">
                 <BellFill size={40} className="opacity-25 mb-3" />
                 <p className="fw-medium mb-0">Você não tem novas notificações.</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notificacoes.map(notif => (
                  <ListGroup.Item 
                    key={notif.id} 
                    className={`p-3 border-bottom ${notif.lida ? 'bg-white opacity-75' : 'bg-light item-hover-highlight'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => handleNotificacaoClick(notif)}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div className={`mt-1 bg-white p-2 rounded-circle shadow-sm border`}>
                        {getIcone(notif.tipo)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className={`fw-bold ${notif.lida ? 'text-muted' : 'text-dark'}`}>{notif.titulo}</span>
                          {!notif.lida && <Badge bg="primary" pill style={{ width: '8px', height: '8px', padding: 0 }}></Badge>}
                        </div>
                        <p className="mb-1 small text-secondary lh-sm">{notif.mensagem}</p>
                        
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(notif.data_criacao)}</small>
                          {notif.link_acao && (
                            <span className="text-primary small fw-bold" style={{ fontSize: '0.75rem' }}>
                              Acessar <BoxArrowUpRight className="ms-1" size={12}/>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}

        {/* VIEW: CONFIGURAÇÕES */}
        {view === 'config' && (
          <div className="p-4">
            <h6 className="fw-bold text-dark mb-4 text-uppercase small">Canais de Recebimento</h6>
            
            <Form className="mb-4">
              <Form.Check 
                type="switch"
                id="app-switch"
                label={<span className="fw-medium">Sininho no Sistema (Navegador)</span>}
                checked={prefsApp}
                onChange={(e) => setPrefsApp(e.target.checked)}
                className="mb-3"
              />
              <Form.Check 
                type="switch"
                id="bot-switch"
                label={<span className="fw-medium">Bot do Telegram (Smartphone)</span>}
                checked={prefsBot}
                onChange={(e) => setPrefsBot(e.target.checked)}
              />
            </Form>

            <Button 
              variant="primary" 
              className="w-100 fw-bold mb-4 shadow-sm" 
              onClick={salvarConfigs}
              disabled={isSaving}
            >
              {isSaving ? <Spinner size="sm" /> : '💾 Salvar Preferências'}
            </Button>

            <hr className="text-muted" />

            <div className="mt-4 p-3 bg-light rounded border border-info border-opacity-25 text-center">
              <Telegram className="text-info mb-2" size={40} />
              <h6 className="fw-bold text-dark mb-2">Vincular Conta ao Telegram</h6>
              <p className="small text-muted mb-3">Receba notificações em tempo real diretamente no seu telemóvel.</p>
              
              <Button 
                variant="info" 
                className="w-100 fw-bold text-white shadow-sm mb-2" 
                onClick={gerarLink}
                disabled={isGenerating}
              >
                {isGenerating ? <Spinner size="sm" /> : '🔗 Gerar Link e Abrir Bot'}
              </Button>

              <Button 
                variant="outline-danger" 
                size="sm" 
                className="w-100 fw-medium mt-2" 
                onClick={desvincularTelegram}
                disabled={isSaving}
              >
                Desvincular Conta Atual
              </Button>
            </div>

          </div>
        )}

      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default NotificacoesOffcanvas;