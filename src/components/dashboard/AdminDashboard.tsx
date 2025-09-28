// src/components/dashboard/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import { getStatsGlobal} from '../../services/relatorioService';
import type { GlobalStats } from '../../types/index';
import StatCard from './StatCard';

function AdminDashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStatsGlobal()
      .then(setStats)
      .catch(() => setError('Não foi possível carregar as estatísticas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h4 className="mb-4">Visão Geral do Sistema</h4>
      <Row>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Unidades Organizacionais" value={stats?.total_unidades ?? 0} />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Usuários Cadastrados" value={stats?.total_usuarios ?? 0} />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Itens Totais em Estoque" value={stats?.total_itens ?? 0} />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard title="Solicitações Pendentes" value={stats?.solicitacoes_pendentes ?? 0} />
        </Col>
      </Row>
    </>
  );
}

export default AdminDashboard;