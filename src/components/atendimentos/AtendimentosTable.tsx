// src/components/atendimentos/AtendimentosTable.tsx
import { Table, Badge, Button, Stack } from 'react-bootstrap';
import { PencilSquare, InfoCircleFill } from 'react-bootstrap-icons';
import type { AtendimentoImpressora } from '../../types';

interface AtendimentosTableProps {
  atendimentos: AtendimentoImpressora[];
  onDetails: (atendimento: AtendimentoImpressora) => void;
  onEdit: (atendimento: AtendimentoImpressora) => void;
}

function AtendimentosTable({ atendimentos, onDetails, onEdit }: AtendimentosTableProps) {
  
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aguardando_Assistencia': return <Badge bg="warning" text="dark">⏳ Aguardando</Badge>;
      case 'Em_Atendimento': return <Badge bg="info">🛠️ Em Andamento</Badge>;
      case 'Aguardando_Peca': return <Badge bg="danger">📦 Aguardando Peça</Badge>;
      case 'Aguardando_Peca_Com_Backup': return <Badge bg="secondary">📦 Peça (C/ Backup)</Badge>;
      case 'Aguardando_Peca_Impressao_Redirecionada': return <Badge bg="secondary">📦 Peça (Redirecionada)</Badge>;
      case 'Concluido': return <Badge bg="success">✅ Concluído</Badge>;
      case 'Cancelado': return <Badge bg="dark">❌ Cancelado</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded">
      <thead className="table-light">
        <tr>
          <th>GLPI</th>
          <th>Impressora</th>
          <th>Setor (Dono)</th>
          <th>Localização</th>
          <th>Técnico</th>
          <th>Data Abertura</th>
          <th>Status</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {atendimentos.map((item) => (
          <tr key={item.id}>
            <td className="fw-bold text-primary">{item.numero_glpi}</td>
            <td className="fw-medium text-dark">
               {item.impressora?.nome} <br/>
               <span className="small text-muted">{item.impressora?.modelo}</span>
            </td>
            <td>
              <Badge className="bg-primary bg-opacity-10 text-primary border border-primary px-2 py-1 rounded-pill shadow-sm">
                {/* Usamos (item as any) aqui caso o TS reclame da unidade_dona que foi injetada no Backend */}
                {(item as any).unidade_dona || item.unidades_organizacionais?.nome || 'Não Definida'}
              </Badge>
            </td>
            <td className="text-muted small">{item.impressora?.localizacao || 'Não informada'}</td>
            <td className="text-muted small">{item.tecnico?.nome_completo || 'N/A'}</td>
            <td className="small">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
            <td>{getStatusBadge(item.status)}</td>
            <td className="text-center">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button variant="outline-info" size="sm" onClick={() => onDetails(item)} className="fw-bold text-dark">
                  <InfoCircleFill className="me-1" /> Detalhes
                </Button>
                
                {/* Só permite editar se NÃO estiver Concluído nem Cancelado */}
                {item.status !== 'Concluido' && item.status !== 'Cancelado' && (
                  <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)} className="fw-bold">
                    <PencilSquare className="me-1" /> Atualizar
                  </Button>
                )}
              </Stack>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default AtendimentosTable;