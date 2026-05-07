// src/components/dashboard/GerenteDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Table, Badge } from 'react-bootstrap';

function GerenteDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/estatisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar dados do Gerente", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      <Row className="g-4 mb-4">
        {/* Foco na Unidade: OS que aguardam aprovação ou atendimento */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-primary border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Pendentes na Unidade</h6>
              <h2 className="fw-bold text-dark mb-0">{stats?.os_pendentes || 0}</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Alerta de Estoque: Itens que o gerente precisa solicitar reposição */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-warning border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Itens Críticos (Estoque)</h6>
              <h2 className="fw-bold text-dark mb-0">{stats?.baixo_estoque || 0}</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Patrimônio: Total de bens sob responsabilidade da unidade */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-info border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Bens em Uso</h6>
              <h2 className="fw-bold text-dark mb-0">{stats?.patrimonio_ativo || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="floating-card">
            <Card.Body>
              <Card.Title className="mb-4 fw-bold">Gestão de Demandas da Unidade</Card.Title>
              <div className="d-grid gap-3 d-md-flex justify-content-md-start">
                <button className="btn btn-primary px-4 shadow-sm">📦 Gerenciar Estoque Local</button>
                <button className="btn btn-outline-secondary px-4 shadow-sm">📋 Relatório Mensal</button>
                <button className="btn btn-outline-secondary px-4 shadow-sm">🔍 Inventário Patrimonial</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default GerenteDashboard;