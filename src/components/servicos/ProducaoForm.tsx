// src/components/servicos/ProducaoForm.tsx
import React, { useState, useMemo } from 'react';
import { Form, Row, Col, Badge, InputGroup, Button, Alert } from 'react-bootstrap';
import { Search, StarFill, PcDisplay } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { CatalogoServico, ProducaoServico } from '../../types';

interface ProducaoFormData {
  servico_id: number;
  tipo_vinculo: 'pecas' | 'impressora' | 'eletronica' | 'glpi';
  vinculo_id: string;
  patrimonio_serie?: string; // 🚀 NOVO CAMPO
  observacoes: string;
}

interface ProducaoFormProps {
  catalogo: CatalogoServico[];
  historico: ProducaoServico[];
  user: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function ProducaoForm({ catalogo, historico, user, onSubmit, isLoading, onCancel }: ProducaoFormProps) {
  const [buscaServico, setBuscaServico] = useState('');
  
  const isGestor = user?.role === 'admin' || user?.role === 'gerente';

  const getDefaultVinculo = (): 'pecas' | 'impressora' | 'eletronica' | 'glpi' => {
    if (user?.role === 'tecnico_impressora') return 'impressora';
    if (user?.role === 'tecnico_eletronica') return 'eletronica';
    return 'pecas'; 
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProducaoFormData>({
    defaultValues: { tipo_vinculo: getDefaultVinculo() }
  });

  const tipoSelecionado = watch('tipo_vinculo');
  const servicoSelecionadoId = watch('servico_id');

  const categoriasPermitidas = useMemo(() => {
    if (isGestor) return null; 
    if (user?.role === 'tecnico_impressora') return ['Impressoras'];
    if (user?.role === 'tecnico_eletronica') return ['Manutenção Eletrônica'];
    return ['Infraestrutura / Redes', 'Suporte de Software', 'Outros'];
  }, [user, isGestor]);

  const servicosMaisFrequentes = useMemo(() => {
    if (!user) return [];
    const contagem: Record<number, number> = {};
    historico.filter(h => h.tecnico_id === user.id).forEach(h => {
      contagem[h.servico_id] = (contagem[h.servico_id] || 0) + 1;
    });
    const topIds = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => Number(e[0]));
    return catalogo.filter(c => topIds.includes(c.id));
  }, [historico, catalogo, user]);

  const catalogoFiltrado = useMemo(() => {
    return catalogo.filter(svc => {
      const matchCat = categoriasPermitidas ? categoriasPermitidas.includes(svc.categoria) : true;
      const matchBusca = svc.nome_servico.toLowerCase().includes(buscaServico.toLowerCase()) || svc.categoria.toLowerCase().includes(buscaServico.toLowerCase());
      return matchCat && matchBusca;
    });
  }, [catalogo, categoriasPermitidas, buscaServico]);

  const handleFormSubmit = (data: ProducaoFormData) => {
    const payload: any = { 
      servico_id: Number(data.servico_id), 
      observacoes: data.observacoes || null,
      patrimonio_serie: data.patrimonio_serie || null // 🚀 ENVIANDO O PATRIMÔNIO
    };

    if (data.tipo_vinculo === 'glpi') {
      payload.numero_glpi = String(data.vinculo_id);
    } else {
      const idVinculo = Number(data.vinculo_id);
      if (data.tipo_vinculo === 'pecas') payload.solicitacao_peca_id = idVinculo;
      if (data.tipo_vinculo === 'impressora') payload.atendimento_impr_id = idVinculo;
      if (data.tipo_vinculo === 'eletronica') payload.manutencao_eletr_id = idVinculo;
    }
    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <input type="hidden" {...register("servico_id", { required: "Selecione um serviço na lista." })} />

      {/* SEÇÃO 1: SERVIÇO */}
      <div className="mb-4 bg-light p-3 rounded border">
        <Form.Label className="fw-bold text-dark">1. Qual serviço executou?</Form.Label>
        
        {servicosMaisFrequentes.length > 0 && (
          <div className="mb-3">
            <span className="small text-muted fw-bold d-block mb-2"><StarFill className="text-warning me-1"/> Frequentes:</span>
            <div className="d-flex flex-wrap gap-2">
              {servicosMaisFrequentes.map(svc => (
                <Badge key={svc.id} bg={servicoSelecionadoId === svc.id ? 'primary' : 'white'} text={servicoSelecionadoId === svc.id ? 'white' : 'dark'}
                  className={`px-3 py-2 border shadow-sm ${servicoSelecionadoId === svc.id ? 'border-primary' : 'border-secondary'}`}
                  style={{ cursor: 'pointer' }} onClick={() => setValue('servico_id', svc.id, { shouldValidate: true })}>
                  {svc.nome_servico}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <InputGroup className="mb-2 shadow-sm">
          <InputGroup.Text className="bg-white text-muted"><Search /></InputGroup.Text>
          <Form.Control placeholder="Pesquisar catálogo..." value={buscaServico} onChange={(e) => setBuscaServico(e.target.value)} />
        </InputGroup>
        
        <div className="list-group shadow-sm" style={{ maxHeight: '180px', overflowY: 'auto' }}>
          {catalogoFiltrado.map(svc => (
            <button key={svc.id} type="button" onClick={() => setValue('servico_id', svc.id, { shouldValidate: true })}
              className={`list-group-item list-group-item-action py-2 ${servicoSelecionadoId === svc.id ? 'bg-primary bg-opacity-10 border-primary' : ''}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong className={servicoSelecionadoId === svc.id ? 'text-primary' : 'text-dark'}>{svc.nome_servico}</strong>
                  <small className="d-block text-muted">{svc.categoria}</small>
                </div>
                <Badge bg="success">R$ {Number(svc.valor_estimado).toFixed(2)}</Badge>
              </div>
            </button>
          ))}
          {catalogoFiltrado.length === 0 && (
            <div className="p-3 text-center text-muted small bg-white border">Nenhum serviço encontrado.</div>
          )}
        </div>
        {errors.servico_id && <div className="text-danger small fw-bold mt-2">{errors.servico_id.message}</div>}
      </div>

      {/* SEÇÃO 2: VÍNCULO */}
      <div className="mb-4">
        <Form.Label className="fw-bold text-dark">2. Vínculo do Chamado</Form.Label>
        <Row>
          <Col md={6}>
            <Form.Select {...register("tipo_vinculo")} className="shadow-sm border-primary mb-3">
              {(isGestor || (user?.role !== 'tecnico_impressora' && user?.role !== 'tecnico_eletronica')) && (
                <option value="pecas">Ordem de Serviço (Peças/Estoque)</option>
              )}
              {(isGestor || user?.role === 'tecnico_impressora') && (
                <option value="impressora">Atendimento Impressora</option>
              )}
              {(isGestor || user?.role === 'tecnico_eletronica') && (
                <option value="eletronica">Manutenção Eletrônica</option>
              )}
              <option value="glpi" className="fw-bold text-primary">Sem Peças (Apenas GLPI)</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Control 
              type={tipoSelecionado === 'glpi' ? 'text' : 'number'} 
              placeholder={tipoSelecionado === 'glpi' ? 'Nº do Ticket (Ex: 245123)' : 'Nº da OS (Ex: 152)'}
              {...register("vinculo_id", { required: true })} 
              isInvalid={!!errors.vinculo_id} 
              className="shadow-sm" 
            />
          </Col>
        </Row>

        {/* 🚀 LÓGICA DE EXIBIÇÃO DO PATRIMÔNIO (SÓ APARECE NO GLPI) */}
        {tipoSelecionado === 'glpi' ? (
          <Row className="mt-2">
            <Col md={12}>
              <div className="bg-primary bg-opacity-10 p-3 rounded border border-primary border-opacity-25">
                <Form.Group>
                  <Form.Label className="fw-bold small text-primary d-flex align-items-center mb-1">
                    <PcDisplay className="me-2" /> Patrimônio / Nº de Série do Equipamento
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ex: 123456 ou BR12345 (Opcional)"
                    {...register("patrimonio_serie")} 
                    className="shadow-sm" 
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Sendo um chamado externo, informe o patrimônio para podermos rastrear o índice de reincidência desta máquina.
                  </Form.Text>
                </Form.Group>
              </div>
            </Col>
          </Row>
        ) : (
          <Row className="mt-2">
            <Col md={12}>
              <Alert variant="secondary" className="border-0 shadow-sm py-2 px-3 small d-flex align-items-center mb-0">
                <i className="bi bi-info-circle-fill me-2 text-muted"></i>
                <span className="text-muted">O Patrimônio deste equipamento será extraído automaticamente da OS selecionada.</span>
              </Alert>
            </Col>
          </Row>
        )}
      </div>

      {/* SEÇÃO 3: OBSERVAÇÕES */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold text-dark">3. Observações (Opcional)</Form.Label>
        <Form.Control as="textarea" rows={2} {...register("observacoes")} className="shadow-sm" />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
        <Button variant="secondary" onClick={onCancel} className="fw-bold px-4">Cancelar</Button>
        <PrimaryButton type="submit" isLoading={isLoading} className="fw-bold px-4">Gravar Produção</PrimaryButton>
      </div>
    </Form>
  );
}