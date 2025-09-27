// src/pages/NovaSolicitacao.tsx
import React, 'react';
import { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  ListGroup,
  InputGroup,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getTecnicos } from '../services/usuarioService';
import { getAllItems } from '../services/itemService';
import { createSolicitacao } from '../services/solicitacaoService';
import type { Usuario } from '../services/usuarioService';
import type { Item } from '../services/itemService';
import { useNavigate } from 'react-router-dom';

interface CarrinhoItem extends Item {
  quantidadeSolicitada: number;
}

const NovaSolicitacao = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário e dados
  const [formData, setFormData] = useState({
    setor_equipamento: '',
    numero_glpi: '',
    patrimonio: '',
    responsavel_usuario_id: '',
  });
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [itensDisponiveis, setItensDisponiveis] = useState<Item[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);

  // MELHORIA: Estado para o termo de busca dos itens
  const [filtroItem, setFiltroItem] = useState('');

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tecnicosData, itensData] = await Promise.all([
          getTecnicos(),
          getAllItems(),
        ]);
        setTecnicos(tecnicosData);
        setItensDisponiveis(itensData.filter((item) => item.quantidade > 0));
      } catch (err) {
        setError('Falha ao carregar dados iniciais. Tente recarregar a página.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const adicionarAoCarrinho = (item: Item) => {
    if (carrinho.some((cartItem) => cartItem.id === item.id)) {
      return;
    }
    setCarrinho((prev) => [...prev, { ...item, quantidadeSolicitada: 1 }]);
  };

  const removerDoCarrinho = (itemId: number) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== itemId));
  };

  // CORREÇÃO: Validação para impedir quantidade menor que 1
  const atualizarQuantidadeCarrinho = (itemId: number, quantidade: number) => {
    const valorNumerico = Math.floor(quantidade); // Garante que seja um inteiro
    if (valorNumerico < 1) {
      // Impede que a quantidade seja menor que 1
      return;
    }
    setCarrinho((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantidadeSolicitada: valorNumerico }
          : item
      )
    );
  };
  
  // MELHORIA: Memoiza a lista filtrada de itens para evitar re-renderizações desnecessárias
  const itensFiltrados = useMemo(() => {
    if (!filtroItem) {
      return itensDisponiveis;
    }
    return itensDisponiveis.filter((item) =>
      item.descricao.toLowerCase().includes(filtroItem.toLowerCase())
    );
  }, [itensDisponiveis, filtroItem]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CORREÇÃO: Validação segura dos dados do usuário
    if (!user || !user.unidade_id) {
      setError('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    if (!formData.responsavel_usuario_id || carrinho.length === 0) {
      setError('Preencha todos os campos obrigatórios e adicione pelo menos um item ao carrinho.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await createSolicitacao({
        ...formData,
        responsavel_usuario_id: Number(formData.responsavel_usuario_id),
        unidade_id: user.unidade_id, // Acesso seguro
        itens: carrinho.map((item) => ({
          id: item.id,
          quantidade: item.quantidadeSolicitada,
        })),
      });
      alert('Solicitação criada com sucesso!');
      navigate('/');
    } catch (err) {
      setError('Ocorreu um erro ao criar a solicitação.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    // CORREÇÃO: Envolve tudo em um Container para layout consistente
    <Container className="py-4">
      <h1>Nova Solicitação de Material</h1>
      <hr />

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header as="h5">1. Dados da Solicitação</Card.Header>
          <Card.Body>
            {/* CORREÇÃO: Estrutura correta de Row > Col > Form.Group */}
            <Row className="mb-3">
              <Form.Group as={Col} md={4} controlId="setor_equipamento">
                <Form.Label>Setor do Equipamento</Form.Label>
                <Form.Control type="text" name="setor_equipamento" value={formData.setor_equipamento} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="numero_glpi">
                <Form.Label>Nº GLPI</Form.Label>
                <Form.Control type="text" name="numero_glpi" value={formData.numero_glpi} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="patrimonio">
                <Form.Label>Patrimônio</Form.Label>
                <Form.Control type="text" name="patrimonio" value={formData.patrimonio} onChange={handleFormChange} />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Col} md={12} controlId="responsavel_usuario_id">
                <Form.Label>Técnico Responsável *</Form.Label>
                <Form.Select name="responsavel_usuario_id" value={formData.responsavel_usuario_id} onChange={handleFormChange} required>
                  <option value="">Selecione um técnico...</option>
                  {tecnicos.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome_completo}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
          </Card.Body>
        </Card>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Header as="h5">2. Itens Disponíveis</Card.Header>
              {/* MELHORIA: Campo de filtro */}
              <Card.Body className="p-2">
                <InputGroup>
                  <InputGroup.Text>🔎</InputGroup.Text>
                  <Form.Control type="text" placeholder="Buscar item..." value={filtroItem} onChange={(e) => setFiltroItem(e.target.value)} />
                </InputGroup>
              </Card.Body>
              <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {itensFiltrados.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.descricao}</strong>
                      <small className="d-block text-muted">Em estoque: {item.quantidade}</small>
                    </div>
                    <Button size="sm" onClick={() => adicionarAoCarrinho(item)} disabled={carrinho.some((ci) => ci.id === item.id)}>
                      Adicionar
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Header as="h5">3. Carrinho da Solicitação *</Card.Header>
              <ListGroup variant="flush" style={{ minHeight: '400px', maxHeight: '400px', overflowY: 'auto' }}>
                {carrinho.length === 0 ? (
                  <ListGroup.Item className="text-center text-muted">O carrinho está vazio.</ListGroup.Item>
                ) : (
                  carrinho.map((item) => (
                    <ListGroup.Item key={item.id}>
                      <strong>{item.descricao}</strong>
                      <Row className="align-items-center mt-2">
                        <Col xs={7}>
                          <InputGroup>
                            <InputGroup.Text>Qtd.</InputGroup.Text>
                            <Form.Control
                              type="number"
                              value={item.quantidadeSolicitada}
                              min={1}
                              max={item.quantidade}
                              onChange={(e) => atualizarQuantidadeCarrinho(item.id, Number(e.target.value))}
                              onBlur={(e) => { // Garante que o valor não fique vazio
                                if (e.target.value === '') {
                                    atualizarQuantidadeCarrinho(item.id, 1);
                                }
                              }}
                            />
                          </InputGroup>
                        </Col>
                        <Col xs={5} className="text-end">
                          <Button variant="outline-danger" size="sm" onClick={() => removerDoCarrinho(item.id)}>Remover</Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>

        <div className="mt-4 text-end">
          <Button type="submit" size="lg" disabled={submitting || carrinho.length === 0}>
            {submitting ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : 'Registrar Solicitação'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default NovaSolicitacao;