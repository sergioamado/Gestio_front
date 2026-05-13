// src/components/dashboard/GerenteDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PrimaryButton from '../PrimaryButton';

interface Estatisticas {
  os_pendentes: number;
  baixo_estoque: number;
  patrimonio_ativo: number;
}

function GerenteDashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const response = await api.get('/estatisticas');
        setStats(response.data);
      } catch (err: any) {
        console.error("Erro ao carregar dados do Gerente", err);
        setError("Não foi possível carregar os indicadores da unidade.");
        // Mock de dados para visualização durante o desenvolvimento
        setStats({ os_pendentes: 5, baixo_estoque: 2, patrimonio_ativo: 340 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDados();
  }, []);

  if (loading) {
    return (
        <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted fw-medium">Carregando indicadores da unidade...</div>
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

      <Row className="g-4 mb-4">
        {/* Foco na Unidade: OS que aguardam aprovação ou atendimento */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-primary" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Pendentes na Unidade</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.os_pendentes || 0}</h2>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-primary">📋</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Alerta de Estoque: Itens que o gerente precisa solicitar reposição */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-warning" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Estoque Local Crítico</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.baixo_estoque || 0}</h2>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-warning">⚠️</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Patrimônio: Total de bens sob responsabilidade da unidade */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-info" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Bens em Uso</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.patrimonio_ativo || 0}</h2>
              </div>
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-info">🏢</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Card.Title className="mb-4 fw-bold text-dark fs-5">Gestão de Demandas da Unidade</Card.Title>
              <div className="d-grid gap-3 d-md-flex justify-content-md-start">
                <PrimaryButton 
                  onClick={() => navigate('/gerenciar-solicitacoes')}
                  className="px-4 shadow-sm fw-bold"
                >
                  📋 Gerenciar Solicitações (OS)
                </PrimaryButton>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/itens')}
                  className="px-4 shadow-sm fw-bold text-dark border"
                >
                  📦 Catálogo e Estoque Local
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/lista-bens')}
                  className="px-4 shadow-sm fw-bold text-dark border"
                >
                  🔍 Inventário Patrimonial
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default GerenteDashboard;