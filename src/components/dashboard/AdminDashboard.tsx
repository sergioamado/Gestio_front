// src/components/dashboard/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import PrimaryButton from '../PrimaryButton';

interface Estatisticas {
  os_pendentes: number;
  baixo_estoque: number;
  patrimonio_ativo: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        setLoading(true);
        // Utilizamos a nossa instância configurada do Axios (api.ts)
        const response = await api.get('/estatisticas');
        setStats(response.data);
      } catch (err: any) {
        console.error("Erro ao buscar estatísticas", err);
        setError("Não foi possível carregar os indicadores no momento.");
        // Mock de dados para fins de visualização enquanto o endpoint não estiver 100% pronto
        setStats({ os_pendentes: 12, baixo_estoque: 8, patrimonio_ativo: 1450 });
      } finally {
        setLoading(false);
      }
    };

    fetchEstatisticas();
  }, []);

  if (loading) {
    return (
        <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted fw-medium">Carregando indicadores do sistema...</div>
        </div>
    );
  }

  return (
    <div>
      {error && (
          <Alert variant="warning" className="shadow-sm border-0 mb-4" dismissible onClose={() => setError(null)}>
              ⚠️ {error} - Exibindo dados simulados.
          </Alert>
      )}

      {/* LINHA 1: KPIs (Key Performance Indicators) */}
      <Row className="g-4 mb-4">
        {/* Card 1: OS Pendentes */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-warning" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>OS Pendentes</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.os_pendentes || 0}</h2>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-warning">⏳</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Estoque Baixo */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-danger" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Estoque Baixo</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.baixo_estoque || 0}</h2>
              </div>
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-danger">⚠️</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Patrimônio */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-success" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Bens Ativos</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.patrimonio_ativo || 0}</h2>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-success">📦</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* LINHA 2: Gráficos e Ações Rápidas */}
      <Row className="g-4">
        <Col md={8}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <Card.Title className="fw-bold text-dark mb-0">Evolução de Atendimentos</Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-center bg-light rounded border border-dashed" style={{ height: '300px', borderStyle: 'dashed' }}>
                        <div className="text-center text-muted">
                            <span className="fs-1 d-block mb-2">📊</span>
                            <span className="fw-medium">Área reservada para Gráficos</span><br/>
                            <small>(Será implementado com a biblioteca Recharts)</small>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        
        <Col md={4}>
             <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <Card.Title className="fw-bold text-dark mb-0">Ações Rápidas</Card.Title>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column gap-3">
                    <PrimaryButton 
                        variant="outline-primary" 
                        className="text-start fw-bold p-3 w-100 border text-dark"
                        onClick={() => navigate('/gerenciar-solicitacoes')}
                    >
                        📋 Gerenciar OS
                    </PrimaryButton>

                    <PrimaryButton 
                        variant="outline-success" 
                        className="text-start fw-bold p-3 w-100 border text-dark"
                        onClick={() => navigate('/lista-bens')}
                    >
                        📦 Inventário de Bens
                    </PrimaryButton>

                    <PrimaryButton 
                        variant="outline-warning" 
                        className="text-start fw-bold p-3 w-100 border text-dark"
                        onClick={() => navigate('/itens')}
                    >
                        ⚠️ Catálogo de Itens
                    </PrimaryButton>

                     <PrimaryButton 
                        variant="outline-secondary" 
                        className="text-start fw-bold p-3 w-100 border text-dark mt-auto"
                        onClick={() => navigate('/usuarios')}
                    >
                        👥 Gerenciar Equipe
                    </PrimaryButton>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;