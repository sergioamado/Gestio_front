// src/components/impressoras/ImpressoraDetailsModal.tsx
import { Modal, ListGroup, Badge } from 'react-bootstrap';
import type { Impressora } from '../../types';

interface ImpressoraDetailsModalProps {
  show: boolean;
  onHide: () => void;
  impressora: Impressora | null;
}

function ImpressoraDetailsModal({ show, onHide, impressora }: ImpressoraDetailsModalProps) {
  if (!impressora) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Impressora</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{impressora.nome}</h4>
        <p className="text-muted">{impressora.modelo}</p>
        <hr />
        <ListGroup variant="flush">
          {/* ... (outros ListGroup.Item) ... */}
          <ListGroup.Item><strong>Servidor:</strong> {impressora.servidor || 'Não informado'}</ListGroup.Item>
          <ListGroup.Item><strong>Unidade Organizacional:</strong> {impressora.unidades_organizacionais?.nome || 'Não informada'}</ListGroup.Item>
          
          {/* <<< LINHA ADICIONADA AQUI >>> */}
          <ListGroup.Item>
            <strong>Tipo:</strong>{' '}
            <Badge bg={impressora.is_colorida ? 'info' : 'secondary'}>
              {impressora.is_colorida ? 'Colorida' : 'Monocromática'}
            </Badge>
          </ListGroup.Item>

          <ListGroup.Item>
            <strong>Políticas Aplicadas:</strong>{' '}
            <Badge bg={impressora.politicas_aplicadas ? 'success' : 'secondary'}>
              {impressora.politicas_aplicadas ? 'Sim' : 'Não'}
            </Badge>
          </ListGroup.Item>
           <ListGroup.Item><strong>Status da Verificação:</strong> {impressora.status_verificacao}</ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}

export default ImpressoraDetailsModal;