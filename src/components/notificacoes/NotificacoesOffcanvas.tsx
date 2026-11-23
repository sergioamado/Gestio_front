// src/components/notificacoes/NotificacoesOffcanvas.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Offcanvas, ListGroup, Badge, Button, Spinner, Form } from 'react-bootstrap';
import { CheckAll, BoxSeam, Tools, BellFill, ShieldExclamation, BoxArrowUpRight, GearFill, Telegram, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import type { Notificacao } from '../../types';
import * as notificacaoService from '../../services/notificacaoService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { socket } from '../../services/socket'; //  Antena de Rádio!
import type { OffcanvasProps } from '../../types/notificacao';
import { textoSemMarcacao } from '../../utils/textoNotificacao';



function NotificacoesOffcanvas({ show, onHide, notificacoes, onUpdate, loading }: OffcanvasProps) {
  const navigate = useNavigate();
  const { mostrarCard } = useToast();
  const { user, setUser } = useAuth();
  
  const [view, setView] = useState<'lista' | 'config'>('lista');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [prefsApp, setPrefsApp] = useState(user?.notificacoes_app ?? true);
  const [prefsBot, setPrefsBot] = useState(user?.notificacoes_bot ?? true);

  // ---------- Telegram: situação real (lida do servidor) ----------
  const [statusTg, setStatusTg] = useState<notificacaoService.StatusTelegram | null>(null);
  const [aguardandoVinculo, setAguardandoVinculo] = useState(false);
  const [linkManual, setLinkManual] = useState<string | null>(null);
  const esperaRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const atualizarStatusTg = useCallback(async () => {
    try {
      const st = await notificacaoService.getStatusTelegram();
      setStatusTg(st);
      setPrefsBot(st.notificacoes_bot);
      return st;
    } catch {
      return null;
    }
  }, []);

  const pararEspera = useCallback(() => {
    if (esperaRef.current) clearInterval(esperaRef.current);
    esperaRef.current = null;
    setAguardandoVinculo(false);
  }, []);

  const confirmarVinculo = useCallback(async () => {
    const st = await atualizarStatusTg();
    if (st?.vinculado) {
      pararEspera();
      setLinkManual(null);
      if (user) setUser({ ...user, telegram_chat_id: st.telegram_chat_id, notificacoes_bot: st.notificacoes_bot });
      mostrarCard('Telegram Vinculado', 'Pronto! Você passará a receber os alertas no Telegram.', 'sucesso');
    }
  }, [atualizarStatusTg, pararEspera, user, setUser, mostrarCard]);

  // Ao abrir as configurações, busca a situação real
  useEffect(() => {
    if (show && view === 'config') atualizarStatusTg();
  }, [show, view, atualizarStatusTg]);

  // O servidor avisa pelo socket quando o bot concluir a vinculação
  useEffect(() => {
    if (!aguardandoVinculo) return;
    socket.on('telegram_vinculado', confirmarVinculo);
    return () => { socket.off('telegram_vinculado', confirmarVinculo); };
  }, [aguardandoVinculo, confirmarVinculo]);

  useEffect(() => pararEspera, [pararEspera]);

  
  //  MOTOR DE TEMPO REAL NO PAINEL LATERAL
  
  useEffect(() => {
    if (!user) return;

    // Quando o servidor gritar uma nova notificação, mandamos atualizar a lista e mostramos o card!
    // Só recarrega a lista do sininho. O card é mostrado pelo NotificationRadar
    // (antes os dois mostravam card e cada notificação aparecia duas vezes).
    const lidarComNovaNotificacao = () => {
      onUpdate();
    };

    socket.on('nova_notificacao', lidarComNovaNotificacao);

    return () => {
      socket.off('nova_notificacao', lidarComNovaNotificacao);
    };
  }, [user, onUpdate]);
  // ==========================================================================

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
    // Abre a aba já no clique: se abrir só depois da resposta do servidor,
    // o navegador bloqueia como pop-up.
    const janela = window.open('about:blank', '_blank');
    setIsGenerating(true);
    try {
      const { link } = await notificacaoService.gerarLinkTelegram();
      if (janela) {
        janela.location.href = link;
      } else {
        setLinkManual(link); // pop-up bloqueado: mostra o link para clicar
      }
      mostrarCard('Telegram', 'No Telegram, toque em "Iniciar" (Start) para concluir a vinculação.', 'info', 8000);

      // Aguarda a confirmação (socket) e, por garantia, consulta a cada 4 s por até 3 minutos.
      pararEspera();
      setAguardandoVinculo(true);
      const inicio = Date.now();
      esperaRef.current = setInterval(() => {
        if (Date.now() - inicio > 3 * 60 * 1000) {
          pararEspera();
          return;
        }
        confirmarVinculo();
      }, 4000);
    } catch (e: any) {
      janela?.close();
      mostrarCard('Erro', e.response?.data?.message || 'Não foi possível gerar o link do Telegram.', 'erro');
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
      if (user) {
        setUser({ ...user, notificacoes_app: prefsApp, notificacoes_bot: prefsBot });
      }
      mostrarCard('Sucesso', resposta.message || 'Preferências salvas!', 'sucesso');
    } catch {
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
      await atualizarStatusTg();
      if (user) setUser({ ...user, telegram_chat_id: null, notificacoes_bot: false });
      mostrarCard('Desvinculado', 'O seu Telegram foi removido do sistema.', 'info');
    } catch {
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
                          <span className={`fw-bold ${notif.lida ? 'text-muted' : 'text-dark'}`}>{textoSemMarcacao(notif.titulo)}</span>
                          {!notif.lida && <Badge bg="primary" pill style={{ width: '8px', height: '8px', padding: 0 }}></Badge>}
                        </div>
                        <p className="mb-1 small text-secondary lh-sm" style={{ whiteSpace: 'pre-line' }}>{textoSemMarcacao(notif.mensagem)}</p>
                        
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(notif.data_criacao)}</small>
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
              <h6 className="fw-bold text-dark mb-2">Telegram</h6>
              {statusTg === null ? (
                <Spinner size="sm" className="mb-3" />
              ) : !statusTg.bot_ativo ? (
                <p className="small text-danger mb-3">O bot do Telegram não está ativo no servidor. Avise o administrador.</p>
              ) : statusTg.vinculado ? (
                <p className="small mb-3"><Badge bg="success">✅ Conta vinculada</Badge></p>
              ) : (
                <p className="small text-muted mb-3">
                  <Badge bg="secondary" className="mb-2">Não vinculado</Badge><br />
                  Receba os alertas no celular. Gere o link e toque em <strong>Iniciar</strong> no bot.
                </p>
              )}

              {statusTg?.bot_link && (
                <a
                  href={statusTg.bot_link}
                  target="_blank"
                  rel="noreferrer"
                  className="d-inline-flex align-items-center gap-1 small fw-bold text-decoration-none mb-3"
                  style={{ color: '#0088cc' }}
                >
                  <Telegram /> Abrir @{statusTg.bot_username} no Telegram <BoxArrowUpRight size={11} />
                </a>
              )}

              {statusTg?.bot_ativo && !statusTg.vinculado && (
                <Button 
                  variant="info" 
                  className="w-100 fw-bold text-white shadow-sm mb-2" 
                  onClick={gerarLink}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Spinner size="sm" /> : '🔗 Gerar Link e Abrir Bot'}
                </Button>
              )}

              {linkManual && (
                <a href={linkManual} target="_blank" rel="noreferrer" className="btn btn-outline-info btn-sm w-100 mb-2">
                  O Telegram não abriu? Clique aqui
                </a>
              )}

              {aguardandoVinculo && (
                <div className="small text-muted mb-2">
                  <Spinner size="sm" className="me-2" />Aguardando você tocar em "Iniciar" no Telegram…
                </div>
              )}

              {statusTg?.vinculado && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="w-100 fw-medium mt-2" 
                  onClick={desvincularTelegram}
                  disabled={isSaving}
                >
                  Desvincular Conta Atual
                </Button>
              )}
            </div>

          </div>
        )}

      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default NotificacoesOffcanvas;