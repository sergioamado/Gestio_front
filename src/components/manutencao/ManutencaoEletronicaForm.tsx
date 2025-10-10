// src/components/manutencao/ManutencaoEletronicaForm.tsx
import { useState } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { User, ManutencaoEletronicaCreateData } from '../../types';
import * as manutencaoService from '../../services/manutencaoEletronicaService';

interface ManutencaoFormProps {
  tecnicos: User[];
  onSuccess: () => void;
}

function ManutencaoEletronicaForm({ tecnicos, onSuccess }: ManutencaoFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ManutencaoEletronicaCreateData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: ManutencaoEletronicaCreateData) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await manutencaoService.create(data);
      onSuccess();
    } catch (err) {
      setApiError('Ocorreu um erro ao criar o registo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {apiError && <Alert variant="danger">{apiError}</Alert>}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nº GLPI</Form.Label>
            <Form.Control type="text" {...register("glpi")} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Técnico Responsável</Form.Label>
            <Form.Select 
              {...register("tecnico_responsavel_id", { 
                required: "É obrigatório selecionar um técnico.",
                valueAsNumber: true 
              })} 
              isInvalid={!!errors.tecnico_responsavel_id}
            >
              <option value="">Selecione um técnico...</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tecnico_responsavel_id?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Equipamento</Form.Label>
        <Form.Control 
          type="text" 
          {...register("equipamento", { required: "O nome do equipamento é obrigatório." })}
          isInvalid={!!errors.equipamento}
        />
        <Form.Control.Feedback type="invalid">
          {errors.equipamento?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Descrição do Problema</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={4}
          {...register("descricao_problema", { required: "A descrição do problema é obrigatória." })}
          isInvalid={!!errors.descricao_problema}
        />
        <Form.Control.Feedback type="invalid">
          {errors.descricao_problema?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-grid mt-3">
        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Adicionar à Fila
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default ManutencaoEletronicaForm;