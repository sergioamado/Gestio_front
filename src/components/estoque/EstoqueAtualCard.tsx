// src/components/estoque/EstoqueAtualCard.tsx
import { Card, ListGroup, Spinner } from 'react-bootstrap';
import type { EstoqueSuprimentos } from '../../types';

interface EstoqueAtualCardProps {
  estoque: EstoqueSuprimentos | null;
  loading: boolean;
}

function EstoqueAtualCard({ estoque, loading }: EstoqueAtualCardProps) {
  return (
    <Card className="floating-card">
      <Card.Header as="h5">Estoque Atual de Suprimentos</Card.Header>
      <Card.Body>
        {loading ? <div className="text-center"><Spinner /></div> : (
          <ListGroup variant="flush">
            <ListGroup.Item className="d-flex justify-content-between align-items-center">Unidades de Imagem: <strong>{estoque?.unidade_imagem_total}</strong></ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">Toner Preto: <strong>{estoque?.toner_preto_total}</strong></ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">Toner Ciano: <strong>{estoque?.toner_ciano_total}</strong></ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">Toner Magenta: <strong>{estoque?.toner_magenta_total}</strong></ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">Toner Amarelo: <strong>{estoque?.toner_amarelo_total}</strong></ListGroup.Item>
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default EstoqueAtualCard;