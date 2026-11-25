// src/components/notificacoes/ConfigurarNotificacoesModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Alert, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { BellFill, Telegram, InfoCircleFill } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import * as notificacaoService from '../../services/notificacaoService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth'; 
import { navegadorSuportaNotificacao, permissaoNotificacao, pedirPermissaoNotificacao } from '../../utils/notificacaoNavegador';

interface ConfigModalProps {
  show: boolean;
  onHide: () => void;
}

function ConfigurarNotificacoesModal({ show, onHide }: ConfigModalProps) {
  const { mostrarCard } = useToast(); 
  const { user, setUser } = useAuth(); // 🚀 Essencial
  
  // Preenche o ID com o que já vier do banco (se existir)
  const [telegramId, setTelegramId] = useState(user?.telegram_chat_id || '');
  // Telegram que está de fato vinculado no servidor (o usuário salvo no navegador pode estar desatualizado)
  const [chatIdServidor, setChatIdServidor] = useState<string | null>(null);
  const [bot, setBot] = useState<{ username: string; link: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [permissaoNavegador, setPermissaoNavegador] = useState<NotificationPermission>('default');

  const [prefsNavegador, setPrefsNavegador] = useState({
    os: true, estoque: true, sistema: true, alertas: true
  });
  
  const [prefsTelegram, setPrefsTelegram] = useState({
    os: user?.notificacoes_bot ?? false, 
    estoque: user?.notificacoes_bot ?? false, 
    sistema: user?.notificacoes_bot ?? false, 
    alertas: user?.notificacoes_bot ?? false
  });

  useEffect(() => {
    if (show) {
      const perm = permissaoNotificacao();
      if (perm !== 'indisponivel') setPermissaoNavegador(perm);
      // Busca no servidor a vinculação real (pode ter sido feita pelo bot depois do login)
      notificacaoService.getStatusTelegram()
        .then((st) => {
          setBot(st.bot_username && st.bot_link ? { username: st.bot_username, link: st.bot_link } : null);
          setChatIdServidor(st.telegram_chat_id);
          setTelegramId(st.telegram_chat_id || '');
          const bot = st.notificacoes_bot;
          setPrefsTelegram({ os: bot, estoque: bot, sistema: bot, alertas: bot });
          // Valor real do servidor para o sininho (o do navegador pode estar velho)
          const app = st.notificacoes_app;
          setPrefsNavegador({ os: app, estoque: app, sistema: app, alertas: app });
        })
        .catch(() => setTelegramId(user?.telegram_chat_id || ''));
      
      // Ajusta os botões "mestres" com base no perfil logado
      if (user) {
         const boolApp = user.notificacoes_app ?? true;
         setPrefsNavegador({ os: boolApp, estoque: boolApp, sistema: boolApp, alertas: boolApp });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const solicitarPermissaoNavegador = async () => {
    if (!navegadorSuportaNotificacao()) {
      mostrarCard('Atenção', 'Este navegador não mostra avisos do sistema operacional. Os avisos continuam aparecendo dentro do COSUP+ e no Telegram.', 'alerta');
      return;
    }
    const permissao = await pedirPermissaoNotificacao();
    if (permissao === 'indisponivel') return;
    setPermissaoNavegador(permissao);
    if (permissao === 'granted') {
      mostrarCard('Sucesso', 'Permissão concedida no navegador!', 'sucesso');
    }
  };

  const checarPermissaoNovamente = () => {
    const perm = permissaoNotificacao();
    if (perm === 'indisponivel') return;
    setPermissaoNavegador(perm);
    if (perm === 'granted') {
      mostrarCard('Sucesso', 'Permissão reconhecida com sucesso!', 'sucesso');
    }
  };

  const handleSalvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isAppActive = Object.values(prefsNavegador).some(v => v === true);
      const isBotActive = Object.values(prefsTelegram).some(v => v === true);
      // Só desvincula se havia um Telegram vinculado e o usuário apagou o ID de propósito.
      // (Antes, qualquer "Salvar" com o campo vazio apagava a vinculação feita pelo bot.)
      const isDesvincular = !!chatIdServidor && !telegramId.trim();
      
      await notificacaoService.salvarPreferencias({
        notificacoes_app: isAppActive,
        notificacoes_bot: isBotActive,
        desvincular_telegram: isDesvincular,
        ...(telegramId.trim() ? { telegram_chat_id: telegramId.trim() } : {})
      });
      setChatIdServidor(isDesvincular ? null : telegramId.trim() || chatIdServidor);

      // (Sessão atual) para refletir na hora sem precisar F5
      if (user) {
        setUser({
          ...user,
          notificacoes_app: isAppActive,
          notificacoes_bot: isBotActive,
          telegram_chat_id: isDesvincular ? null : telegramId.trim() || chatIdServidor
        });
      }

      mostrarCard('Sucesso!', 'As suas preferências de alerta foram salvas.', 'sucesso');
      setTimeout(onHide, 1000); // Aguarda o Toast piscar antes de fechar o Modal
    } catch (error: any) {
      mostrarCard('Erro', error.response?.data?.message || 'Falha ao salvar. Verifique se o seu Telegram ID está correto.', 'erro', 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (plataforma: 'navegador' | 'telegram', chave: string, valor: boolean) => {
    if (plataforma === 'navegador') {
      setPrefsNavegador(prev => ({ ...prev, [chave]: valor }));
    } else {
      setPrefsTelegram(prev => ({ ...prev, [chave]: valor }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton className="border-0 bg-light pb-4">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center">
          ⚙️ Central de Preferências de Alertas
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSalvarConfiguracoes}>
        <Modal.Body className="p-4 pt-0 bg-light">
          <Row className="g-4">
            
            {/* LADO ESQUERDO: NAVEGADOR */}
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-sm bg-white">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <BellFill size={32} className="text-warning me-3" />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">No Navegador (Push)</h6>
                      <small className="text-muted">Avisos saltam na tela do PC.</small>
                    </div>
                  </div>

                  <div className="mb-4">
                    {permissaoNavegador === 'granted' ? (
                      <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm mb-3">✅ Permissão Concedida</Badge>
                    ) : permissaoNavegador === 'denied' ? (
                      <Alert variant="danger" className="border-0 shadow-sm py-2 small">
                        <InfoCircleFill className="me-2" />
                        <strong>Bloqueado!</strong> Para ativar, clique no ícone de <strong>Cadeado 🔒</strong> na barra de endereços do seu navegador, permita as Notificações, e depois clique no botão abaixo.
                        <div className="mt-2 text-center">
                          <Button variant="outline-danger" size="sm" onClick={checarPermissaoNovamente} className="fw-bold">
                            Já permiti no cadeado, verificar!
                          </Button>
                        </div>
                      </Alert>
                    ) : (
                      <div className="mb-3">
                        <Button variant="primary" size="sm" className="fw-bold px-3 shadow-sm rounded-pill" onClick={solicitarPermissaoNavegador}>
                          Permitir Notificações no PC
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Toggles Granulares */}
                  <div className={`p-3 bg-light rounded border border-light-subtle ${permissaoNavegador !== 'granted' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h6 className="fw-bold text-secondary small text-uppercase mb-3">Quero receber alertas sobre:</h6>
                    <Form.Check type="switch" id="nav-os" label={<span className="fw-medium text-dark ms-1">Atualizações de OS</span>} checked={prefsNavegador.os} onChange={(e) => handleToggle('navegador', 'os', e.target.checked)} className="mb-2" />
                    <Form.Check type="switch" id="nav-estoque" label={<span className="fw-medium text-dark ms-1">Baixo Estoque / Reposições</span>} checked={prefsNavegador.estoque} onChange={(e) => handleToggle('navegador', 'estoque', e.target.checked)} className="mb-2" />
                    <Form.Check type="switch" id="nav-alertas" label={<span className="fw-medium text-dark ms-1">Alertas Críticos (Defeitos)</span>} checked={prefsNavegador.alertas} onChange={(e) => handleToggle('navegador', 'alertas', e.target.checked)} className="mb-2" />
                    <Form.Check type="switch" id="nav-sis" label={<span className="fw-medium text-dark ms-1">Avisos do Sistema</span>} checked={prefsNavegador.sistema} onChange={(e) => handleToggle('navegador', 'sistema', e.target.checked)} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* LADO DIREITO: TELEGRAM */}
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#f0f9ff' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <Telegram size={32} style={{ color: '#0088cc' }} className="me-3" />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">No Celular (Telegram Bot)</h6>
                      <small className="text-muted">Mensagens diretas no seu App.</small>
                    </div>
                    {bot && (
                      <a
                        href={bot.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm text-white fw-bold ms-auto shadow-sm"
                        style={{ backgroundColor: '#0088cc' }}
                      >
                        <Telegram className="me-1" /> Abrir @{bot.username}
                      </a>
                    )}
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-secondary">Seu Telegram Chat ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ex: 123456789" 
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      className="border-0 shadow-sm bg-white py-2"
                    />
                    <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Não sabe seu ID?{' '}
                      {bot ? (
                        <>Abra o <a href={bot.link} target="_blank" rel="noreferrer" className="fw-bold">@{bot.username}</a> e toque em <strong>Iniciar</strong>: ele responde com o seu ID.</>
                      ) : (
                        <>Abra o bot do sistema no Telegram e toque em <strong>Iniciar</strong>: ele responde com o seu ID.</>
                      )}
                    </Form.Text>
                  </Form.Group>

                  {/* Toggles Granulares */}
                  <div className={`p-3 bg-white rounded border border-info border-opacity-25 shadow-sm ${!telegramId ? 'opacity-50' : ''}`}>
                    <h6 className="fw-bold text-secondary small text-uppercase mb-3">Quero receber mensagens sobre:</h6>
                    <Form.Check type="switch" id="tg-os" label={<span className="fw-medium text-dark ms-1">Atualizações de OS</span>} checked={prefsTelegram.os} onChange={(e) => handleToggle('telegram', 'os', e.target.checked)} className="mb-2" disabled={!telegramId} />
                    <Form.Check type="switch" id="tg-estoque" label={<span className="fw-medium text-dark ms-1">Baixo Estoque / Reposições</span>} checked={prefsTelegram.estoque} onChange={(e) => handleToggle('telegram', 'estoque', e.target.checked)} className="mb-2" disabled={!telegramId} />
                    <Form.Check type="switch" id="tg-alertas" label={<span className="fw-medium text-dark ms-1">Alertas Críticos (Urgências)</span>} checked={prefsTelegram.alertas} onChange={(e) => handleToggle('telegram', 'alertas', e.target.checked)} className="mb-2" disabled={!telegramId} />
                    <Form.Check type="switch" id="tg-sis" label={<span className="fw-medium text-dark ms-1">Avisos do Sistema</span>} checked={prefsTelegram.sistema} onChange={(e) => handleToggle('telegram', 'sistema', e.target.checked)} disabled={!telegramId} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0 pt-0">
          <Button variant="outline-secondary" onClick={onHide} className="fw-bold border-0 px-4">Cancelar</Button>
          <PrimaryButton type="submit" isLoading={loading} className="px-4 fw-bold shadow-sm">
            💾 Salvar Preferências
          </PrimaryButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ConfigurarNotificacoesModal;