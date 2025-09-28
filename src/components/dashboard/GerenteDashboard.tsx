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
    <>
      <h4 className="mb-4">Últimas 5 Solicitações da Unidade</h4>
      <SolicitacoesRecentesTable 
        solicitacoes={solicitacoes}
        emptyMessage="Nenhuma solicitação recente foi criada para a sua unidade."
      />
    </>
  );
}

export default GerenteDashboard;