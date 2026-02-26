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
    Promise.all([
      manutencaoService.getAll(),
      usuarioService.getTecnicos(),
    ]).then(([manutencoes, tecnicosData]) => {
      setFilaCompleta(manutencoes);
      setTecnicos(tecnicosData);
    }).catch((err) => {
      setError(err.response?.data?.message || 'Falha ao carregar dados da fila.');
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
        <Alert variant="danger">Você não tem permissão para acessar esta página.</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="🔧 Fila de Manutenção Eletrônica">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card mb-4">
        <Card.Header as="h5">Manutenção Eletronica Filtros</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}><Form.Group><Form.Label>Status</Form.Label><Form.Select name="status" value={filters.status} onChange={handleFilterChange}><option value="Pendente">Pendente</option><option value="">Todos</option><option value="Em_manutencao">Em Manutenção</option><option value="Concluido">Concluído</option></Form.Select></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Técnico</Form.Label><Form.Select name="tecnicoId" value={filters.tecnicoId} onChange={handleFilterChange}><option value="">Todos</option>{tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}</Form.Select></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Data Início</Form.Label><Form.Control type="date" name="dataInicio" value={filters.dataInicio} onChange={handleFilterChange} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Data Fim</Form.Label><Form.Control type="date" name="dataFim" value={filters.dataFim} onChange={handleFilterChange} /></Form.Group></Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="d-flex justify-content-end mb-3">
        <PrimaryButton onClick={() => setShowCreateModal(true)}>
          + Novo Registo na Fila
        </PrimaryButton>
      </div>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Row>
          {filteredFila.length > 0 ? filteredFila.map(item => (
            <Col key={item.id} md={6} lg={4} className="mb-4">
              <ManutencaoCard manutencao={item} onDetailsClick={handleShowDetails} onUpdate={fetchData} />
            </Col>
          )) : <Alert variant="info">Nenhum registo encontrado com os filtros aplicados.</Alert>}
        </Row>
      )}

      <ModalForm show={showCreateModal} onHide={() => setShowCreateModal(false)} title="Novo Registo de Manutenção">
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