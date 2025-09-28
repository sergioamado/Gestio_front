// src/components/unidades/UnidadesTable.tsx
import { Table, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill } from 'react-bootstrap-icons';
import type { Unidade } from '../../types/index';

interface UnidadesTableProps {
  unidades: Unidade[];
  onEdit: (unidade: Unidade) => void;
  onDelete: (unidade: Unidade) => void;
}

function UnidadesTable({ unidades, onEdit, onDelete }: UnidadesTableProps) {
  return (
    <Table striped hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Nome da Unidade</th>
          <th>Sigla</th>
          <th>Campus</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {unidades.map((unidade) => (
          <tr key={unidade.id}>
            <td>{unidade.id}</td>
            <td>{unidade.nome}</td>
            <td>{unidade.sigla}</td>
            <td>{unidade.campus}</td>
            <td className="text-center">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onEdit(unidade)}
                  className="action-btn"
                >
                  <PencilSquare /> Editar
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(unidade)}
                  className="action-btn"
                >
                  <Trash3Fill /> Excluir
                </Button>
              </Stack>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default UnidadesTable;