// src/components/dashboard/SolicitacoesRecentesTable.tsx
import { Table, Card } from 'react-bootstrap';
// Importação limpa pelo barril
import type { SolicitacaoRecente } from '../../types';
import StatusBadge from '../solicitacoes/StatusBadge';

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
    <Card className="floating-card border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
        <h5 className="fw-bold text-dark mb-0">{title}</h5>
      </Card.Header>
      <Card.Body className="p-4 pt-3 d-flex flex-column">
        {solicitacoes.length === 0 ? (
          <div className="text-center text-muted p-4 bg-light rounded border border-dashed flex-grow-1 d-flex flex-column justify-content-center" style={{ borderStyle: 'dashed' }}>
            <span className="fs-3 d-block mb-2">📋</span>
            <p className="mb-0 fw-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div className="table-responsive flex-grow-1 custom-scrollbar">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light text-secondary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="ps-3 border-0 small text-uppercase fw-bold">ID</th>
                  <th className="border-0 small text-uppercase fw-bold">Data</th>
                  <th className="border-0 small text-uppercase fw-bold">Técnico Responsável</th>
                  <th className="border-0 small text-uppercase fw-bold">Nº GLPI</th>
                  <th className="pe-3 text-center border-0 small text-uppercase fw-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.map((s) => (
                  <tr key={s.id}>
                    <td className="ps-3">
                      <span className="fw-bold text-primary bg-light px-2 py-1 rounded" style={{ letterSpacing: '0.5px' }}>
                        #{s.id}
                      </span>
                    </td>
                    <td className="text-muted fw-medium">{formatDate(s.data_solicitacao)}</td>
                    <td className="text-dark fw-medium">{s.tecnico_responsavel}</td>
                    <td className="text-muted">
                        {s.numero_glpi ? (
                            <span className="fw-bold text-secondary">#{s.numero_glpi}</span>
                        ) : (
                            <span className="fst-italic opacity-50">N/A</span>
                        )}
                    </td>
                    <td className="pe-3 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default SolicitacoesRecentesTable;