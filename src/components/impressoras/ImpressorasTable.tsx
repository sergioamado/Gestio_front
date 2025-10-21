// src/components/impressoras/ImpressorasTable.tsx
import { Table, Badge, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill, InfoCircleFill } from 'react-bootstrap-icons';
import type { Impressora } from '../../types';

interface ImpressorasTableProps {
  impressoras: Impressora[];
  onEdit: (impressora: Impressora) => void;
  onDelete: (impressora: Impressora) => void;
  onDetails: (impressora: Impressora) => void;
}

function ImpressorasTable({ impressoras, onEdit, onDelete, onDetails }: ImpressorasTableProps) {
  return (
    <Table striped hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Nome</th>
          <th>Modelo</th>
          <th>Nº de Série</th>
          <th>IP</th>
          <th>Unidade</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {/* CORREÇÃO: Usar um operador ternário para garantir que não há nós de texto
            inválidos quando a lista está vazia e para exibir uma mensagem clara. */}
        {impressoras.length > 0 ? (
          impressoras.map((item) => (
            <tr key={item.id}>
              <td>{item.nome}</td>
              <td>{item.modelo}</td>
              <td>{item.numero_serie}</td>
              <td>{item.ip || 'N/A'}</td>
              <td>
                <Badge bg="secondary">{item.unidades_organizacionais?.nome}</Badge>
              </td>
              <td className="text-center">
                <Stack direction="horizontal" gap={2} className="justify-content-center">
                  <Button variant="outline-secondary" size="sm" onClick={() => onDetails(item)}>
                    <InfoCircleFill /> Detalhes
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => onEdit(item)} className="action-btn">
                    <PencilSquare /> Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(item)} className="action-btn">
                    <Trash3Fill /> Excluir
                  </Button>
                </Stack>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center text-muted">Nenhuma impressora encontrada.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default ImpressorasTable;