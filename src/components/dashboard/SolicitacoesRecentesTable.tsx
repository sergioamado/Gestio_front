// src/components/dashboard/SolicitacoesRecentesTable.tsx
import { Table, Alert } from 'react-bootstrap';
import type { SolicitacaoRecente } from '../../types/index';

interface TableProps {
  solicitacoes: SolicitacaoRecente[];
  emptyMessage: string;
}

function SolicitacoesRecentesTable({ solicitacoes, emptyMessage }: TableProps) {
  if (solicitacoes.length === 0) {
    return <Alert variant="info">{emptyMessage}</Alert>;
  }
  
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
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
          <th>Status</th>
          <th>Técnico Responsável</th>
          <th>Nº GLPI</th> {/* ALTERADO: Nova coluna */}
        </tr>
      </thead>
      <tbody>
        {solicitacoes.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{formatDate(s.data_solicitacao)}</td>
            <td>{s.status}</td>
            <td>{s.tecnico_responsavel}</td>
            <td>{s.numero_glpi || 'N/A'}</td> {/* ALTERADO: Exibindo o número do GLPI */}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default SolicitacoesRecentesTable;