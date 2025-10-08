// src/components/dashboard/TecnicoDashboard.tsx
import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { getLatestSolicitacoes} from '../../services/relatorioService';
import type { SolicitacaoRecente } from '../../types/index';
import SolicitacoesRecentesTable from './SolicitacoesRecentesTable';

function TecnicoDashboard() {
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
      {/* ALTERADO: Título atualizado */}
      <h4 className="mb-4">Suas Últimas 15 Solicitações Criadas</h4>
      <SolicitacoesRecentesTable 
        solicitacoes={solicitacoes}
        emptyMessage="Você ainda não criou nenhuma solicitação."
      />
    </>
  );
}

export default TecnicoDashboard;