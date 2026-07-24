// src/components/solicitacoes/ItemSelectionList.tsx
import { ListGroup, Form, InputGroup, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { BoxSeam, PlusCircle, ArrowRepeat } from 'react-bootstrap-icons';
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

  // Estado de catálogo vazio
  if (itens.length === 0) {
    return (
      <div className="text-center py-5 bg-light rounded shadow-sm border border-light-subtle">
        <BoxSeam size={40} className="text-muted mb-3" />
        <h6 className="fw-bold text-secondary">Catálogo Vazio</h6>
        <p className="text-muted small mb-0">Não existem peças ou materiais disponíveis para seleção.</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {itens.map(item => {
          const isInCart = cart.some(cartItem => cartItem.id === item.id);
          const isOutOfStock = item.quantidade === 0;
          const isLowStock = item.quantidade > 0 && item.quantidade <= 5;

          return (
            <ListGroup.Item 
              key={item.id} 
              className={`py-3 border-bottom ${isInCart ? 'bg-success bg-opacity-10' : 'bg-white'}`}
            >
              <Row className="align-items-center g-3">
                <Col>
                  <div className="d-flex align-items-center mb-1">
                    <BoxSeam className="text-primary me-2" />
                    <strong className="text-dark fs-6">{item.descricao}</strong>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <Badge 
                      bg={isOutOfStock ? 'danger' : (isLowStock ? 'warning' : 'success')} 
                      className="rounded-pill shadow-sm"
                    >
                      {isOutOfStock ? 'Sem Estoque' : `Em estoque: ${item.quantidade}`}
                    </Badge>
                    {isInCart && <Badge bg="primary" className="rounded-pill shadow-sm">No Carrinho</Badge>}
                  </div>
                </Col>
                <Col md={6} lg={5}>
                  <InputGroup className="shadow-sm rounded overflow-hidden">
                    <Form.Control 
                      id={`qtd-${item.id}`}
                      type="number"
                      defaultValue={1}
                      min={1}
                      max={item.quantidade > 0 ? item.quantidade : 1}
                      disabled={isOutOfStock}
                      className="bg-light border-0 text-center fw-bold"
                      style={{ maxWidth: '80px' }}
                    />
                    <Button 
                      variant={isInCart ? 'primary' : 'outline-primary'} 
                      className="fw-bold border-0 px-3 d-flex align-items-center"
                      onClick={() => handleAddClick(item)}
                      disabled={isOutOfStock}
                    >
                      {isInCart ? (
                        <><ArrowRepeat className="me-1"/> Atualizar</>
                      ) : (
                        <><PlusCircle className="me-1"/> Adicionar</>
                      )}
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </Card>
  );
}

export default ItemSelectionList;