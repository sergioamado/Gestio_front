// src/components/dashboard/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
// Importe a sua configuração do axios (ajuste o caminho se necessário)
// import api from '../../services/api'; 

interface Estatisticas {
  os_pendentes: number;
  baixo_estoque: number;
  patrimonio_ativo: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados do backend assim que o componente montar
    const fetchEstatisticas = async () => {
      try {
        // Substitua pelo seu método de chamada à API. Exemplo com fetch:
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/estatisticas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstatisticas();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <Row className="g-4 mb-4">
        {/* Card 1: OS Pendentes */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-warning border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">OS Pendentes</h6>
              <h2 className="fw-bold text-dark mb-0">{stats?.os_pendentes || 0}</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Estoque Baixo */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-danger border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Itens em Baixo Estoque</h6>
              <h2 className="fw-bold text-dark mb-0">{stats?.baixo_estoque || 0}</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Patrimônio */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-success border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Bens Patrimoniais Ativos</h6>
              <h2 className="fw-bold text-dark mb-0">{stats?.patrimonio_ativo || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Espaço reservado para o Gráfico e Lista de Últimas OS */}
      <Row className="g-4">
        <Col md={8}>
            <Card className="floating-card h-100">
                <Card.Body>
                    <Card.Title>Evolução de Atendimentos</Card.Title>
                    <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '300px' }}>
                        <span className="text-muted">Área reservada para o Gráfico (Recharts)</span>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col md={4}>
             <Card className="floating-card h-100">
                <Card.Body>
                    <Card.Title>Ações Rápidas</Card.Title>
                    {/* Botões para ir direto para as telas importantes */}
                    <div className="d-grid gap-2 mt-3">
                        <button className="btn btn-outline-primary text-start">📄 Nova Solicitação</button>
                        <button className="btn btn-outline-success text-start">📦 Transferir Patrimônio</button>
                        <button className="btn btn-outline-danger text-start">⚠️ Repor Estoque</button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;