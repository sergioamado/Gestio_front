// src/components/itens/ItemDetailsModal.tsx
import { Modal, ListGroup, Badge } from 'react-bootstrap';
import type { Item } from '../../types';

interface ItemDetailsModalProps {
  show: boolean;
  onHide: () => void;
  item: Item | null;
}

function ItemDetailsModal({ show, onHide, item }: ItemDetailsModalProps) {
  if (!item) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{item.descricao}</h4>
        <hr />
        <ListGroup variant="flush">
          <ListGroup.Item><strong>Código SIPAC:</strong> {item.codigo_sipac || 'Não informado'}</ListGroup.Item>
          <ListGroup.Item><strong>Pregão:</strong> {item.pregao || 'Não informado'}</ListGroup.Item>
          <ListGroup.Item><strong>Tipo:</strong> {item.tipo || 'Não informado'}</ListGroup.Item>
          <ListGroup.Item><strong>Localização:</strong> {item.localizacao || 'Não informado'}</ListGroup.Item>
          <ListGroup.Item><strong>Unidade de Medida:</strong> {item.unidade_medida}</ListGroup.Item>
          <ListGroup.Item><strong>Preço Unitário:</strong> R$ {Number(item.preco_unitario).toFixed(2)}</ListGroup.Item>
          <ListGroup.Item><strong>Unidade Organizacional:</strong> {item.unidades_organizacionais?.nome || 'Não informada'}</ListGroup.Item>
          <ListGroup.Item>
            <strong>Quantidade em Estoque:</strong>{' '}
            <Badge bg={item.quantidade > 0 ? 'success' : 'danger'} pill>
              {item.quantidade}
            </Badge>
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}

export default ItemDetailsModal;