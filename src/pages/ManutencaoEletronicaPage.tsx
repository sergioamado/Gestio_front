// src/pages/ManutencaoEletronicaPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Spinner, Alert, Row, Col, Card, Form } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import ModalForm from '../components/ModalForm';
import type { ManutencaoEletronica, User } from '../types';
import * as manutencaoService from '../services/manutencaoEletronicaService';
import * as usuarioService from '../services/usuarioService';
import ManutencaoEletronicaForm from '../components/manutencao/ManutencaoEletronicaForm';
import ManutencaoCard from '../components/manutencao/ManutencaoCard';
import DetalhesManutencaoModal from '../components/manutencao/DetalhesManutencaoModal';
import { useAuth } from '../hooks/useAuth';

function ManutencaoEletronicaPage() {
  const { user } = useAuth();
  const [filaCompleta, setFilaCompleta] = useState<ManutencaoEletronica[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoEletronica | null>(null);

  const [filters, setFilters] = useState({ status: '', tecnicoId: '', dataInicio: '', dataFim: '' });

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      manutencaoService.getAll(),
      usuarioService.getTecnicos(),
    ]).then(([manutencoes, tecnicosData]) => {
      setFilaCompleta(manutencoes);
      setTecnicos(tecnicosData);
    }).catch((err) => {
      setError(err.response?.data?.message || 'Falha ao carregar dados da fila. Verifique a conexão com o servidor.');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShowDetails = (item: ManutencaoEletronica) => {
    setSelectedManutencao(item);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<any>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredFila = useMemo(() => {
    return filaCompleta.filter(item => {
      const matchStatus = !filters.status || item.status === filters.status;
      const matchTecnico = !filters.tecnicoId || item.tecnico_responsavel_id === Number(filters.tecnicoId);
      const matchDataInicio = !filters.dataInicio || new Date(item.data_entrada) >= new Date(filters.dataInicio);
      const matchDataFim = !filters.dataFim || new Date(item.data_entrada) <= new Date(filters.dataFim);
      return matchStatus && matchTecnico && matchDataInicio && matchDataFim;
    });
  }, [filaCompleta, filters]);
  
  if (!user || (!user.role.startsWith('tecnico') && user.role !== 'admin')) {
    return (
      <MainLayout pageTitle="Acesso Negado">
        <Alert variant="danger" className="shadow-sm">Você não tem permissão para acessar esta página.</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="🔧 Fila de Manutenção Eletrônica">
      {error && <Alert variant="danger" className="shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Filtros de Pesquisa</h5>
          <PrimaryButton onClick={() => setShowCreateModal(true)}>
            + Novo Registro
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Status</Form.Label>
                <Form.Select name="status" className="bg-light" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em_manutencao">Em Manutenção</option>
                  <option value="Concluido">Concluído</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Técnico</Form.Label>
                <Form.Select name="tecnicoId" className="bg-light" value={filters.tecnicoId} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Data Início</Form.Label>
                <Form.Control type="date" name="dataInicio" className="bg-light" value={filters.dataInicio} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Data Fim</Form.Label>
                <Form.Control type="date" name="dataFim" className="bg-light" value={filters.dataFim} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2 text-muted">Carregando fila de manutenção...</div>
        </div>
      ) : (
        <Row className="g-4">
          {filteredFila.length > 0 ? (
            filteredFila.map(item => (
              <Col key={item.id} md={6} lg={4}>
                <ManutencaoCard manutencao={item} onDetailsClick={handleShowDetails} onUpdate={fetchData} />
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center text-muted p-5 bg-white rounded shadow-sm border">
                <span className="fs-1 d-block mb-3">📭</span>
                <h5 className="fw-bold">Nenhum registro encontrado</h5>
                <p className="mb-0">Tente ajustar os filtros ou adicione uma nova manutenção à fila.</p>
              </div>
            </Col>
          )}
        </Row>
      )}

      <ModalForm 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)} 
        title="🔧 Novo Registro de Manutenção"
      >
        <ManutencaoEletronicaForm 
          tecnicos={tecnicos}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      </ModalForm>
      
      {selectedManutencao && (
        <DetalhesManutencaoModal 
          show={showDetailsModal}
          onHide={() => setSelectedManutencao(null)}
          manutencao={selectedManutencao}
          onUpdate={fetchData}
        />
      )}
    </MainLayout>
  );
}

export default ManutencaoEletronicaPage;