// src/components/atendimentos/AtendimentoForm.tsx
import { useEffect } from 'react';
import { Form, Row, Col, Accordion, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { InfoCircle, Tools, PrinterFill, Check2All, Hash, CardText, Cpu, CalendarEvent } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import { useToast } from '../../contexts/ToastContext';
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
  const { mostrarCard } = useToast();
  
  // 🚀 Adicionado setValue para manipular campos programaticamente
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...atendimento,
      data_visita: formatDateForInput(atendimento?.data_visita),
      backup_data_disponibilizacao: formatDateForInput(atendimento?.backup_data_disponibilizacao),
      backup_data_retirada: formatDateForInput(atendimento?.backup_data_retirada),
    },
  });

  const necessitaBackup = watch('necessita_backup');
  const assistenciaConcluiu = watch('assistencia_concluiu');

  // 🚀 Automação de Status (Impressoras #3)
  // Se o switch "assistência concluiu" for ativado, o status muda automaticamente para Concluído.
  useEffect(() => {
    if (assistenciaConcluiu) {
      setValue('status', 'Concluido');
    }
  }, [assistenciaConcluiu, setValue]);

  // Validação Inteligente das Fases do Chamado
  const onSubmitWrapper = (data: any) => {
    // Regra 1: Se exigiu backup, tem de dizer qual foi a máquina
    if (data.necessita_backup && (!data.backup_impressora_modelo || !data.backup_numero_serie)) {
      mostrarCard('Aviso de Backup', 'Como informou que há uma impressora de backup, é obrigatório preencher o Modelo e o Nº de Série da mesma.', 'alerta');
      return;
    }

    // Regra 2: Se concluiu a assistência, tem de ter um parecer
    if (data.assistencia_concluiu && (!data.parecer_final_assistencia || data.parecer_final_assistencia.trim() === '')) {
      mostrarCard('Parecer Obrigatório', 'Para finalizar o chamado da assistência, por favor, redija o Parecer Final.', 'alerta');
      return;
    }

    // Regra 3 (Garantia Extra de Backend): Força o envio do status correto
    if (data.assistencia_concluiu) {
      data.status = 'Concluido';
    }

    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitWrapper)} className="px-2 pb-2">
      <Accordion defaultActiveKey="0" alwaysOpen className="custom-accordion shadow-sm mb-4">
        
        {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
        <Accordion.Item eventKey="0" className="border-0 mb-3 rounded overflow-hidden">
          <Accordion.Header className="bg-white">
            <span className="fw-bold text-primary d-flex align-items-center">
              <InfoCircle className="me-2" size={18} /> 1. Informações do Chamado
            </span>
          </Accordion.Header>
          <Accordion.Body className="bg-white border-top">
            <Row className="g-4 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                    <Hash className="me-1 mb-1"/> Nº GLPI *
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    className="bg-light border-0 shadow-none py-2"
                    {...register("numero_glpi", { required: "O GLPI é obrigatório" })} 
                    isInvalid={!!errors.numero_glpi} 
                    disabled={isEditMode} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                    <PrinterFill className="me-1 mb-1"/> Impressora Afetada *
                  </Form.Label>
                  <Form.Select 
                    className="bg-light border-0 shadow-none py-2 fw-medium"
                    {...register("impressora_id", { required: "A impressora é obrigatória", valueAsNumber: true })} 
                    isInvalid={!!errors.impressora_id} 
                    disabled={isEditMode}
                  >
                    <option value="">Selecione na lista...</option>
                    {impressoras.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.localizacao})</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {isEditMode && (
                 <Form.Group className="mt-4 p-3 bg-light rounded border border-light-subtle">
                    <Form.Label className="small fw-bold text-dark text-uppercase mb-2">Status do Atendimento</Form.Label>
                    <Form.Select 
                      className={`border-0 shadow-sm py-2 fw-bold ${assistenciaConcluiu ? 'text-success bg-success bg-opacity-10' : 'text-primary'}`}
                      {...register("status", { required: "O status é obrigatório" })}
                    >
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
          <Accordion.Item eventKey="1" className="border-0 mb-3 rounded overflow-hidden">
            <Accordion.Header>
              <span className="fw-bold text-dark d-flex align-items-center">
                <Tools className="me-2 text-warning" size={18} /> 2. Diagnóstico da Assistência Técnica
              </span>
            </Accordion.Header>
            <Accordion.Body className="bg-white border-top">
              
              <div className="bg-light p-3 rounded mb-4 border border-light-subtle">
                <Form.Group>
                  <Form.Check 
                    type="switch" 
                    id="visita-switch"
                    label={<span className="fw-bold text-dark ms-1">A visita do técnico externo já ocorreu?</span>} 
                    {...register("assistencia_realizada")} 
                  />
                </Form.Group>
              </div>

              <Row className="g-4 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                      <CalendarEvent className="me-1 mb-1"/> Data da Visita
                    </Form.Label>
                    <Form.Control type="date" className="bg-light border-0 shadow-none py-2" {...register("data_visita")} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                      <Hash className="me-1 mb-1"/> Nº Chamado Assistência
                    </Form.Label>
                    <Form.Control type="text" className="bg-light border-0 shadow-none py-2" placeholder="Ex: OS-99812" {...register("chamado_assistencia")} />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                  <CardText className="me-1 mb-1"/> Parecer Técnico Inicial
                </Form.Label>
                <Form.Control as="textarea" rows={3} className="bg-light border-0 shadow-none" placeholder="Relato do defeito encontrado..." {...register("parecer_tecnico")} />
              </Form.Group>

              <Card className="border border-warning-subtle shadow-sm">
                <Card.Body className="bg-warning bg-opacity-10">
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="switch" 
                      id="pecas-switch"
                      label={<span className="fw-bold text-dark ms-1">Necessita de troca de peças?</span>} 
                      {...register("necessita_pecas")} 
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Descrição das Peças</Form.Label>
                    <Form.Control as="textarea" rows={2} className="border-0 shadow-none" placeholder="Especifique as peças encomendadas..." {...register("descricao_pecas")} />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Accordion.Body>
          </Accordion.Item>
        )}

        {/* SEÇÃO 3: IMPRESSORA DE BACKUP */}
        {isEditMode && (
          <Accordion.Item eventKey="2" className="border-0 mb-3 rounded overflow-hidden">
            <Accordion.Header>
              <span className="fw-bold text-dark d-flex align-items-center">
                <Cpu className="me-2 text-info" size={18} /> 3. Gestão de Impressora de Backup
              </span>
            </Accordion.Header>
            <Accordion.Body className="bg-white border-top">
              
              <div className="bg-light p-3 rounded mb-4 border border-light-subtle">
                <Form.Group>
                  <Form.Check 
                    type="switch" 
                    id="backup-switch"
                    label={<span className="fw-bold text-dark ms-1">Foi necessário instalar uma impressora de backup?</span>} 
                    {...register("necessita_backup")} 
                  />
                </Form.Group>
              </div>

              {necessitaBackup && (
                <div className="p-3 bg-info bg-opacity-10 border border-info rounded">
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Modelo da Imp. Backup</Form.Label>
                        <Form.Control type="text" className="bg-white border-0 shadow-sm py-2" placeholder="Ex: HP M428" {...register("backup_impressora_modelo")} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Nº de Série do Backup</Form.Label>
                        <Form.Control type="text" className="bg-white border-0 shadow-sm py-2" placeholder="Ex: BRX123456" {...register("backup_numero_serie")} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Data de Disponibilização</Form.Label>
                        <Form.Control type="date" className="bg-white border-0 shadow-sm py-2" {...register("backup_data_disponibilizacao")} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Data de Retirada</Form.Label>
                        <Form.Control type="date" className="bg-white border-0 shadow-sm py-2" {...register("backup_data_retirada")} />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        )}

        {/* SEÇÃO 4: FINALIZAÇÃO */}
        {isEditMode && (
            <Accordion.Item eventKey="3" className="border-0 rounded overflow-hidden">
                <Accordion.Header>
                  <span className="fw-bold text-dark d-flex align-items-center">
                    <Check2All className="me-2 text-success" size={20} /> 4. Finalização do Chamado
                  </span>
                </Accordion.Header>
                <Accordion.Body className="bg-white border-top">
                    
                    <div className="bg-success bg-opacity-10 p-3 rounded mb-4 border border-success">
                      <Form.Group>
                        <Form.Check 
                          type="switch" 
                          id="concluiu-switch"
                          label={<span className="fw-bold text-dark ms-1">Chamado da assistência técnica foi concluído?</span>} 
                          {...register("assistencia_concluiu")} 
                        />
                      </Form.Group>
                    </div>

                    <Form.Group>
                      <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                        Parecer Final da Assistência {assistenciaConcluiu && <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        className="bg-light border-0 shadow-none" 
                        placeholder="Relato de como o problema foi resolvido..." 
                        {...register("parecer_final_assistencia")} 
                      />
                    </Form.Group>
                </Accordion.Body>
            </Accordion.Item>
        )}
      </Accordion>

      <div className="d-flex justify-content-end mt-4 pt-3 border-top">
        <PrimaryButton type="submit" isLoading={isLoading} className="px-4 fw-bold shadow-sm" variant={isEditMode ? "primary" : "success"}>
          {isEditMode ? '💾 Salvar Evolução do Chamado' : '🚀 Abrir Chamado de Atendimento'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default AtendimentoForm;