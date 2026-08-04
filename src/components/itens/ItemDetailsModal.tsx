// src/components/itens/ItemDetailsModal.tsx
import { Modal, ListGroup, Badge } from 'react-bootstrap';
import type { Item } from '../../types';

interface ItemDetailsModalProps {
  show: boolean;
  onHide: () => void;
  item: Item | null;
  canManageItems?: boolean; //  Adicionado para receber a permissão de visualização
}

function ItemDetailsModal({ show, onHide, item, canManageItems = false }: ItemDetailsModalProps) {
  if (!item) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold text-dark">🔍 Detalhes do Item</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <h5 className="fw-bold text-uppercase mb-3 text-primary">{item.descricao}</h5>
        <hr className="text-muted mb-4" />
        
        <ListGroup variant="flush" className="shadow-sm border rounded">
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Código SIPAC:</span> 
            <span className="fw-medium">{item.codigo_sipac || 'Não informado'}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Pregão:</span> 
            <span className="fw-medium">{item.pregao || 'Não informado'}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Tipo:</span> 
            <span className="fw-medium">{item.tipo || 'Não informado'}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Localização:</span> 
            <span className="fw-medium">{item.localizacao || 'Não informado'}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Unidade de Medida:</span> 
            <span className="fw-medium">{item.unidade_medida}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Preço Unitário:</span> 
            <span className="fw-medium">R$ {Number(item.preco_unitario).toFixed(2)}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between px-3 py-2">
            <span className="text-muted fw-bold">Unidade Organizacional:</span> 
            <span className="fw-medium">{item.unidades_organizacionais?.nome || 'Não informada'}</span>
          </ListGroup.Item>
          
          {/*  A quantidade em estoque SÓ APARECE para Administradores e Gerentes */}
          {canManageItems && (
            <ListGroup.Item className="d-flex justify-content-between px-3 py-3 bg-light border-top border-2">
              <span className="text-dark fw-bold">Quantidade em Estoque:</span>{' '}
              <Badge bg={item.quantidade > 0 ? 'success' : 'danger'} pill className="px-3 shadow-sm fs-6">
                {item.quantidade}
              </Badge>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}

export default ItemDetailsModal;