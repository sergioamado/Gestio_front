// src/components/atendimentos/AtendimentoDetailsModal.tsx
import { Modal, Row, Col, Badge, Card } from 'react-bootstrap';
import { Printer, GeoAlt, PersonBadge, CalendarEvent, Hash, Tools, Check2All, ShieldCheck } from 'react-bootstrap-icons';
import type { AtendimentoImpressora } from '../../types';
import { statusMap } from './AtendimentosTable';

interface AtendimentoDetailsModalProps {
  show: boolean;
  onHide: () => void;
  atendimento: AtendimentoImpressora | null;
}

const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Não informado';
    return new Intl.DateTimeFormat('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
};

function AtendimentoDetailsModal({ show, onHide, atendimento }: AtendimentoDetailsModalProps) {
  if (!atendimento) return null;

  const statusConfig = statusMap[atendimento.status] || { variant: 'secondary', text: atendimento.status };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light border-bottom-0 pb-4">
        <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-3">
          <span className="fs-5">📋 Detalhes do Chamado</span>
          <Badge 
            className={`bg-${statusConfig.variant} bg-opacity-10 text-${statusConfig.variant === 'warning' ? 'dark' : statusConfig.variant} border border-${statusConfig.variant} px-3 py-2 rounded-pill shadow-sm fs-6`}
          >
            {statusConfig.text}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4 pt-0 bg-light">
        
        {/* CARTOES DE TOPO (Métricas Rápidas) */}
        <Row className="g-3 mb-4 mt-1">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 text-center">
                <div className="text-muted small fw-bold text-uppercase mb-1"><Hash className="me-1 mb-1" /> Nº GLPI</div>
                <div className="fs-5 fw-bold text-primary">{atendimento.numero_glpi}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 text-center">
                <div className="text-muted small fw-bold text-uppercase mb-1"><CalendarEvent className="me-1 mb-1" /> Abertura</div>
                <div className="fw-bold text-dark">{formatDate(atendimento.data)}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 text-center">
                <div className="text-muted small fw-bold text-uppercase mb-1"><PersonBadge className="me-1 mb-1" /> Técnico (COSUP)</div>
                <div className="fw-bold text-dark text-truncate" title={atendimento.tecnico_responsavel?.nome_completo}>
                  {atendimento.tecnico_responsavel?.nome_completo || 'Não Atribuído'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* DETALHES DA IMPRESSORA */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
            <h6 className="fw-bold text-secondary text-uppercase mb-0"><Printer className="me-2 mb-1" /> Equipamento Afetado</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col sm={6} className="mb-2 mb-sm-0">
                <div className="text-muted small">Nome / Modelo</div>
                <div className="fw-bold text-dark fs-6">{atendimento.impressora?.nome} <span className="text-muted fw-normal">({atendimento.impressora?.modelo})</span></div>
              </Col>
              <Col sm={6}>
                <div className="text-muted small"><GeoAlt className="me-1" /> Localização / Setor</div>
                <div className="fw-bold text-dark">{atendimento.impressora?.localizacao || 'Não especificada'}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* PARECERES TÉCNICOS */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100 border-start border-4 border-warning">
              <Card.Body className="p-3">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
                  <Tools className="me-2 text-warning" /> Parecer Técnico Inicial
                </h6>
                <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {atendimento.parecer_tecnico || <span className="fst-italic">Nenhum parecer técnico inicial registado.</span>}
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm h-100 border-start border-4 border-success">
              <Card.Body className="p-3">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
                  <Check2All className="me-2 text-success" /> Parecer Final (Assistência)
                </h6>
                <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {atendimento.parecer_final_assistencia || <span className="fst-italic">Nenhum parecer final registado.</span>}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Modal.Body>
    </Modal>
  );
}

export default AtendimentoDetailsModal;