// src/components/unidades/UnidadeForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import type { Unidade, UnidadeCreateData } from '../../types/index';
import PrimaryButton from '../PrimaryButton';

interface UnidadeFormProps {
  unidade?: Unidade | null;
  onSubmit: (data: UnidadeCreateData) => void;
  isLoading: boolean;
}

function UnidadeForm({ unidade, onSubmit, isLoading }: UnidadeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UnidadeCreateData>({
    defaultValues: {
      nome: unidade?.nome || '',
      sigla: unidade?.sigla || '',
      campus: unidade?.campus || '',
    },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col>
          <Form.Group className="mb-3" controlId="formNomeUnidade">
            <Form.Label>Nome da Unidade</Form.Label>
            <Form.Control
              type="text"
              {...register("nome", { required: "O nome é obrigatório" })}
              isInvalid={!!errors.nome}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nome?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
            <Form.Group className="mb-3" controlId="formSiglaUnidade">
                <Form.Label>Sigla</Form.Label>
                <Form.Control
                type="text"
                {...register("sigla", { required: "A sigla é obrigatória" })}
                isInvalid={!!errors.sigla}
                />
                <Form.Control.Feedback type="invalid">
                {errors.sigla?.message}
                </Form.Control.Feedback>
            </Form.Group>
        </Col>
        <Col md={6}>
            <Form.Group className="mb-3" controlId="formCampusUnidade">
                <Form.Label>Campus</Form.Label>
                <Form.Control
                type="text"
                {...register("campus", { required: "O campus é obrigatório" })}
                isInvalid={!!errors.campus}
                />
                <Form.Control.Feedback type="invalid">
                {errors.campus?.message}
                </Form.Control.Feedback>
            </Form.Group>
        </Col>
      </Row>
      <div className="d-grid mt-2">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {unidade ? 'Salvar Alterações' : 'Cadastrar Unidade'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default UnidadeForm;