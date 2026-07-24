// src/components/solicitacoes/SolicitacaoInfoForm.tsx
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import { Building, Hash, PcDisplay, PersonBadge } from 'react-bootstrap-icons';
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
    <Card className="border-0 shadow-sm mb-4 bg-white">
      <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
        <h6 className="fw-bold text-primary mb-0 text-uppercase" style={{ letterSpacing: '0.5px' }}>
          Informações Básicas da OS
        </h6>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">
                <Building className="me-1 mb-1" /> Setor do Equipamento
              </Form.Label>
              <Form.Control 
                type="text" 
                className="bg-light border-0 shadow-none py-2" 
                placeholder="Ex: Recepção, Recursos Humanos..."
                {...register("setor_equipamento")} 
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">
                <Hash className="me-1 mb-1" /> Nº GLPI
              </Form.Label>
              <Form.Control 
                type="text" 
                className="bg-light border-0 shadow-none py-2" 
                placeholder="Ex: 12345"
                {...register("numero_glpi")} 
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">
                <PcDisplay className="me-1 mb-1" /> Patrimônio
              </Form.Label>
              <Form.Control 
                type="text" 
                className="bg-light border-0 shadow-none py-2" 
                placeholder="Nº de Tombamento (Se aplicável)"
                {...register("patrimonio")} 
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">
                <PersonBadge className="me-1 mb-1" /> Técnico Responsável
              </Form.Label>
              <Form.Select 
                className="bg-light border-0 shadow-none py-2 fw-medium"
                {...register("responsavel_usuario_id", { required: "É obrigatório selecionar um técnico." })} 
                isInvalid={!!errors.responsavel_usuario_id} 
                disabled={paraMim}
              >
                <option value="">Selecione um técnico da lista...</option>
                {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid" className="fw-bold mt-1">
                {errors.responsavel_usuario_id?.message as string}
              </Form.Control.Feedback>
            </Form.Group>
            
            {user?.role === 'tecnico' && (
              <div className="mt-3 bg-light p-2 rounded d-inline-block border border-light-subtle">
                <Form.Check 
                    type="switch"
                    id="para-mim-checkbox"
                    label={<span className="fw-bold text-dark small ms-1">Atribuir esta OS para mim mesmo</span>}
                    {...register("paraMim")}
                    onChange={handleCheckboxChange}
                    className="d-flex align-items-center m-0"
                />
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default SolicitacaoInfoForm;