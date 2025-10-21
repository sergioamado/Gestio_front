// src/components/estoque/AdicionarEstoqueForm.tsx
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { EstoqueSuprimentos } from '../../types';

interface AdicionarEstoqueFormProps {
  onSubmit: (data: Partial<EstoqueSuprimentos>) => void;
  isLoading: boolean;
}

function AdicionarEstoqueForm({ onSubmit, isLoading }: AdicionarEstoqueFormProps) {
  const { register, handleSubmit, reset } = useForm<Partial<EstoqueSuprimentos>>();

  const handleFormSubmit = (data: Partial<EstoqueSuprimentos>) => {
    onSubmit(data);
    reset();
  };

  return (
    <Card className="floating-card mt-4">
      <Card.Header as="h5">Adicionar ao Estoque</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <Row>
            <Col md><Form.Group className="mb-3"><Form.Label>Unidades de Imagem</Form.Label><Form.Control type="number" {...register("unidade_imagem_total", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
            <Col md><Form.Group className="mb-3"><Form.Label>Toner Preto</Form.Label><Form.Control type="number" {...register("toner_preto_total", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
          </Row>
          <Row>
            <Col><Form.Group className="mb-3"><Form.Label>Toner Ciano</Form.Label><Form.Control type="number" {...register("toner_ciano_total", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
            <Col><Form.Group className="mb-3"><Form.Label>Toner Magenta</Form.Label><Form.Control type="number" {...register("toner_magenta_total", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
            <Col><Form.Group className="mb-3"><Form.Label>Toner Amarelo</Form.Label><Form.Control type="number" {...register("toner_amarelo_total", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
          </Row>
          <div className="d-grid mt-2">
            <PrimaryButton type="submit" isLoading={isLoading}>Adicionar Quantidades</PrimaryButton>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AdicionarEstoqueForm;