// src/components/itens/ItensTable.tsx
import { Table, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill, InfoCircleFill } from 'react-bootstrap-icons'; // Adicionar InfoCircleFill
import type { Item } from '../../types';

interface ItensTableProps {
  itens: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onDetails: (item: Item) => void; // Adicionar nova prop
}

function ItensTable({ itens, onEdit, onDelete, onDetails }: ItensTableProps) {
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
                {/* NOVO BOTÃO DE DETALHES */}
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
        ))}
      </tbody>
    </Table>
  );
}

export default ItensTable;