// src/components/dashboard/SolicitacoesRecentesTable.tsx
import { Table, Alert, Card } from 'react-bootstrap';
import type { SolicitacaoRecente } from '../../types/index';
import StatusBadge from '../solicitacoes/StatusBadge'; // Usando o StatusBadge para consistência

interface TableProps {
  solicitacoes: SolicitacaoRecente[];
  title: string;
  emptyMessage: string;
}

function SolicitacoesRecentesTable({ solicitacoes, title, emptyMessage }: TableProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <Card className="floating-card">
      <Card.Header as="h5">{title}</Card.Header>
      <Card.Body>
        {solicitacoes.length === 0 ? (
          <Alert variant="info" className="mb-0">{emptyMessage}</Alert>
        ) : (
          <Table striped hover responsive className="align-middle table-striped-ufs">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Técnico Responsável</th>
                <th>Nº GLPI</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s) => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td>{formatDate(s.data_solicitacao)}</td>
                  <td>{s.tecnico_responsavel}</td>
                  <td>{s.numero_glpi || 'N/A'}</td>
                  <td className="text-center">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

export default SolicitacoesRecentesTable;