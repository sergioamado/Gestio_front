// src/components/impressoras/ImpressoraDetailsModal.tsx
import { Modal, ListGroup, Badge, Row, Col } from 'react-bootstrap';
import { PrinterFill, InfoCircleFill } from 'react-bootstrap-icons';
import type { Impressora, ImpressoraDetailsModalProps } from '../../types';



function ImpressoraDetailsModal({ show, onHide, impressora }: ImpressoraDetailsModalProps) {
  if (!impressora) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light border-bottom-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center">
           <InfoCircleFill className="me-2 text-info" /> Detalhes da Impressora
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-3">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
           <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 shadow-sm">
              <PrinterFill size={28} className="text-primary" />
           </div>
           <div>
              <h4 className="fw-bold mb-0 text-dark">{impressora.nome}</h4>
              <p className="text-muted mb-0 fw-medium">{impressora.modelo}</p>
           </div>
        </div>
        
        {/* INFORMAÇÕES TÉCNICAS E DE LOCALIZAÇÃO */}
        <Row className="g-4">
           <Col md={6}>
              <ListGroup className="shadow-sm border-0">
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase">Nº de Série</span>
                  <span className="fw-bold text-dark">{impressora.numero_serie || 'Não informado'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase">Endereço IP</span>
                  <span className="font-monospace fw-bold text-dark">{impressora.ip || 'Não informado'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 border-0">
                  <span className="text-muted small fw-bold text-uppercase">Servidor / Spooler</span>
                  <span className="fw-medium text-dark">{impressora.servidor || 'Não informado'}</span>
                </ListGroup.Item>
              </ListGroup>
           </Col>

           <Col md={6}>
              <ListGroup className="shadow-sm border-0">
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 border-0 border-bottom bg-light border-start border-4 border-primary">
                  <span className="text-muted small fw-bold text-uppercase">Unidade (Setor)</span>
                  <span className="fw-bold text-primary text-end" style={{ maxWidth: '60%' }}>
                    {impressora.unidades_organizacionais?.nome || 'Não informada'}
                  </span>
                </ListGroup.Item>
                
                {/*   LOCALIZAÇÃO  */}
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                  <span className="text-muted small fw-bold text-uppercase">Localização / Sala</span>
                  <span className="fw-medium text-dark text-end" style={{ maxWidth: '60%' }}>
                    {impressora.localizacao || 'Não informada'}
                  </span>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 border-0">
                  <span className="text-muted small fw-bold text-uppercase">Verificação SIPAC</span>
                  <span className="fw-medium text-dark text-end">{impressora.status_verificacao || 'Pendente'}</span>
                </ListGroup.Item>
              </ListGroup>
           </Col>
        </Row>

        {/* RODAPÉ DE STATUS (TAGS) */}
        <div className="d-flex gap-3 mt-4 pt-4 border-top justify-content-center flex-wrap">
            <Badge bg={impressora.is_colorida ? 'info' : 'secondary'} className="px-3 py-2 fs-6 shadow-sm">
              🎨 {impressora.is_colorida ? 'Colorida' : 'Monocromática'}
            </Badge>
            <Badge bg={impressora.politicas_aplicadas ? 'success' : 'secondary'} className="px-3 py-2 fs-6 shadow-sm">
              🛡️ Políticas: {impressora.politicas_aplicadas ? 'Aplicadas' : 'Não Aplicadas'}
            </Badge>
            <Badge bg={impressora.ativo ? 'primary' : 'danger'} className="px-3 py-2 fs-6 shadow-sm">
              {impressora.ativo !== false ? '✅ Ativa' : '❌ Inativa'}
            </Badge>
        </div>

      </Modal.Body>
    </Modal>
  );
}

export default ImpressoraDetailsModal;