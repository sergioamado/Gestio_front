// src/components/atendimentos/AtendimentoForm.tsx
import { Form, Row, Col, Accordion } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { AtendimentoImpressora, Impressora, StatusAtendimento, AtendimentoCreateData, AtendimentoUpdateData } from '../../types';
import { statusMap } from './AtendimentosTable';

interface AtendimentoFormProps {
  atendimento?: AtendimentoImpressora | null;
  impressoras: Impressora[];
  onSubmit: (data: AtendimentoCreateData | AtendimentoUpdateData) => void;
  isLoading: boolean;
}

const statusOptions = Object.keys(statusMap) as StatusAtendimento[];

// Função auxiliar para formatar datas para o input type="date"
const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

function AtendimentoForm({ atendimento, impressoras, onSubmit, isLoading }: AtendimentoFormProps) {
  const isEditMode = !!atendimento;
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    // CORREÇÃO: Usar a função auxiliar para formatar as datas de forma segura
    defaultValues: {
      ...atendimento,
      data_visita: formatDateForInput(atendimento?.data_visita),
      backup_data_disponibilizacao: formatDateForInput(atendimento?.backup_data_disponibilizacao),
      backup_data_retirada: formatDateForInput(atendimento?.backup_data_retirada),
    },
  });

  const necessitaBackup = watch('necessita_backup');

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Accordion defaultActiveKey="0" alwaysOpen>
        {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>1. Informações do Chamado</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nº GLPI</Form.Label>
                  <Form.Control type="text" {...register("numero_glpi", { required: "O GLPI é obrigatório" })} isInvalid={!!errors.numero_glpi} disabled={isEditMode} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Impressora Afetada</Form.Label>
                  <Form.Select {...register("impressora_id", { required: "A impressora é obrigatória", valueAsNumber: true })} isInvalid={!!errors.impressora_id} disabled={isEditMode}>
                    <option value="">Selecione...</option>
                    {impressoras.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.localizacao})</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {isEditMode && (
                 <Form.Group className="mb-3">
                    <Form.Label>Status do Atendimento</Form.Label>
                    <Form.Select {...register("status", { required: "O status é obrigatório" })}>
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{statusMap[status].text}</option>
                        ))}
                    </Form.Select>
                 </Form.Group>
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* SEÇÃO 2: VISITA TÉCNICA EXTERNA */}
        {isEditMode && (
          <Accordion.Item eventKey="1">
            <Accordion.Header>2. Diagnóstico da Assistência Técnica</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3"><Form.Check type="switch" label="Visita do técnico externo já ocorreu?" {...register("assistencia_realizada")} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Data da Visita</Form.Label><Form.Control type="date" {...register("data_visita")} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Nº Chamado Assistência</Form.Label><Form.Control type="text" {...register("chamado_assistencia")} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Parecer Técnico Inicial</Form.Label><Form.Control as="textarea" rows={3} {...register("parecer_tecnico")} /></Form.Group>
              <Form.Group className="mb-3"><Form.Check type="switch" label="Necessita de peças?" {...register("necessita_pecas")} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Descrição das Peças</Form.Label><Form.Control as="textarea" rows={2} {...register("descricao_pecas")} /></Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        )}

        {/* SEÇÃO 3: IMPRESSORA DE BACKUP */}
        {isEditMode && (
          <Accordion.Item eventKey="2">
            <Accordion.Header>3. Gestão de Impressora de Backup</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3"><Form.Check type="switch" label="Foi necessário instalar uma impressora de backup?" {...register("necessita_backup")} /></Form.Group>
              {necessitaBackup && (
                <>
                  <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Modelo da Impressora de Backup</Form.Label><Form.Control type="text" {...register("backup_impressora_modelo")} /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Nº de Série do Backup</Form.Label><Form.Control type="text" {...register("backup_numero_serie")} /></Form.Group></Col>
                  </Row>
                  <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Data de Disponibilização</Form.Label><Form.Control type="date" {...register("backup_data_disponibilizacao")} /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Data de Retirada</Form.Label><Form.Control type="date" {...register("backup_data_retirada")} /></Form.Group></Col>
                  </Row>
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        )}

        {/* SEÇÃO 4: FINALIZAÇÃO */}
        {isEditMode && (
            <Accordion.Item eventKey="3">
                <Accordion.Header>4. Finalização do Chamado</Accordion.Header>
                <Accordion.Body>
                    <Form.Group className="mb-3"><Form.Check type="switch" label="Chamado da assistência técnica foi concluído?" {...register("assistencia_concluiu")} /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Parecer Final da Assistência</Form.Label><Form.Control as="textarea" rows={3} {...register("parecer_final_assistencia")} /></Form.Group>
                </Accordion.Body>
            </Accordion.Item>
        )}
      </Accordion>

      <div className="d-grid mt-4">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {isEditMode ? 'Salvar Alterações' : 'Abrir Chamado de Atendimento'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default AtendimentoForm;