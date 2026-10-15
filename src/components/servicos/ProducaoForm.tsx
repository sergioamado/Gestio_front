// src/components/servicos/ProducaoForm.tsx
import React, { useState, useMemo } from 'react';
import { Form, Row, Col, Badge, InputGroup, Button, Card, Table, Alert } from 'react-bootstrap';
import { Search, CheckCircleFill, TrashFill, StarFill, InfoCircleFill, Plus, Dash } from 'react-bootstrap-icons';
import type { CatalogoServico, ProducaoServico } from '../../types';

export interface ProducaoFormProps {
  catalogo?: CatalogoServico[];
  historico?: ProducaoServico[];
  user: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
  defaultTipoVinculo?: 'pecas' | 'impressora' | 'eletronica' | 'glpi';
  defaultVinculoId?: string;
  defaultPatrimonio?: string;
}

// Nova interface local para o Carrinho suportar a Quantidade
interface ItemCarrinho extends CatalogoServico {
  quantidade: number;
}

export default function ProducaoForm({ 
  catalogo = [], 
  historico = [], 
  user, 
  onSubmit, 
  isLoading, 
  onCancel, 
  defaultTipoVinculo, 
  defaultVinculoId, 
  defaultPatrimonio 
}: ProducaoFormProps) {
  
  const isGestor = user?.role === 'admin' || user?.role === 'gerente';

  const [tipoVinculo, setTipoVinculo] = useState(defaultTipoVinculo || (user?.role === 'tecnico_impressora' ? 'impressora' : user?.role === 'tecnico_eletronica' ? 'eletronica' : 'pecas'));
  const [vinculoId, setVinculoId] = useState(defaultVinculoId || '');
  const [patrimonioSerie, setPatrimonioSerie] = useState(defaultPatrimonio || '');
  const [observacoes, setObservacoes] = useState('');

  const [buscaServico, setBuscaServico] = useState('');
  
  // O carrinho agora guarda objetos do tipo ItemCarrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const categoriasPermitidas = useMemo(() => {
    if (isGestor) return null; 
    if (user?.role === 'tecnico_impressora') return ['Impressoras'];
    if (user?.role === 'tecnico_eletronica') return ['Manutenção Eletrônica'];
    return ['Infraestrutura / Redes', 'Suporte de Software', 'Outros'];
  }, [user, isGestor]);

  const servicosMaisFrequentes = useMemo(() => {
    if (!user || !historico.length || !catalogo.length) return [];
    const contagem: Record<number, number> = {};
    historico.filter(h => h.tecnico_id === user.id).forEach(h => {
      contagem[h.servico_id] = (contagem[h.servico_id] || 0) + 1;
    });
    const topIds = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => Number(e[0]));
    return catalogo.filter(c => topIds.includes(c.id));
  }, [historico, catalogo, user]);

  const catalogoFiltrado = useMemo(() => {
    if (!catalogo.length) return [];
    return catalogo.filter(svc => {
      const matchCat = categoriasPermitidas ? categoriasPermitidas.includes(svc.categoria) : true;
      const matchBusca = svc.nome_servico.toLowerCase().includes(buscaServico.toLowerCase()) || svc.categoria.toLowerCase().includes(buscaServico.toLowerCase());
      return matchCat && matchBusca;
    });
  }, [catalogo, categoriasPermitidas, buscaServico]);

  // Adiciona ao carrinho com quantidade = 1
  const adicionarAoCarrinho = (servico: CatalogoServico) => {
    if (!carrinho.find(c => c.id === servico.id)) {
      setCarrinho([...carrinho, { ...servico, quantidade: 1 }]);
    }
  };

  const removerDoCarrinho = (id: number) => {
    setCarrinho(carrinho.filter(c => c.id !== id));
  };

  // Nova função para alterar a quantidade de um item no carrinho
  const alterarQuantidade = (id: number, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta); // Não deixa baixar de 1
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (carrinho.length === 0) return;

    //  Agora envia um Array de objetos (id e quantidade) em vez de apenas IDs
    const payload: any = { 
      servicos: carrinho.map(c => ({ id: c.id, quantidade: c.quantidade })),
      observacoes: observacoes || null,
      patrimonio_serie: patrimonioSerie || null,
      tipo_vinculo: tipoVinculo,
      vinculo_id: vinculoId
    };

    if (tipoVinculo === 'glpi') {
      payload.numero_glpi = String(vinculoId);
    } else {
      const idNumerico = Number(vinculoId);
      if (tipoVinculo === 'pecas') payload.solicitacao_peca_id = idNumerico;
      if (tipoVinculo === 'impressora') payload.atendimento_impr_id = idNumerico;
      if (tipoVinculo === 'eletronica') payload.manutencao_eletr_id = idNumerico;
    }

    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <Card className="border-0 shadow-sm mb-4 border-start border-primary border-4 bg-light">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">Módulo / Origem</Form.Label>
                <Form.Select value={tipoVinculo} onChange={e => setTipoVinculo(e.target.value as any)} disabled={!!defaultTipoVinculo} className="fw-bold shadow-sm border-0">
                  <option value="pecas">OS de Peças (Estoque)</option>
                  <option value="impressora">Atendimento Impressora</option>
                  <option value="eletronica">Manutenção Eletrônica</option>
                  <option value="glpi">GLPI</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">Nº do Chamado/OS</Form.Label>
                <Form.Control type="text" value={vinculoId} onChange={e => setVinculoId(e.target.value)} disabled={!!defaultVinculoId} required placeholder="Ex: 152" className="fw-bold text-primary shadow-sm border-0"/>
              </Form.Group>
            </Col>

            {tipoVinculo === 'glpi' ? (
              <Col md={6}>
                 <Form.Group>
                  <Form.Label className="fw-bold text-secondary small text-uppercase mb-1 d-flex align-items-center">
                    Patrimônio do Equipamento
                  </Form.Label>
                  <Form.Control type="text" value={patrimonioSerie} onChange={e => setPatrimonioSerie(e.target.value)} placeholder="Ex: 123456" className="shadow-sm border-0"/>
                </Form.Group>
              </Col>
            ) : (
              <Col md={6}>
                 <Alert variant="secondary" className="border-0 shadow-sm py-2 px-3 small d-flex align-items-center mb-0 h-100">
                  <InfoCircleFill className="me-2 text-muted" />
                  <span className="text-muted">O Patrimônio será extraído automaticamente da OS.</span>
                </Alert>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100 bg-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 fs-5 text-dark">📚 Catálogo de Serviços</h6>
                  <Badge bg="primary" className="rounded-pill px-3">{catalogoFiltrado.length} disponíveis</Badge>
              </div>
              
              {servicosMaisFrequentes.length > 0 && (
                <div className="mb-3 d-flex gap-2 overflow-auto custom-scrollbar pb-1">
                  {servicosMaisFrequentes.map(svc => (
                     <Badge key={`freq-${svc.id}`} bg="warning" text="dark" className="px-3 py-2 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => adicionarAoCarrinho(svc)}>
                       <StarFill className="me-1"/> {svc.nome_servico}
                     </Badge>
                  ))}
                </div>
              )}

              <InputGroup className="mb-3 shadow-sm">
                <InputGroup.Text className="bg-white border-end-0"><Search /></InputGroup.Text>
                <Form.Control className="border-start-0 bg-white" placeholder="Pesquisar serviço..." value={buscaServico} onChange={(e) => setBuscaServico(e.target.value)} />
              </InputGroup>

              <div style={{ maxHeight: '550px', overflowY: 'auto' }} className="pe-2 custom-scrollbar">
                <Row className="g-2">
                  {catalogoFiltrado.length === 0 ? (
                      <div className="text-center text-muted mt-4 w-100">Nenhum serviço encontrado.</div>
                  ) : (
                      catalogoFiltrado.map(svc => {
                        const noCarrinho = carrinho.some(c => c.id === svc.id);
                        return (
                          <Col md={12} key={svc.id}>
                              <Card className={`border shadow-sm ${noCarrinho ? 'border-success bg-success bg-opacity-10' : 'bg-white'}`}>
                                  <Card.Body className="d-flex justify-content-between align-items-center p-2">
                                      <div>
                                          <strong className="d-block text-dark lh-sm">{svc.nome_servico}</strong>
                                          <small className="text-muted">{svc.categoria}</small>
                                      </div>
                                      <div className="d-flex align-items-center gap-3">
                                          <Badge bg="success" className="fs-6">R$ {Number(svc.valor_estimado).toFixed(2)}</Badge>
                                          {noCarrinho ? (
                                            <Button variant="success" size="sm" disabled className="rounded-circle px-2 py-1"><CheckCircleFill/></Button>
                                          ) : (
                                            <Button variant="outline-primary" size="sm" className="fw-bold px-3" onClick={() => adicionarAoCarrinho(svc)}>+ Lançar</Button>
                                          )}
                                      </div>
                                  </Card.Body>
                              </Card>
                          </Col>
                      )})
                  )}
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/*  Coluna dos Serviços Executados ajustada para suportar a QTD */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100 border-start border-success border-4 bg-light">
            <Card.Body className="d-flex flex-column p-3">
              <h6 className="fw-bold mb-3 fs-5 text-dark">✅ Serviços Executados</h6>
              
              {carrinho.length === 0 ? (
                <div className="text-center text-muted p-4 bg-white rounded shadow-sm border flex-grow-1 d-flex flex-column justify-content-center">
                  <h5 className="fw-bold">Lista Vazia</h5>
                  <p className="small mb-0">Selecione os serviços que você realizou.</p>
                </div>
              ) : (
                <div className="flex-grow-1 bg-white rounded shadow-sm border" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <Table hover className="align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Serviço</th>
                        <th className="text-center" style={{ width: '120px' }}>Qtd.</th>
                        <th className="text-end pe-3" style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrinho.map(item => (
                        <tr key={item.id}>
                          <td className="ps-3 fw-bold text-dark lh-sm">{item.nome_servico}</td>
                          <td className="text-center">
                            {/*  CONTROLADOR DE QUANTIDADE */}
                            <InputGroup size="sm" className="flex-nowrap justify-content-center">
                              <Button variant="outline-secondary" onClick={() => alterarQuantidade(item.id, -1)} className="px-2" disabled={item.quantidade <= 1}>
                                <Dash />
                              </Button>
                              <Form.Control 
                                value={item.quantidade} 
                                readOnly 
                                className="text-center fw-bold bg-white" 
                                style={{ maxWidth: '45px' }} 
                              />
                              <Button variant="outline-secondary" onClick={() => alterarQuantidade(item.id, 1)} className="px-2">
                                <Plus />
                              </Button>
                            </InputGroup>
                          </td>
                          <td className="text-end pe-3">
                            <Button variant="link" className="text-danger p-0 fs-5 text-decoration-none" onClick={() => removerDoCarrinho(item.id)}><TrashFill /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="mt-3">
                <Form.Group>
                  <Form.Label className="fw-bold text-secondary small">Observações da Execução (Opcional)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} className="shadow-sm border-0"/>
                </Form.Group>
              </div>

              <div className="mt-3 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                      <span className="text-muted fw-bold text-uppercase small">Total Produzido</span>
                      <span className="fs-4 fw-bold text-success">
                          {/* Total agora é a soma de (Preço * Quantidade) */}
                          R$ {carrinho.reduce((acc, curr) => acc + (Number(curr.valor_estimado) * curr.quantidade), 0).toFixed(2)}
                      </span>
                  </div>

                  <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={onCancel} className="fw-bold px-4 shadow-sm">Cancelar</Button>
                    <Button variant="success" type="submit" disabled={isLoading || carrinho.length === 0} className="fw-bold flex-grow-1 shadow-sm">
                      {isLoading ? 'Gravando...' : 'Gravar Produção'}
                    </Button>
                  </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Form>
  );
}