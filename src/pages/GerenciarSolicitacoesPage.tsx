// src/pages/GerenciarSolicitacoesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Spinner, Alert, Accordion, Row, Col, Form, Card } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import * as solicitacaoService from '../services/solicitacaoService';
import * as usuarioService from '../services/usuarioService';
import type { SolicitacaoDetalhada, User } from '../types';
import SolicitacaoItem from '../components/solicitacoes/SolicitacaoItem';

function GerenciarSolicitacoesPage() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDetalhada[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    tecnico_id_filtro: '',
    id_filtro: ''
  });

  const fetchTecnicos = useCallback(async () => {
    if (user) {
      try {
        const unidadeId = user.role === 'admin' ? undefined : user.unidade_id;
        const tecnicosData = await usuarioService.getTecnicosByUnidade(unidadeId as number);
        setTecnicos(tecnicosData);
      } catch {
        setError('Falha ao carregar a lista de técnicos.');
      }
    }
  }, [user]);

  const fetchSolicitacoes = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const params: any = {};
    if (user.role !== 'admin') params.unidade_id = user.unidade_id;
    if (filters.status) params.status = filters.status;
    if (filters.tecnico_id_filtro) params.tecnico_id_filtro = filters.tecnico_id_filtro;
    if (filters.id_filtro) params.id_filtro = filters.id_filtro;
    
    solicitacaoService.getAllSolicitacoes(params)
      .then(setSolicitacoes)
      .catch(() => setError('Falha ao carregar solicitações.'))
      .finally(() => setLoading(false));
  }, [user, filters]);

  useEffect(() => {
    fetchTecnicos();
  }, [fetchTecnicos]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const handleFilterChange = (e: React.ChangeEvent<any>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  return (
    <MainLayout pageTitle="📋 Gerenciar Solicitações">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="floating-card mb-4">
        <Card.Header as="h5">Filtros</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Técnico Responsável</Form.Label>
                <Form.Select name="tecnico_id_filtro" value={filters.tecnico_id_filtro} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
               <Form.Group>
                <Form.Label>Buscar por ID</Form.Label>
                <Form.Control type="number" name="id_filtro" value={filters.id_filtro} onChange={handleFilterChange} placeholder="Digite o ID da solicitação..." />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" /></div>
      ) : solicitacoes.length > 0 ? (
        <Accordion alwaysOpen>
          {solicitacoes.map(s => (
            <SolicitacaoItem 
              key={s.id} 
              solicitacao={s} 
              onUpdate={fetchSolicitacoes}
            />
          ))}
        </Accordion>
      ) : (
        <Alert variant="info">Nenhuma solicitação encontrada com os filtros aplicados.</Alert>
      )}
    </MainLayout>
  );
}

export default GerenciarSolicitacoesPage;