// src/components/dashboard/GerenteDashboard.tsx
import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { getLatestSolicitacoes } from '../../services/relatorioService';
import type { SolicitacaoRecente } from '../../types/index';
import SolicitacoesRecentesTable from './SolicitacoesRecentesTable';

function GerenteDashboard() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLatestSolicitacoes()
      .then(setSolicitacoes)
      .catch(() => setError('Não foi possível carregar as solicitações.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <SolicitacoesRecentesTable 
      solicitacoes={solicitacoes}
      title="Solicitações Pendentes da Unidade"
      emptyMessage="Nenhuma solicitação pendente para a sua unidade no momento."
    />
  );
}

export default GerenteDashboard;