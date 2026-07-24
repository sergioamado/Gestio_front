// src/components/estoque/AdicionarEstoqueForm.tsx
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BoxSeam, DropletFill, PlusCircle } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import { useToast } from '../../contexts/ToastContext';
import type { EstoqueSuprimentos } from '../../types';

interface AdicionarEstoqueFormProps {
  onSubmit: (data: Partial<EstoqueSuprimentos>) => void;
  isLoading: boolean;
}

function AdicionarEstoqueForm({ onSubmit, isLoading }: AdicionarEstoqueFormProps) {
  const { mostrarCard } = useToast();
  const { register, handleSubmit, reset } = useForm<Partial<EstoqueSuprimentos>>();

  // 🚀 Validação inteligente para não adicionar "Zeros" ao banco de dados
  const handleFormSubmit = (data: Partial<EstoqueSuprimentos>) => {
    const totalAdicionado = 
      (data.unidade_imagem_total || 0) + 
      (data.toner_preto_total || 0) + 
      (data.toner_ciano_total || 0) + 
      (data.toner_magenta_total || 0) + 
      (data.toner_amarelo_total || 0);

    if (totalAdicionado === 0) {
      mostrarCard('Aviso de Validação', 'Por favor, informe pelo menos uma quantidade maior que zero para adicionar ao estoque.', 'alerta');
      return;
    }

    onSubmit(data);
    reset(); // Limpa o formulário após enviar com sucesso para a página Pai
  };

  return (
    <Card className="border-0 shadow-sm mt-4 bg-white overflow-hidden">
      <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
        <h6 className="fw-bold text-success mb-0 text-uppercase d-flex align-items-center" style={{ letterSpacing: '0.5px' }}>
          <PlusCircle className="me-2" />
          Adicionar Nova Remessa ao Estoque
        </h6>
      </Card.Header>
      
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          
          <Row className="g-3 mb-4">
            <Col sm={6}>
              <Form.Group className="bg-light p-3 rounded border border-light-subtle h-100 shadow-sm">
                <Form.Label className="fw-bold text-secondary d-flex align-items-center mb-2">
                  <BoxSeam className="me-2 text-primary" /> Unidades de Imagem
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-white border-0 text-center fw-bold fs-5 shadow-sm"
                  {...register("unidade_imagem_total", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
            
            <Col sm={6}>
              <Form.Group className="bg-light p-3 rounded border border-light-subtle h-100 shadow-sm">
                <Form.Label className="fw-bold text-dark d-flex align-items-center mb-2">
                  <DropletFill className="me-2 text-dark" /> Toner Preto
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-white border-0 text-center fw-bold fs-5 shadow-sm"
                  {...register("toner_preto_total", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col sm={4}>
              <Form.Group className="bg-light p-3 rounded border border-light-subtle h-100 shadow-sm">
                <Form.Label className="fw-bold small d-flex align-items-center mb-2 text-info">
                  <DropletFill className="me-1" /> Toner Ciano
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-white border-0 text-center fw-bold shadow-sm"
                  {...register("toner_ciano_total", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
            
            <Col sm={4}>
              <Form.Group className="bg-light p-3 rounded border border-light-subtle h-100 shadow-sm">
                <Form.Label className="fw-bold small d-flex align-items-center mb-2" style={{color: '#d946ef'}}>
                  <DropletFill className="me-1" /> Toner Magenta
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-white border-0 text-center fw-bold shadow-sm"
                  {...register("toner_magenta_total", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
            
            <Col sm={4}>
              <Form.Group className="bg-light p-3 rounded border border-light-subtle h-100 shadow-sm">
                <Form.Label className="fw-bold small d-flex align-items-center mb-2 text-warning">
                  <DropletFill className="me-1" /> Toner Amarelo
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-white border-0 text-center fw-bold shadow-sm"
                  {...register("toner_amarelo_total", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end border-top pt-3">
            <PrimaryButton type="submit" isLoading={isLoading} className="px-4 fw-bold shadow-sm" variant="success">
              <PlusCircle className="me-2 mb-1" /> Adicionar Quantidades
            </PrimaryButton>
          </div>
          
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AdicionarEstoqueForm;