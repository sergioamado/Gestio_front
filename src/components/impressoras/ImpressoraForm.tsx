// src/components/impressoras/ImpressoraForm.tsx
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Printer, Hash, Diagram3, GeoAlt, ShieldCheck, PaletteFill, Building, Tags } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import type { Impressora, Unidade, ImpressoraCreateData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

interface ImpressoraFormProps {
  impressora?: Impressora | null;
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function ImpressoraForm({ impressora, unidades, onSubmit, isLoading }: ImpressoraFormProps) {
  const { user } = useAuth();
  const { mostrarCard } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ImpressoraCreateData>({
    defaultValues: {
      nome: impressora?.nome || '',
      modelo: impressora?.modelo || '',
      numero_serie: impressora?.numero_serie || '',
      ip: impressora?.ip || '',
      localizacao: impressora?.localizacao || '',
      servidor: impressora?.servidor || '',
      politicas_aplicadas: impressora?.politicas_aplicadas || false,
      is_colorida: impressora?.is_colorida || false,
      unidade_id: impressora?.unidade_id ?? (user?.role !== 'admin' ? (user?.unidade_id ?? undefined) : undefined),
    },
  });

  // 🚀 Lógica de Validação Inteligente antes de Enviar
  const onSubmitWrapper = (data: ImpressoraCreateData) => {
    // Verifica se o IP foi preenchido, mas não tem pontos (formato claramente inválido)
    if (data.ip && !data.ip.includes('.')) {
      mostrarCard('Formato Inválido', 'O Endereço IP inserido parece estar incorreto. Verifique os pontos.', 'alerta');
      return;
    }

    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitWrapper)} className="px-2">
      
      {user?.role === 'admin' && (
        <Card className="border-0 shadow-sm mb-4 bg-light">
          <Card.Body className="p-3">
            <Form.Group>
              <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                <Building className="me-1 mb-1" /> Unidade Organizacional *
              </Form.Label>
              <Form.Select 
                className="border-0 shadow-none py-2 fw-medium"
                {...register("unidade_id", { valueAsNumber: true, required: "A unidade é obrigatória" })} 
                isInvalid={!!errors.unidade_id}
              >
                <option value="">Selecione uma unidade...</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid" className="fw-bold mt-1">
                {errors.unidade_id?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Card.Body>
        </Card>
      )}

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Printer className="me-1 mb-1" /> Nome da Impressora *
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2"
              placeholder="Ex: IMP-RECEP-01"
              {...register("nome", { required: true })} 
              isInvalid={!!errors.nome} 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Tags className="me-1 mb-1" /> Modelo *
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2"
              placeholder="Ex: HP LaserJet Pro..."
              {...register("modelo", { required: true })} 
              isInvalid={!!errors.modelo} 
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Hash className="me-1 mb-1" /> Número de Série *
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2"
              placeholder="Ex: VNC458902"
              {...register("numero_serie", { required: true })} 
              isInvalid={!!errors.numero_serie} 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Diagram3 className="me-1 mb-1" /> Endereço IP
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2 font-monospace"
              placeholder="Ex: 192.168.1.50"
              {...register("ip")} 
            />
          </Form.Group>
        </Col>
      </Row>

       <Row className="g-4 mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <GeoAlt className="me-1 mb-1" /> Localização *
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2"
              placeholder="Ex: Secretaria Geral"
              {...register("localizacao", { required: true })} 
              isInvalid={!!errors.localizacao} 
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Diagram3 className="me-1 mb-1" /> Servidor / Spooler
            </Form.Label>
            <Form.Control 
              type="text" 
              className="bg-light border-0 shadow-none py-2"
              placeholder="Ex: PAPIRO ou SRV-PRINT"
              {...register("servidor")} 
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row className="g-3 mt-2 border-top pt-4">
          <Col md={6}>
            <div className="bg-light p-3 rounded border border-light-subtle h-100 d-flex align-items-center">
              <Form.Group className="mb-0 w-100">
                  <Form.Check
                      type="switch"
                      id="is-colorida-switch"
                      label={<span className="fw-bold text-dark d-flex align-items-center"><PaletteFill className="me-2 text-primary"/> Impressora Colorida</span>}
                      {...register("is_colorida")}
                      className="m-0"
                  />
              </Form.Group>
            </div>
          </Col>
          <Col md={6}>
            <div className="bg-light p-3 rounded border border-light-subtle h-100 d-flex align-items-center">
              <Form.Group className="mb-0 w-100">
                  <Form.Check
                      type="switch"
                      id="politicas-aplicadas-switch"
                      label={<span className="fw-bold text-dark d-flex align-items-center"><ShieldCheck className="me-2 text-success"/> Políticas Aplicadas</span>}
                      {...register("politicas_aplicadas")}
                      className="m-0"
                  />
              </Form.Group>
            </div>
          </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4 pt-3 border-top">
        <PrimaryButton type="submit" isLoading={isLoading} className="px-4 fw-bold shadow-sm">
          {impressora ? '💾 Salvar Alterações' : '🚀 Registar Impressora'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default ImpressoraForm;