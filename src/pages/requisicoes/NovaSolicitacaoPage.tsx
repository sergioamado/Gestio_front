// src/pages/NovaSolicitacaoPage.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../hooks/useAuth';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';
import type { Item } from '../../types';

import * as itemService from '../../services/itemService';
import * as solicitacaoService from '../../services/solicitacaoService';

interface ItemCarrinho extends Item {
  quantidadeSelecionada: number;
}

function NovaSolicitacaoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();
  
  const [itensDisponiveis, setItensDisponiveis] = useState<Item[]>([]);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  
  const [glpi, setGlpi] = useState('');
  const [setorEquipamento, setSetorEquipamento] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [tipoRequisicao, setTipoRequisicao] = useState('PEDIDO'); 
  const [justificativa, setJustificativa] = useState('');
  
  const [loading, setLoading] = useState(false);

  //  Verifica se o usuário logado é administrador
  const isAdmin = user?.role === 'admin';

 useEffect(() => {
    const fetchItens = async () => {
      try {
        const res = await itemService.getAllItems();
        const arrayItens = Array.isArray(res) ? res : (res.data || []);
        setItensDisponiveis(arrayItens);
      } catch (error) {
        mostrarCard('Erro', 'Falha ao buscar itens do catálogo.', 'erro');
      }
    };
    fetchItens();
  }, [mostrarCard]);

  const adicionarAoCarrinho = (item: Item) => {
    const itemJaExiste = carrinho.find(c => c.id === item.id);
    if (itemJaExiste) {
      if (itemJaExiste.quantidadeSelecionada >= item.quantidade) {
        mostrarCard('Aviso de Estoque', 'Você já selecionou todo o estoque disponível desta peça.', 'alerta');
        return;
      }
      setCarrinho(carrinho.map(c => 
        c.id === item.id ? { ...c, quantidadeSelecionada: c.quantidadeSelecionada + 1 } : c
      ));
    } else {
      setCarrinho([...carrinho, { ...item, quantidadeSelecionada: 1 }]);
    }
  };

  const ajustarQuantidade = (id: number, delta: number) => {
    setCarrinho(carrinho.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantidadeSelecionada + delta;
        if (novaQtd > item.quantidade) {
          mostrarCard('Aviso de Estoque', `Estoque máximo atingido (${item.quantidade} unid.)`, 'alerta');
          return item;
        }
        if (novaQtd < 1) return item; 
        
        return { ...item, quantidadeSelecionada: novaQtd };
      }
      return item;
    }));
  };

  const removerDoCarrinho = (id: number) => {
    setCarrinho(carrinho.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //  Trava de segurança extra caso o admin tente submeter por código/atalho
    if (isAdmin) {
      mostrarCard('Ação Não Permitida', 'Contas de Administrador não possuem unidade atrelada e não podem gerar solicitações.', 'alerta');
      return;
    }

    if (carrinho.length === 0) {
      mostrarCard('Carrinho Vazio', 'Adicione pelo menos um item da lista antes de finalizar.', 'alerta');
      return;
    }

    setLoading(true);

    try {
      // 1. Verificação Inteligente de Duplicidade
      try {
        const respostaBusca = await solicitacaoService.getAllSolicitacoes({ numero_glpi: glpi, status: 'PENDENTE' });
        const duplicados = respostaBusca.data ? respostaBusca.data : (Array.isArray(respostaBusca) ? respostaBusca : []);
        
        if (duplicados.length > 0) {
          const prosseguir = await confirmar({
            titulo: '⚠️ Chamado Duplicado Identificado',
            mensagem: `Já existe uma Ordem de Serviço pendente para a máquina GLPI #${glpi}. Tem certeza de que deseja abrir um novo chamado para o mesmo equipamento?`,
            textoConfirmar: 'Sim, Prosseguir e Abrir OS',
            textoCancelar: 'Cancelar',
            varianteBotao: 'warning'
          });
          
          if (!prosseguir) {
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Aviso: Falha não-crítica ao verificar duplicidade.", err);
      }

      // 2. Salvar OS
      const payload = {
        responsavel_usuario_id: user?.id,
        unidade_id: user?.unidade_id || 1,
        numero_glpi: Number(glpi),
        setor_equipamento: setorEquipamento,
        patrimonio: patrimonio,
        tipo_requisicao: tipoRequisicao,
        justificativa,
        itens: carrinho.map(c => ({ id: c.id, quantidade: c.quantidadeSelecionada }))
      };

      await solicitacaoService.createSolicitacao(payload as any);

      mostrarCard('Sucesso!', 'Ordem de Serviço gerada com sucesso!', 'sucesso');
      
      setCarrinho([]);
      setGlpi('');
      setSetorEquipamento('');
      setPatrimonio('');
      setJustificativa('');
      
      const irParaGerenciar = await confirmar({
        titulo: '✅ OS Criada com Sucesso!',
        mensagem: 'Sua solicitação foi registrada. Deseja ir para a tela de Gerenciar Solicitações para acompanhar o chamado ou deseja continuar nesta tela para abrir outra OS?',
        textoConfirmar: 'Ir para Gerenciar',
        textoCancelar: 'Continuar aqui',
        varianteBotao: 'success'
      });

      if (irParaGerenciar) {
        navigate('/gerenciar-solicitacoes');
      }

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Falha na comunicação com o servidor.';
      mostrarCard('Erro de Cadastro', errorMsg, 'erro');
    } finally {
      setLoading(false);
    }
  };

  const itensFiltrados = itensDisponiveis.filter(item => 
    item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    (item.codigo_sipac && item.codigo_sipac.includes(busca))
  );

  return (
    <MainLayout pageTitle="Nova Solicitação de Material">
      
      {/*  Alerta informativo exibido exclusivamente para Administradores */}
      {isAdmin && (
        <Alert variant="info" className="shadow-sm border-0 mb-4 d-flex align-items-center">
          <span className="fs-4 me-3">ℹ️</span>
          <div>
            <strong>Modo de Consulta:</strong> Como perfil de Administrador, você pode visualizar o catálogo e testar a interface livremente, mas a abertura de ordens de serviço é restrita a técnicos e gerentes vinculados a uma unidade.
          </div>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="floating-card border-0 shadow-sm mb-4 border-start border-primary border-4">
          <Card.Body className="p-4">
            <Card.Title className="fw-bold mb-4 fs-5 text-dark">🛠️ Identificação da Ordem de Serviço</Card.Title>
            <Row className="g-3">
              <Form.Group as={Col} md="2">
                <Form.Label className="fw-bold text-secondary">Nº GLPI</Form.Label>
                <Form.Control 
                  type="number" 
                  size="lg"
                  className="bg-light fw-bold text-primary"
                  placeholder="Ex: 12945" 
                  value={glpi}
                  onChange={(e) => setGlpi(e.target.value)}
                  required 
                />
              </Form.Group>
              
              <Form.Group as={Col} md="4">
                <Form.Label className="fw-bold text-secondary">Setor do Equipamento</Form.Label>
                <Form.Control 
                  type="text" 
                  size="lg"
                  className="bg-light text-uppercase"
                  placeholder="Ex: Secretaria, Laboratório 01..." 
                  value={setorEquipamento}
                  onChange={(e) => setSetorEquipamento(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="3">
                <Form.Label className="fw-bold text-secondary">Nº Patrimônio (UFS)</Form.Label>
                <Form.Control 
                  type="text" 
                  size="lg"
                  className="bg-light fw-bold"
                  placeholder="Ex: 213456" 
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="3">
                <Form.Label className="fw-bold text-secondary">Tipo de Requisição</Form.Label>
                <Form.Select 
                  size="lg"
                  className="bg-light fw-bold"
                  value={tipoRequisicao}
                  onChange={(e) => setTipoRequisicao(e.target.value)}
                >
                  <option value="PEDIDO">📦 Consumo / Pedido</option>
                  <option value="TESTE">🔍 Teste / Empréstimo</option>
                </Form.Select>
              </Form.Group>
            </Row>

            <Row className="mt-4">
              <Form.Group as={Col} md="12">
                <Form.Label className="fw-bold text-secondary">Justificativa / Diagnóstico Técnico</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  className="bg-light"
                  placeholder="Descreva o problema e a necessidade da peça..." 
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
              </Form.Group>
            </Row>
          </Card.Body>
        </Card>

        <Row className="g-4">
          <Col lg={7}>
            <Card className="floating-card border-0 shadow-sm h-100 bg-white">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Card.Title className="fw-bold mb-0 fs-5 text-dark">📦 Catálogo de Peças (COSUP)</Card.Title>
                    <Badge bg="primary" className="fs-6 px-3 py-2 rounded-pill shadow-sm">{itensFiltrados.length} Itens</Badge>
                </div>
                
                <InputGroup className="mb-4 shadow-sm" size="lg">
                  <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                  <Form.Control
                    className="border-start-0 bg-white"
                    placeholder="Buscar por nome ou código..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </InputGroup>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="pe-2 custom-scrollbar">
                  <Row className="g-3">
                    {itensFiltrados.length === 0 ? (
                        <div className="text-center text-muted mt-5 w-100">
                          <span className="fs-1 d-block mb-3">📭</span>
                          <p>Nenhuma peça encontrada.</p>
                        </div>
                    ) : (
                        itensFiltrados.map(item => (
                            <Col md={6} key={item.id}>
                                <Card className={`h-100 border-0 shadow-sm ${item.quantidade === 0 ? 'opacity-50 bg-light' : 'bg-white'} ${item.is_permanente ? 'border-start border-warning border-4' : 'border'}`}>
                                    <Card.Body className="d-flex flex-column p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="fw-bold text-dark fs-6 mb-0 lh-base text-uppercase">{item.descricao}</h6>
                                            {item.is_permanente && <Badge bg="warning" text="dark" className="ms-2">Permanente</Badge>}
                                        </div>
                                        <div className="mb-3 text-muted small">
                                            <div className="d-flex align-items-center mb-1">
                                              <span className="me-2">Estoque:</span>
                                              <Badge bg={item.quantidade > 5 ? "success" : item.quantidade > 0 ? "warning" : "danger"}>
                                                  {item.quantidade} unid.
                                              </Badge>
                                            </div>
                                            {item.codigo_sipac && <div>SIPAC: <strong>{item.codigo_sipac}</strong></div>}
                                            {item.patrimonio_item && <div className="text-primary mt-1">Patrimônio COSUP: <strong>{item.patrimonio_item}</strong></div>}
                                        </div>
                                        <Button 
                                            variant={item.is_permanente ? "warning" : "outline-primary"} 
                                            className={`mt-auto fw-bold w-100 ${item.is_permanente ? 'text-dark' : ''}`}
                                            disabled={item.quantidade === 0}
                                            onClick={() => adicionarAoCarrinho(item)}
                                        >
                                            {item.is_permanente ? '🛠️ Requisitar Ferramenta' : '+ Adicionar'}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="floating-card border-0 shadow-sm h-100 border-start border-success border-4 bg-light">
              <Card.Body className="d-flex flex-column p-4">
                <Card.Title className="fw-bold mb-4 fs-5 text-dark">🛒 Peças Solicitadas</Card.Title>
                
                {carrinho.length === 0 ? (
                  <div className="text-center text-muted p-5 bg-white rounded shadow-sm border flex-grow-1 d-flex flex-column justify-content-center">
                    <span className="fs-1 mb-3">📦</span>
                    <h5 className="fw-bold">Seu carrinho está vazio</h5>
                    <p className="mb-0">Adicione peças do catálogo ao lado.</p>
                  </div>
                ) : (
                  <div className="flex-grow-1 bg-white rounded shadow-sm border p-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table hover className="align-middle mb-0">
                      <tbody>
                        {carrinho.map(item => (
                          <tr key={item.id}>
                            <td className="ps-3 w-50">
                              <span className="fw-bold text-dark d-block text-uppercase" style={{ fontSize: '0.95rem' }}>{item.descricao}</span>
                              {item.is_permanente && <Badge bg="warning" text="dark" className="mt-1" style={{fontSize: '0.7rem'}}>Devolver após uso</Badge>}
                            </td>
                            <td className="px-2" style={{ width: '130px' }}>
                                <InputGroup size="sm" className="shadow-sm">
                                    <Button variant="outline-secondary" className="fw-bold" onClick={() => ajustarQuantidade(item.id, -1)}>-</Button>
                                    <Form.Control className="text-center fw-bold bg-white border-secondary" value={item.quantidadeSelecionada} readOnly />
                                    <Button variant="outline-secondary" className="fw-bold" onClick={() => ajustarQuantidade(item.id, 1)}>+</Button>
                                </InputGroup>
                            </td>
                            <td className="text-end pe-3">
                              <Button variant="link" className="text-danger p-0 fs-5 text-decoration-none" onClick={() => removerDoCarrinho(item.id)} title="Remover Peça">
                                🗑️
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <div className="mt-4 pt-4 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                        <span className="text-muted fw-bold text-uppercase" style={{letterSpacing: '1px'}}>Total de Itens</span>
                        <span className="fs-3 fw-bold text-dark">
                            {carrinho.reduce((acc, curr) => acc + curr.quantidadeSelecionada, 0)}
                        </span>
                    </div>

                    {/*  Botão desativado para o Administrador com tooltip/texto explicativo */}
                    <Button 
                      variant={isAdmin ? "secondary" : "success"}
                      size="lg" 
                      className="w-100 fw-bold shadow-sm py-3 fs-5" 
                      type="submit" 
                      disabled={loading || carrinho.length === 0 || isAdmin}
                      title={isAdmin ? "Administradores não podem gerar solicitações" : ""}
                    >
                        {isAdmin ? '🔒 Indisponível para Administradores' : (loading ? (
                          <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Registrando...</>
                        ) : '🚀 Finalizar Solicitação')}
                    </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </MainLayout>
  );
}

export default NovaSolicitacaoPage;