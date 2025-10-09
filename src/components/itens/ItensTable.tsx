// src/components/itens/ItensTable.tsx
import { Table, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill, InfoCircleFill } from 'react-bootstrap-icons';
import type { Item } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface ItensTableProps {
  itens: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onDetails: (item: Item) => void;
}

function ItensTable({ itens, onEdit, onDelete, onDetails }: ItensTableProps) {
  const { user } = useAuth();
  const canManageItems = user?.role === 'admin' || user?.role === 'gerente';

  return (
    <Table striped hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Código SIPAC</th>
          <th>Especificação</th>
          <th className="text-center">Qtd.</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item) => (
          <tr key={item.id}>
            <td>{item.codigo_sipac}</td>
            <td style={{ minWidth: '250px' }}>{item.descricao}</td>
            <td className="text-center">{item.quantidade}</td>
            <td className="text-center">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button variant="warning" size="sm" onClick={() => onDetails(item)}>
                  <InfoCircleFill /> Detalhes
                </Button>
                {/* CORRIGIDO: Botões só aparecem para quem pode gerir */}
                {canManageItems && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => onEdit(item)}>
                      <PencilSquare /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(item)}>
                      <Trash3Fill /> Excluir
                    </Button>
                  </>
                )}
              </Stack>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default ItensTable;