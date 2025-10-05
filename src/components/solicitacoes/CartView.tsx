// src/components/solicitacoes/CartView.tsx
import { ListGroup, Button, Alert } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import type { CartItem } from '../../types';

interface CartViewProps {
  cart: CartItem[];
  onRemoveItem: (itemId: number) => void;
}

function CartView({ cart, onRemoveItem }: CartViewProps) {
  if (cart.length === 0) {
    return <Alert variant="info">O seu carrinho de solicitação está vazio.</Alert>;
  }

  return (
    <ListGroup>
      {cart.map(item => (
        <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{item.descricao}</strong>
            <span className="text-muted ms-2">| Quantidade: {item.quantidade}</span>
          </div>
          <Button variant="outline-danger" size="sm" onClick={() => onRemoveItem(item.id)}>
            <Trash />
          </Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default CartView;