// src/components/solicitacoes/ItemSelectionList.tsx
import { ListGroup, Form, InputGroup, Button, Row, Col } from 'react-bootstrap';
import type { Item, CartItem } from '../../types';

interface ItemSelectionListProps {
  itens: Item[];
  cart: CartItem[];
  onAddItem: (item: Item, quantidade: number) => void;
}

function ItemSelectionList({ itens, cart, onAddItem }: ItemSelectionListProps) {
  const handleAddClick = (item: Item) => {
    const input = document.getElementById(`qtd-${item.id}`) as HTMLInputElement;
    const quantidade = parseInt(input.value, 10) || 1;
    onAddItem(item, quantidade);
  };

  return (
    <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {itens.map(item => {
        const isInCart = cart.some(cartItem => cartItem.id === item.id);
        return (
          <ListGroup.Item key={item.id} variant={isInCart ? 'success' : ''}>
            <Row className="align-items-center">
              <Col>
                <strong>{item.descricao}</strong>
                <div className="text-muted small">Em estoque: {item.quantidade}</div>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <Form.Control 
                    id={`qtd-${item.id}`}
                    type="number"
                    defaultValue={1}
                    min={1}
                    max={item.quantidade}
                    size="sm"
                  />
                  <Button variant="outline-primary" size="sm" onClick={() => handleAddClick(item)}>
                    {isInCart ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

export default ItemSelectionList;