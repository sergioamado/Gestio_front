// src/components/solicitacoes/SolicitacaoInfoForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';

interface SolicitacaoInfoFormProps {
  tecnicos: User[];
}

function SolicitacaoInfoForm({ tecnicos }: SolicitacaoInfoFormProps) {
  const { user } = useAuth();
  const { register, setValue, control, formState: { errors } } = useFormContext();

  const paraMim = useWatch({ control, name: 'paraMim' });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setValue('responsavel_usuario_id', user?.id, { shouldValidate: true });
    }
  };

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
            <Form.Select {...register("responsavel_usuario_id", { required: "É obrigatório selecionar um técnico." })} isInvalid={!!errors.responsavel_usuario_id} disabled={paraMim}>
              <option value="">Selecione um técnico...</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.responsavel_usuario_id?.message as string}</Form.Control.Feedback>
          </Form.Group>
          {user?.role === 'tecnico' && (
            <Form.Check 
                type="checkbox"
                id="para-mim-checkbox"
                label="Solicitação para mim mesmo"
                {...register("paraMim")}
                onChange={handleCheckboxChange}
            />
          )}
        </Col>
      </Row>
    </>
  );
}

export default SolicitacaoInfoForm;