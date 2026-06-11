// src/components/suprimentos/SuprimentoForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Printer, Hash, DropletFill, PaletteFill, BoxSeam } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import { useToast } from '../../contexts/ToastContext';
import type { Impressora, ControleSuprimentosCreateData } from '../../types';

interface SuprimentoFormProps {
  impressoras: Impressora[];
  onSubmit: (data: ControleSuprimentosCreateData) => void;
  isLoading: boolean;
}

function SuprimentoForm({ impressoras, onSubmit, isLoading }: SuprimentoFormProps) {
  const { mostrarCard } = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ControleSuprimentosCreateData>();
  const [impressoraSelecionada, setImpressoraSelecionada] = useState<Impressora | null>(null);

  const impressoraId = watch('impressora_id');

  useEffect(() => {
    if (impressoraId) {
      const impressora = impressoras.find(p => p.id === impressoraId) || null;
      setImpressoraSelecionada(impressora);
    } else {
      setImpressoraSelecionada(null);
    }
  }, [impressoraId, impressoras]);

  // 🚀 Validação inteligente antes de enviar para o Pai
  const onSubmitWrapper = (data: ControleSuprimentosCreateData) => {
    const totalSolicitado = 
      (data.unidade_imagem_solicitadas || 0) + 
      (data.toner_preto_solicitados || 0) + 
      (data.toner_ciano_solicitados || 0) + 
      (data.toner_magenta_solicitados || 0) + 
      (data.toner_amarelo_solicitados || 0);

    if (totalSolicitado === 0) {
      mostrarCard('Aviso de Validação', 'Tem de solicitar pelo menos uma unidade de toner ou imagem antes de enviar.', 'alerta');
      return;
    }

    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitWrapper)} className="px-2">
      <Row className="g-4 mb-4">
        <Col md={7}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Printer className="me-1 mb-1" /> Selecione a Impressora *
            </Form.Label>
            <Form.Select 
              className="bg-light border-0 shadow-none py-2 fw-medium"
              {...register("impressora_id", { required: "Selecione uma impressora.", valueAsNumber: true })} 
              isInvalid={!!errors.impressora_id}
            >
              <option value="">Selecione na lista...</option>
              {impressoras.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.modelo})</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid" className="fw-bold mt-1">
              {errors.impressora_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={5}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Hash className="me-1 mb-1" /> Nº GLPI (Opcional)
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2" 
              placeholder="Ex: 12345"
              {...register("numero_glpi")} 
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Card className="border-0 shadow-sm bg-light mt-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold text-dark mb-3 text-uppercase" style={{ letterSpacing: '0.5px' }}>
            <BoxSeam className="me-2 mb-1 text-primary" />
            Quantidades a Requisitar
          </h6>
          
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group className="bg-white p-3 rounded border border-light-subtle shadow-sm h-100">
                <Form.Label className="fw-bold text-secondary d-flex align-items-center mb-2">
                  <BoxSeam className="me-2 text-primary" /> Unidade de Imagem
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-light border-0 text-center fw-bold fs-5"
                  {...register("unidade_imagem_solicitadas", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
            
            <Col sm={6}>
              <Form.Group className="bg-white p-3 rounded border border-light-subtle shadow-sm h-100">
                <Form.Label className="fw-bold text-dark d-flex align-items-center mb-2">
                  <DropletFill className="me-2 text-dark" /> Toner Preto
                </Form.Label>
                <Form.Control 
                  type="number" 
                  className="bg-light border-0 text-center fw-bold fs-5"
                  {...register("toner_preto_solicitados", { valueAsNumber: true, min: 0 })} 
                  defaultValue={0} 
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Aparece suavemente apenas se a impressora for a cores */}
          {impressoraSelecionada?.is_colorida === true && (
            <div className="mt-3 pt-3 border-top border-secondary-subtle">
              <Badge bg="info" className="mb-3 px-3 py-2 rounded-pill shadow-sm text-dark bg-opacity-25 border border-info">
                <PaletteFill className="me-1 mb-1" /> Impressora Colorida Detetada
              </Badge>
              
              <Row className="g-3">
                <Col sm={4}>
                  <Form.Group className="bg-white p-2 rounded border border-light-subtle shadow-sm">
                    <Form.Label className="fw-bold small d-flex align-items-center mb-1 text-info">
                      <DropletFill className="me-1" /> Ciano
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      className="bg-light border-0 text-center fw-bold"
                      {...register("toner_ciano_solicitados", { valueAsNumber: true, min: 0 })} 
                      defaultValue={0} 
                    />
                  </Form.Group>
                </Col>
                
                <Col sm={4}>
                  <Form.Group className="bg-white p-2 rounded border border-light-subtle shadow-sm">
                    <Form.Label className="fw-bold small d-flex align-items-center mb-1 text-danger" style={{color: '#d946ef'}}>
                      <DropletFill className="me-1" /> Magenta
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      className="bg-light border-0 text-center fw-bold"
                      {...register("toner_magenta_solicitados", { valueAsNumber: true, min: 0 })} 
                      defaultValue={0} 
                    />
                  </Form.Group>
                </Col>
                
                <Col sm={4}>
                  <Form.Group className="bg-white p-2 rounded border border-light-subtle shadow-sm">
                    <Form.Label className="fw-bold small d-flex align-items-center mb-1 text-warning">
                      <DropletFill className="me-1" /> Amarelo
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      className="bg-light border-0 text-center fw-bold"
                      {...register("toner_amarelo_solicitados", { valueAsNumber: true, min: 0 })} 
                      defaultValue={0} 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end mt-4 pt-2 border-top">
        <PrimaryButton type="submit" isLoading={isLoading} className="px-4 fw-bold shadow-sm">
          🚀 Registar Requisitação
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default SuprimentoForm;