// src/components/atendimentos/AtendimentoDetailsModal.tsx
import { Modal, ListGroup, Row, Col, Badge } from 'react-bootstrap';
import { Tools, InfoCircleFill } from 'react-bootstrap-icons';
import type { AtendimentoImpressora } from '../../types';

interface AtendimentoDetailsModalProps {
  show: boolean;
  onHide: () => void;
  atendimento: AtendimentoImpressora | null;
}

function AtendimentoDetailsModal({ show, onHide, atendimento }: AtendimentoDetailsModalProps) {
  if (!atendimento) return null;

  // 🚀 Função de data ajustada para aceitar strings ou objetos Date
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return 'Não informada';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light border-bottom-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center">
           <InfoCircleFill className="me-2 text-info" /> Detalhes do Atendimento #{atendimento.id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-3">
        
        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
           <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 shadow-sm">
              <Tools size={28} className="text-primary" />
           </div>
           <div>
              <h4 className="fw-bold mb-0 text-dark">OS GLPI: {atendimento.numero_glpi}</h4>
              <p className="text-muted mb-0 fw-medium">Técnico Responsável: {atendimento.tecnico?.nome_completo}</p>
           </div>
        </div>

        <Row className="g-4 mb-4">
           <Col md={6}>
              <h6 className="fw-bold text-secondary text-uppercase small mb-2">Dados da Impressora</h6>
              <ListGroup className="shadow-sm border-0">
                <ListGroup.Item className="border-0 border-bottom py-2">
                  <strong className="small">Impressora:</strong> {atendimento.impressora?.nome} ({atendimento.impressora?.modelo})
                </ListGroup.Item>
                {/* 🚀 CORREÇÃO: Força o TypeScript a aceitar a unidade_dona do backend */}
                <ListGroup.Item className="border-0 border-bottom py-2 bg-light border-start border-primary border-4">
                  <strong className="small">Setor/Unidade:</strong> <span className="text-primary fw-bold">{(atendimento as any).unidade_dona || atendimento.unidades_organizacionais?.nome || 'Não informada'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="border-0 border-bottom py-2">
                  <strong className="small">Localização/Sala:</strong> {atendimento.impressora?.localizacao || 'Não informada'}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 py-2">
                  <strong className="small">Setor Visitado?</strong> {atendimento.setor_visitado ? '✅ Sim' : '⏳ Não'}
                </ListGroup.Item>
              </ListGroup>
           </Col>

           <Col md={6}>
              <h6 className="fw-bold text-secondary text-uppercase small mb-2">Evolução do Chamado</h6>
              <ListGroup className="shadow-sm border-0">
                <ListGroup.Item className="border-0 border-bottom py-2">
                  <strong className="small">Status Atual:</strong> <Badge bg="secondary">{atendimento.status}</Badge>
                </ListGroup.Item>
                {/* 🚀 CORREÇÃO: "data_abertura" alterado para "data" */}
                <ListGroup.Item className="border-0 border-bottom py-2">
                  <strong className="small">Abertura:</strong> {formatDate(atendimento.data)}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 border-bottom py-2">
                  <strong className="small">Data da Visita:</strong> {formatDate(atendimento.data_visita)}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 py-2">
                  <strong className="small">Concluído?</strong> {atendimento.assistencia_concluiu ? '✅ Sim' : '❌ Não'}
                </ListGroup.Item>
              </ListGroup>
           </Col>
        </Row>

        {atendimento.necessita_pecas && (
          <div className="mb-4 p-3 bg-danger bg-opacity-10 rounded border border-danger shadow-sm">
             <h6 className="fw-bold text-danger text-uppercase small mb-2">📦 Necessidade de Peças</h6>
             <p className="small mb-0 text-dark fw-medium">{atendimento.descricao_pecas || 'Sem descrição'}</p>
          </div>
        )}

        {atendimento.parecer_tecnico && (
          <div className="mb-4 p-3 bg-light rounded border shadow-sm">
             <h6 className="fw-bold text-secondary text-uppercase small mb-2">📝 Parecer Técnico</h6>
             <p className="small mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{atendimento.parecer_tecnico}</p>
          </div>
        )}

        {atendimento.necessita_backup && (
          <div className="mb-4 p-3 bg-warning bg-opacity-10 rounded border border-warning shadow-sm">
             <h6 className="fw-bold text-dark text-uppercase small mb-2">🖨️ Equipamento de Backup Fornecido</h6>
             <Row className="small">
               <Col md={6}><strong className="text-muted">Nome:</strong> {atendimento.backup_impressora_nome}</Col>
               <Col md={6}><strong className="text-muted">Série:</strong> {atendimento.backup_numero_serie}</Col>
               <Col md={6}><strong className="text-muted">Fornecido Em:</strong> {formatDate(atendimento.backup_data_disponibilizacao)}</Col>
               <Col md={6}><strong className="text-muted">Retirado Em:</strong> {formatDate(atendimento.backup_data_retirada)}</Col>
             </Row>
          </div>
        )}

      </Modal.Body>
    </Modal>
  );
}

export default AtendimentoDetailsModal;