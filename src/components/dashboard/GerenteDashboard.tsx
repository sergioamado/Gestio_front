// src/components/dashboard/GerenteDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PrimaryButton from '../PrimaryButton';
// Importações da biblioteca Recharts
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface GraficoStatus {
  name: string;
  quantidade: number;
}

interface Estatisticas {
  os_pendentes: number;
  baixo_estoque: number;
  patrimonio_ativo: number;
  grafico_status?: GraficoStatus[];
}

// Mapa de cores corporativas baseado no status
const COLOR_MAP: Record<string, string> = {
  'PENDENTE': '#f59e0b',       // Laranja (Atenção)
  'EM ATENDIMENTO': '#3b82f6', // Azul (Em progresso)
  'CONCLUIDA': '#10b981',      // Verde (Sucesso)
  'CANCELADA': '#ef4444'       // Vermelho (Falha/Cancelado)
};

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
        // Mock de dados para visualização durante falhas de rede
        setStats({ 
          os_pendentes: 5, 
          baixo_estoque: 2, 
          patrimonio_ativo: 340,
          grafico_status: [
            { name: 'PENDENTE', quantidade: 5 },
            { name: 'EM ATENDIMENTO', quantidade: 2 },
            { name: 'CONCLUIDA', quantidade: 15 },
            { name: 'CANCELADA', quantidade: 1 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDados();
  }, []);

  // Customizador do Tooltip (Balãozinho ao passar o mouse)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-0 text-dark">{payload[0].payload.name}</p>
          <p className="mb-0 text-primary fw-medium">Total: {payload[0].value} OS</p>
        </div>
      );
    }
    return null;
  };

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

      <Row className="g-4">
        {/* GRÁFICO RECHARTS DA UNIDADE */}
        <Col md={8}>
          <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                  <Card.Title className="fw-bold text-dark mb-0">Atendimentos da Unidade</Card.Title>
                  <small className="text-muted">Desempenho e status dos chamados locais</small>
              </Card.Header>
              <Card.Body className="p-4">
                  <div style={{ width: '100%', height: '300px' }}>
                    {stats?.grafico_status && stats.grafico_status.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.grafico_status} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6b7280', fontSize: 12 }} 
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                          <Bar dataKey="quantidade" radius={[4, 4, 0, 0]} barSize={50} animationDuration={1500}>
                            {stats.grafico_status.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="d-flex h-100 align-items-center justify-content-center text-muted">
                        Nenhum dado de OS registrado para esta unidade.
                      </div>
                    )}
                  </div>
              </Card.Body>
          </Card>
        </Col>

        {/* MENU LATERAL RÁPIDO DO GERENTE */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <Card.Title className="fw-bold text-dark mb-0">Gestão Local</Card.Title>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column gap-3">
              <PrimaryButton 
                onClick={() => navigate('/gerenciar-solicitacoes')}
                className="text-start fw-bold p-3 w-100 shadow-sm"
              >
                📋 Gerenciar Solicitações (OS)
              </PrimaryButton>
              
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/itens')}
                className="text-start fw-bold p-3 w-100 text-dark border shadow-sm"
              >
                📦 Catálogo e Estoque Local
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/lista-bens')}
                className="text-start fw-bold p-3 w-100 text-dark border shadow-sm mt-auto"
              >
                🔍 Inventário Patrimonial
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default GerenteDashboard;