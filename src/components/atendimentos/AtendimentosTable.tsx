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
    <Table striped hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>GLPI</th>
          <th>Impressora</th>
          <th>Setor</th>
          <th>Status</th>
          <th>Técnico COSUP</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {atendimentos.length > 0 ? (
          atendimentos.map((item) => (
            <tr key={item.id}>
              <td>{item.numero_glpi}</td>
              <td>{item.impressora?.nome}</td>
              <td>{item.impressora?.localizacao}</td>
              <td>
                <Badge bg={statusMap[item.status]?.variant || 'secondary'}>
                  {statusMap[item.status]?.text || item.status}
                </Badge>
              </td>
              <td>{item.tecnico_responsavel?.nome_completo}</td>
              <td className="text-center">
                <Stack direction="horizontal" gap={2} className="justify-content-center">
                  <Button variant="outline-secondary" size="sm" onClick={() => onDetails(item)}>
                    <InfoCircleFill /> Detalhes
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => onEdit(item)} className="action-btn">
                    <PencilSquare /> Editar / Evoluir
                  </Button>
                </Stack>
                
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center text-muted">Nenhum atendimento registado.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default AtendimentosTable;