// src/components/suprimentos/SuprimentoForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { Impressora, ControleSuprimentosCreateData } from '../../types';

interface SuprimentoFormProps {
  impressoras: Impressora[];
  onSubmit: (data: ControleSuprimentosCreateData) => void;
  isLoading: boolean;
}

function SuprimentoForm({ impressoras, onSubmit, isLoading }: SuprimentoFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ControleSuprimentosCreateData>();
  const [impressoraSelecionada, setImpressoraSelecionada] = useState<Impressora | null>(null);

  const impressoraId = watch('impressora_id');
  
  // --- PONTO DE DEPURAÇÃO 1 ---
  // A cada renderização, vamos verificar os dados que o formulário recebe.
  console.log("FORMULÁRIO RENDERIZADO. Lista de impressoras recebida:", impressoras);

  useEffect(() => {
    if (impressoraId) {
      const impressora = impressoras.find(p => p.id === impressoraId) || null;
      
      // --- PONTO DE DEPURAÇÃO 2 ---
      // Verificamos se encontrámos a impressora e qual o valor de 'is_colorida'.
      console.log(`Impressora ID selecionado: ${impressoraId}. Impressora encontrada:`, impressora);
      
      setImpressoraSelecionada(impressora);
    } else {
      setImpressoraSelecionada(null);
    }
  }, [impressoraId, impressoras]);

  // --- PONTO DE DEPURAÇÃO 3 ---
  // Verificamos o estado final antes de renderizar o JSX.
  console.log("Estado 'impressoraSelecionada' antes de renderizar:", impressoraSelecionada);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
            <Col md={6}>
                <Form.Group className="mb-3">
                <Form.Label>Impressora</Form.Label>
                <Form.Select 
                    {...register("impressora_id", { required: "Selecione uma impressora.", valueAsNumber: true })} 
                    isInvalid={!!errors.impressora_id}
                >
                    <option value="">Selecione...</option>
                    {impressoras.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.modelo})</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.impressora_id?.message}</Form.Control.Feedback>
                </Form.Group>
            </Col>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Nº GLPI (Opcional)</Form.Label><Form.Control type="text" {...register("numero_glpi")} /></Form.Group></Col>
        </Row>
      
      <hr />
      <h5>Suprimentos Requisitados</h5>
      
      <Row>
        <Col><Form.Group className="mb-3"><Form.Label>Unidades de Imagem</Form.Label><Form.Control type="number" {...register("unidade_imagem_solicitadas", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
        <Col><Form.Group className="mb-3"><Form.Label>Toner Preto</Form.Label><Form.Control type="number" {...register("toner_preto_solicitados", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
      </Row>
      
      {/* A lógica condicional em si está correta, o problema está nos dados que a alimentam */}
      {impressoraSelecionada?.is_colorida === true && (
        <>
            <p className="text-success fw-bold">Impressora colorida detetada. Campos adicionais visíveis.</p>
            <Row>
            <Col><Form.Group className="mb-3"><Form.Label>Toner Ciano</Form.Label><Form.Control type="number" {...register("toner_ciano_solicitados", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
            <Col><Form.Group className="mb-3"><Form.Label>Toner Magenta</Form.Label><Form.Control type="number" {...register("toner_magenta_solicitados", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
            <Col><Form.Group className="mb-3"><Form.Label>Toner Amarelo</Form.Label><Form.Control type="number" {...register("toner_amarelo_solicitados", { valueAsNumber: true, min: 0 })} defaultValue={0} /></Form.Group></Col>
            </Row>
        </>
      )}

      <div className="d-grid mt-3">
        <PrimaryButton type="submit" isLoading={isLoading}>Requisitar Suprimentos</PrimaryButton>
      </div>
    </Form>
  );
}

export default SuprimentoForm;