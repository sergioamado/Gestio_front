// src/components/atendimentos/AtendimentosTable.tsx
import { Table, Badge, Button, Stack } from 'react-bootstrap';
import { InfoCircleFill, PencilSquare } from 'react-bootstrap-icons'; 
import type { AtendimentoImpressora, StatusAtendimento, AtendimentosTableProps } from '../../types';

// Mapeamento de status para cores e texto
export const statusMap: Record<StatusAtendimento, { variant: string; text: string }> = {
  Aguardando_Assistencia: { variant: 'warning', text: 'Aguardando Assistência' },
  Em_Atendimento: { variant: 'info', text: 'Em Atendimento' },
  Aguardando_Peca: { variant: 'primary', text: 'Aguardando Peça' },
  Aguardando_Peca_Com_Backup: { variant: 'primary', text: 'Aguardando Peça (c/ Backup)' },
  Aguardando_Peca_Impressao_Redirecionada: { variant: 'primary', text: 'Aguardando Peça (Impr. Remota)' },
  Concluido: { variant: 'success', text: 'Concluído' },
  Cancelado: { variant: 'danger', text: 'Cancelado' },
};

function AtendimentosTable({ atendimentos, onDetails, onEdit }: AtendimentosTableProps) {
  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded">
      <thead className="table-light">
        <tr>
          <th>GLPI</th>
          <th>Impressora</th>
          <th>Setor</th>
          <th className="text-center">Status</th>
          <th>Técnico COSUP</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {atendimentos.length > 0 ? (
          atendimentos.map((item) => {
            const statusConfig = statusMap[item.status] || { variant: 'secondary', text: item.status };
            
            return (
              <tr key={item.id}>
                <td className="fw-bold text-secondary font-monospace">#{item.numero_glpi}</td>
                <td className="fw-medium text-dark">{item.impressora?.nome || 'N/A'}</td>
                <td className="text-muted">{item.impressora?.localizacao || 'N/A'}</td>
                <td className="text-center">
                  <Badge 
                    className={`bg-${statusConfig.variant} bg-opacity-10 text-${statusConfig.variant === 'warning' ? 'dark' : statusConfig.variant} border border-${statusConfig.variant} px-2 py-1 rounded-pill shadow-sm`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {statusConfig.text}
                  </Badge>
                </td>
                <td>
                  {item.tecnico_responsavel?.nome_completo ? (
                    <span className="d-flex align-items-center">
                      <span className="me-2 text-primary">👤</span> 
                      {item.tecnico_responsavel.nome_completo}
                    </span>
                  ) : (
                    <span className="fst-italic text-muted">Não Atribuído</span>
                  )}
                </td>
                <td className="text-center">
                  <Stack direction="horizontal" gap={2} className="justify-content-center">
                    <Button variant="outline-info" size="sm" onClick={() => onDetails(item)} className="fw-bold text-dark">
                      <InfoCircleFill className="me-1" /> Detalhes
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)} className="fw-bold">
                      <PencilSquare className="me-1" /> Editar / Evoluir
                    </Button>
                  </Stack>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={6} className="text-center py-4 text-muted fst-italic">
              Nenhum atendimento registado no sistema.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default AtendimentosTable;