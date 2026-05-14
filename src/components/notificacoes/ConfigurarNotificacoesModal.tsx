// src/components/notificacoes/ConfigurarNotificacoesModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Alert, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { BellFill, Telegram, InfoCircleFill } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import * as notificacaoService from '../../services/notificacaoService';

interface ConfigModalProps {
  show: boolean;
  onHide: () => void;
}

function ConfigurarNotificacoesModal({ show, onHide }: ConfigModalProps) {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: string, texto: string } | null>(null);
  
  // Estado de Permissão do Navegador (default, granted, denied)
  const [permissaoNavegador, setPermissaoNavegador] = useState<NotificationPermission>('default');

  // Controle Granular (Quais alertas vão pra onde)
  const [prefsNavegador, setPrefsNavegador] = useState({
    os: true, estoque: true, sistema: true, alertas: true
  });
  
  const [prefsTelegram, setPrefsTelegram] = useState({
    os: true, estoque: false, sistema: false, alertas: true
  });

  // Checa a permissão real do navegador sempre que o modal abre
  useEffect(() => {
    if (show && 'Notification' in window) {
      setPermissaoNavegador(Notification.permission);
      setMensagem(null);
      // Aqui futuramente você pode buscar as prefs salvas no banco: 
      // const prefs = await api.get('/usuarios/preferencias'); setPrefs...
    }
  }, [show]);

  const solicitarPermissaoNavegador = async () => {
    if (!('Notification' in window)) {
      setMensagem({ tipo: 'danger', texto: 'Seu navegador não suporta notificações.' });
      return;
    }
    const permissao = await Notification.requestPermission();
    setPermissaoNavegador(permissao);
    if (permissao === 'granted') {
      new Notification('COSUP+', { body: 'Notificações ativadas com sucesso!' });
    }
  };

  const checarPermissaoNovamente = () => {
    setPermissaoNavegador(Notification.permission);
    if (Notification.permission === 'granted') {
      setMensagem({ tipo: 'success', texto: 'Permissão reconhecida com sucesso!' });
    }
  };

  const handleSalvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);
    try {
      await notificacaoService.salvarPreferencias({
        telegram_chat_id: telegramId,
        prefs_navegador: prefsNavegador,
        prefs_telegram: prefsTelegram
      });
      setMensagem({ tipo: 'success', texto: 'Preferências salvas com sucesso!' });
      setTimeout(onHide, 2000);
    } catch (error) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao salvar as configurações.' });
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
      <Modal.Header closeButton className="border-0 bg-light">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center">
          ⚙️ Central de Preferências de Alertas
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSalvarConfiguracoes}>
        <Modal.Body className="p-4 bg-white">
          {mensagem && <Alert variant={mensagem.tipo} className="border-0 shadow-sm py-2">{mensagem.texto}</Alert>}

          <Row className="g-4">
            {/* LADO ESQUERDO: NAVEGADOR */}
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-sm bg-light">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <BellFill size={32} className="text-warning me-3" />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">No Navegador (Push)</h6>
                      <small className="text-muted">Avisos saltam na tela do PC.</small>
                    </div>
                  </div>

                  {/* Lógica Inteligente de Permissão do Navegador */}
                  <div className="mb-4">
                    {permissaoNavegador === 'granted' ? (
                      <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm mb-3">✅ Permissão Concedida</Badge>
                    ) : permissaoNavegador === 'denied' ? (
                      <Alert variant="danger" className="border-0 shadow-sm py-2 small">
                        <InfoCircleFill className="me-2" />
                        <strong>Bloqueado!</strong> Para ativar, clique no ícone de <strong>Cadeado 🔒</strong> na barra de endereços do seu navegador, permita as Notificações, e depois clique no botão abaixo.
                        <div className="mt-2 text-center">
                          <Button variant="outline-danger" size="sm" onClick={checarPermissaoNovamente}>
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
                  <div className={`p-3 bg-white rounded border ${permissaoNavegador !== 'granted' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h6 className="fw-bold text-secondary small text-uppercase mb-3">Quero receber alertas sobre:</h6>
                    <Form.Check type="switch" id="nav-os" label="Atualizações de OS (Status, Aprovações)" checked={prefsNavegador.os} onChange={(e) => handleToggle('navegador', 'os', e.target.checked)} className="mb-2 fw-medium" />
                    <Form.Check type="switch" id="nav-estoque" label="Baixo Estoque / Reposições" checked={prefsNavegador.estoque} onChange={(e) => handleToggle('navegador', 'estoque', e.target.checked)} className="mb-2 fw-medium" />
                    <Form.Check type="switch" id="nav-alertas" label="Alertas Críticos (Defeitos, Urgências)" checked={prefsNavegador.alertas} onChange={(e) => handleToggle('navegador', 'alertas', e.target.checked)} className="mb-2 fw-medium" />
                    <Form.Check type="switch" id="nav-sis" label="Avisos do Sistema / Admin" checked={prefsNavegador.sistema} onChange={(e) => handleToggle('navegador', 'sistema', e.target.checked)} className="fw-medium" />
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
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-secondary">Seu Telegram Chat ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ex: 123456789" 
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      className="border-0 shadow-sm bg-white"
                    />
                    <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Não sabe seu ID? Mande um "Oi" para <strong>@userinfobot</strong> no Telegram para descobrir.
                    </Form.Text>
                  </Form.Group>

                  {/* Toggles Granulares */}
                  <div className={`p-3 bg-white rounded border ${!telegramId ? 'opacity-50' : ''}`}>
                    <h6 className="fw-bold text-secondary small text-uppercase mb-3">Quero receber mensagens sobre:</h6>
                    <Form.Check type="switch" id="tg-os" label="Atualizações de OS" checked={prefsTelegram.os} onChange={(e) => handleToggle('telegram', 'os', e.target.checked)} className="mb-2 fw-medium" disabled={!telegramId} />
                    <Form.Check type="switch" id="tg-estoque" label="Baixo Estoque / Reposições" checked={prefsTelegram.estoque} onChange={(e) => handleToggle('telegram', 'estoque', e.target.checked)} className="mb-2 fw-medium" disabled={!telegramId} />
                    <Form.Check type="switch" id="tg-alertas" label="Alertas Críticos (Urgências)" checked={prefsTelegram.alertas} onChange={(e) => handleToggle('telegram', 'alertas', e.target.checked)} className="mb-2 fw-medium" disabled={!telegramId} />
                    <Form.Check type="switch" id="tg-sis" label="Avisos do Sistema" checked={prefsTelegram.sistema} onChange={(e) => handleToggle('telegram', 'sistema', e.target.checked)} className="fw-medium" disabled={!telegramId} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="outline-secondary" onClick={onHide} className="fw-bold border-0">Cancelar</Button>
          <PrimaryButton type="submit" isLoading={loading} className="px-4">
            💾 Salvar Preferências
          </PrimaryButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ConfigurarNotificacoesModal;