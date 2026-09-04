// src/pages/ManutencaoEletronicaPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Spinner, Alert, Row, Col, Card, Form } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ModalForm from '../../components/ModalForm';
import type { ManutencaoEletronica, User } from '../../types';
import * as manutencaoService from '../../services/manutencaoEletronicaService';
import * as usuarioService from '../../services/usuarioService';
import ManutencaoEletronicaForm from '../../components/manutencao/ManutencaoEletronicaForm';
import ManutencaoCard from '../../components/manutencao/ManutencaoCard';
import DetalhesManutencaoModal from '../../components/manutencao/DetalhesManutencaoModal';
import { useAuth } from '../../hooks/useAuth';

function ManutencaoEletronicaPage() {
  const { user } = useAuth();
  const [filaCompleta, setFilaCompleta] = useState<ManutencaoEletronica[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoEletronica | null>(null);

  // Verificação se é Administrador
  const isAdmin = user?.role === 'admin';

  // Filtros atualizados: 'ATIVAS' como padrão e inclusão do buscaGlpi
  const [filters, setFilters] = useState({ 
    status: 'ATIVAS', 
    tecnicoId: '', 
    dataInicio: '', 
    dataFim: '',
    buscaGlpi: '' 
  });

  // Modificado para aceitar isSilent (evita que a tela pisque a cada 1 minuto)
  const fetchData = useCallback((isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    Promise.all([
      manutencaoService.getAll(),
      usuarioService.getTecnicos(),
    ]).then(([manutencoes, tecnicosData]) => {
      setFilaCompleta(manutencoes);
      setTecnicos(tecnicosData);
    }).catch((err) => {
      if (!isSilent) setError(err.response?.data?.message || 'Falha ao carregar dados da fila. Verifique a conexão com o servidor.');
    }).finally(() => {
      if (!isSilent) setLoading(false);
    });
  }, []);

  // Motor de Auto-Refresh (60 segundos)
  useEffect(() => {
    fetchData(false); // Carga inicial
    const intervalId = setInterval(() => {
      fetchData(true); // Carga silenciosa
    }, 60000);
    return () => clearInterval(intervalId); // Limpa ao desmontar
  }, [fetchData]);

  const handleShowDetails = (item: ManutencaoEletronica) => {
    setSelectedManutencao(item);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<any>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredFila = useMemo(() => {
    const filtrado = filaCompleta.filter(item => {
      // Lógica do Status Ocultando Concluídos (Eletrônica #6)
      let matchStatus = true;
      if (filters.status === 'ATIVAS') {
        matchStatus = item.status === 'Pendente' || item.status === 'Em_manutencao';
      } else if (filters.status) {
        matchStatus = item.status === filters.status;
      }

      const matchTecnico = !filters.tecnicoId || item.tecnico_responsavel_id === Number(filters.tecnicoId);
      const matchDataInicio = !filters.dataInicio || new Date(item.data_entrada) >= new Date(filters.dataInicio);
      const matchDataFim = !filters.dataFim || new Date(item.data_entrada) <= new Date(filters.dataFim);
      
      // Tratativa segura para o GLPI
      const glpiValue = (item as any).numero_glpi || (item as any).glpi || (item as any).chamado_glpi || '';
      const matchGlpi = !filters.buscaGlpi || String(glpiValue).includes(filters.buscaGlpi.trim());

      return matchStatus && matchTecnico && matchDataInicio && matchDataFim && matchGlpi;
    });

    // Ordenação do mais recente para o mais antigo
    return filtrado.sort((a, b) => new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime());
  }, [filaCompleta, filters]);
  
  if (!user || (!user.role.startsWith('tecnico') && user.role !== 'admin' && user.role !== 'gerente')) {
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
          
          {/*  Botão de Novo Registro oculto para o Administrador */}
          {!isAdmin && (
            <PrimaryButton onClick={() => setShowCreateModal(true)}>
              + Novo Registro
            </PrimaryButton>
          )}
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Status</Form.Label>
                <Form.Select name="status" className="bg-light" value={filters.status} onChange={handleFilterChange}>
                  <option value="ATIVAS">Ativas (Pendente / Em Manutenção)</option>
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
            {/* Novo Campo de Busca GLPI */}
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Nº GLPI</Form.Label>
                <Form.Control type="text" name="buscaGlpi" placeholder="Ex: 123" className="bg-light" value={filters.buscaGlpi} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Data Início</Form.Label>
                <Form.Control type="date" name="dataInicio" className="bg-light" value={filters.dataInicio} onChange={handleFilterChange} />
              </Form.Group>
            </Col>
            <Col md={2}>
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
                <ManutencaoCard 
                  manutencao={item} 
                  onDetailsClick={handleShowDetails} 
                  onUpdate={fetchData} 
                  
                />
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

      {!isAdmin && (
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
      )}
      
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