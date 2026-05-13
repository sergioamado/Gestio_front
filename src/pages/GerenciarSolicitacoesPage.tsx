// src/pages/GerenciarSolicitacoesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Spinner, Alert, Accordion, Row, Col, Form, Card, InputGroup } from 'react-bootstrap';
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

  // Atualizado para usar numero_glpi em vez de id_filtro, acompanhando o backend
  const [filters, setFilters] = useState({
    status: '',
    tecnico_id_filtro: '',
    numero_glpi: '' 
  });

  const fetchTecnicos = useCallback(async () => {
    if (user) {
      try {
        const unidadeId = user.role === 'admin' ? undefined : user.unidade_id;
        const tecnicosData = await usuarioService.getTecnicosByUnidade(unidadeId as number);
        setTecnicos(tecnicosData);
      } catch {
        setError('Falha ao carregar a equipe técnica da unidade.');
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
    if (filters.numero_glpi) params.numero_glpi = filters.numero_glpi;
    
    solicitacaoService.getAllSolicitacoes(params)
      .then(setSolicitacoes)
      .catch(() => setError('Falha ao buscar as Ordens de Serviço. Verifique a conexão.'))
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
    <MainLayout pageTitle="📋 Gerenciar Ordens de Serviço">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="shadow-sm border-0">
          {error}
        </Alert>
      )}

      {/* Painel de Filtros Modernizado */}
      <Card className="floating-card border-0 shadow-sm mb-4 bg-white border-start border-primary border-4">
        <Card.Body className="p-4">
          <Card.Title className="fw-bold mb-4 fs-5 text-dark">🔍 Filtros de Busca</Card.Title>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Status da OS</Form.Label>
                <Form.Select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                  className="bg-light border-0 shadow-none"
                >
                  <option value="">Todos os Status</option>
                  <option value="PENDENTE">⏳ Pendente (Aprovação)</option>
                  <option value="EM ATENDIMENTO">🛠️ Em Atendimento</option>
                  <option value="CONCLUIDA">✅ Concluída</option>
                  <option value="CANCELADA">❌ Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Técnico Responsável</Form.Label>
                <Form.Select 
                  name="tecnico_id_filtro" 
                  value={filters.tecnico_id_filtro} 
                  onChange={handleFilterChange}
                  className="bg-light border-0 shadow-none"
                >
                  <option value="">Toda a Equipe</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.id}>{t.nome_completo}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
               <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Buscar por Nº GLPI</Form.Label>
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-0 text-muted fw-bold">#</InputGroup.Text>
                  <Form.Control 
                    type="number" 
                    name="numero_glpi" 
                    value={filters.numero_glpi} 
                    onChange={handleFilterChange} 
                    placeholder="Ex: 12345" 
                    className="bg-light border-0 shadow-none"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Solicitações */}
      {loading ? (
        <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted fw-medium">Buscando Ordens de Serviço...</div>
        </div>
      ) : solicitacoes.length > 0 ? (
        <Card className="floating-card border-0 shadow-sm p-3 bg-transparent">
            <Accordion alwaysOpen className="custom-accordion">
            {solicitacoes.map(s => (
                <SolicitacaoItem 
                key={s.id} 
                solicitacao={s} 
                onUpdate={fetchSolicitacoes}
                />
            ))}
            </Accordion>
        </Card>
      ) : (
        <div className="text-center text-muted p-5 bg-white rounded shadow-sm border mt-4">
            <span className="fs-1 d-block mb-3">📭</span>
            <h5 className="fw-bold text-dark">Nenhuma Ordem de Serviço encontrada.</h5>
            <p className="mb-0">Ajuste os filtros de busca acima ou aguarde a abertura de novos chamados.</p>
        </div>
      )}
    </MainLayout>
  );
}

export default GerenciarSolicitacoesPage;