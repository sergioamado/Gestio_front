// src/components/impressoras/ImpressoraForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { Impressora, Unidade, ImpressoraCreateData } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface ImpressoraFormProps {
  impressora?: Impressora | null;
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function ImpressoraForm({ impressora, unidades, onSubmit, isLoading }: ImpressoraFormProps) {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<ImpressoraCreateData>({
    defaultValues: {
      nome: impressora?.nome || '',
      modelo: impressora?.modelo || '',
      numero_serie: impressora?.numero_serie || '',
      ip: impressora?.ip || '',
      localizacao: impressora?.localizacao || '',
      servidor: impressora?.servidor || '',
      politicas_aplicadas: impressora?.politicas_aplicadas || false,
      is_colorida: impressora?.is_colorida || false, // <<< RESTAURADO
      unidade_id: impressora?.unidade_id ?? (user?.role !== 'admin' ? (user?.unidade_id ?? undefined) : undefined),
    },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {user?.role === 'admin' && (
        <Form.Group className="mb-3">
          <Form.Label>Unidade Organizacional</Form.Label>
          <Form.Select {...register("unidade_id", { valueAsNumber: true, required: "A unidade é obrigatória" })} isInvalid={!!errors.unidade_id}>
            <option value="">Selecione uma unidade...</option>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.unidade_id?.message}</Form.Control.Feedback>
        </Form.Group>
      )}

      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Nome da Impressora</Form.Label><Form.Control type="text" {...register("nome", { required: true })} isInvalid={!!errors.nome} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Modelo</Form.Label><Form.Control type="text" {...register("modelo", { required: true })} isInvalid={!!errors.modelo} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Número de Série</Form.Label><Form.Control type="text" {...register("numero_serie", { required: true })} isInvalid={!!errors.numero_serie} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Endereço IP</Form.Label><Form.Control type="text" {...register("ip")} /></Form.Group></Col>
      </Row>
       <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Localização (Ex: Secretaria)</Form.Label><Form.Control type="text" {...register("localizacao", { required: true })} isInvalid={!!errors.localizacao} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Servidor (Ex: PAPIRO)</Form.Label><Form.Control type="text" {...register("servidor")} /></Form.Group></Col>
      </Row>
      
      <hr />

      <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
                {/* <<< RESTAURADO >>> */}
                <Form.Check
                    type="switch"
                    id="is-colorida-switch"
                    label="Impressora Colorida"
                    {...register("is_colorida")}
                />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
                <Form.Check
                    type="switch"
                    id="politicas-aplicadas-switch"
                    label="Políticas de Impressão Aplicadas"
                    {...register("politicas_aplicadas")}
                />
            </Form.Group>
          </Col>
      </Row>

      <div className="d-grid mt-3">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {impressora ? 'Salvar Alterações' : 'Registar Impressora'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default ImpressoraForm;