// src/components/solicitacoes/SolicitacaoInfoForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import type { User } from '../../types';

interface SolicitacaoInfoFormProps {
  tecnicos: User[];
}

function SolicitacaoInfoForm({ tecnicos }: SolicitacaoInfoFormProps) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Setor do Equipamento</Form.Label><Form.Control type="text" {...register("setor_equipamento")} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Nº GLPI</Form.Label><Form.Control type="text" {...register("numero_glpi")} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Patrimônio</Form.Label><Form.Control type="text" {...register("patrimonio")} /></Form.Group></Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Técnico Responsável</Form.Label>
            <Form.Select {...register("responsavel_usuario_id", { required: "É obrigatório selecionar um técnico." })} isInvalid={!!errors.responsavel_usuario_id}>
              <option value="">Selecione um técnico...</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.responsavel_usuario_id?.message as string}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}

export default SolicitacaoInfoForm;