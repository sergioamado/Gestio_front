// src/components/notificacoes/ConfigurarNotificacoesModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Alert, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { BellFill, Telegram, InfoCircleFill } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import * as notificacaoService from '../../services/notificacaoService';
import { useToast } from '../../contexts/ToastContext';

interface ConfigModalProps {
  show: boolean;
  onHide: () => void;
}

function ConfigurarNotificacoesModal({ show, onHide }: ConfigModalProps) {
  const { mostrarCard } = useToast(); // 🚀 INJETADO
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado de Permissão do Navegador
  const [permissaoNavegador, setPermissaoNavegador] = useState<NotificationPermission>('default');

  // Controle Granular Visual (Na interface)
  const [prefsNavegador, setPrefsNavegador] = useState({
    os: true, estoque: true, sistema: true, alertas: true
  });
  
  const [prefsTelegram, setPrefsTelegram] = useState({
    os: true, estoque: false, sistema: false, alertas: true
  });

  useEffect(() => {
    if (show && 'Notification' in window) {
      setPermissaoNavegador(Notification.permission);
      // Aqui pode buscar as prefs salvas no banco e popular os states acima
    }
  }, [show]);

  const solicitarPermissaoNavegador = async () => {
    if (!('Notification' in window)) {
      mostrarCard('Erro', 'Seu navegador não suporta notificações.', 'erro');
      return;
    }
    const permissao = await Notification.requestPermission();
    setPermissaoNavegador(permissao);
    if (permissao === 'granted') {
      new Notification('Gestio', { body: 'Notificações ativadas com sucesso!' });
      mostrarCard('Sucesso', 'Permissão concedida no navegador!', 'sucesso');
    }
  };

  const checarPermissaoNovamente = () => {
    setPermissaoNavegador(Notification.permission);
    if (Notification.permission === 'granted') {
      mostrarCard('Sucesso', 'Permissão reconhecida com sucesso!', 'sucesso');
    }
  };

  const handleSalvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 🚀 CORREÇÃO DO TYPESCRIPT: 
      // O serviço espera um objeto com { notificacoes_app, notificacoes_bot, desvincular_telegram }
      // Vamos assumir que se alguma opção granular estiver "true", a master key fica "true"
      const payload = {
        notificacoes_app: Object.values(prefsNavegador).some(v => v === true),
        notificacoes_bot: Object.values(prefsTelegram).some(v => v === true),
        desvincular_telegram: !telegramId // Se o campo estiver vazio, envia a flag para desvincular
      };

      await notificacaoService.salvarPreferencias(payload);

      // Nota: Se a sua API requer que envie o "telegram_chat_id" para outro endpoint
      // (ex: usuarioService.atualizarPerfil), você deve chamá-lo aqui.

      mostrarCard('Sucesso!', 'As suas preferências de alerta foram salvas.', 'sucesso');
      setTimeout(onHide, 1000);
    } catch (error) {
      mostrarCard('Erro', 'Falha ao salvar as configurações. Tente novamente.', 'erro');
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
                      Não sabe seu ID? Mande um "Oi" para <strong>@userinfobot</strong> no Telegram para descobrir.
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