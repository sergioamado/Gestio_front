// src/components/itens/ItensTable.tsx
import { Table, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill, InfoCircleFill } from 'react-bootstrap-icons';
import type { Item } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useConfirm } from '../../contexts/ConfirmContext';

interface ItensTableProps {
  itens: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onDetails: (item: Item) => void;
}

function ItensTable({ itens, onEdit, onDelete, onDetails }: ItensTableProps) {
  const { user } = useAuth();
  const { confirmar } = useConfirm();
  const canManageItems = user?.role === 'admin' || user?.role === 'gerente';

  // 🚀 NOVA FUNÇÃO: Interceta o clique e mostra o Cartão de Confirmação Moderno
  const handleDeleteClick = async (item: Item) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Excluir Item',
      mensagem: `Tem a certeza que deseja excluir o item "${item.descricao}" (SIPAC: ${item.codigo_sipac})? Esta ação removerá o item do catálogo base.`,
      textoConfirmar: 'Sim, Excluir',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (confirmou) {
      onDelete(item);
    }
  };

  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded">
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
            <td className="fw-medium text-muted">{item.codigo_sipac}</td>
            <td style={{ minWidth: '250px' }} className="fw-medium">{item.descricao}</td>
            <td className="text-center">
              <span className={`badge ${item.quantidade > 0 ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'} rounded-pill px-2 py-1`}>
                {item.quantidade}
              </span>
            </td>
            <td className="text-center">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button variant="outline-info" size="sm" onClick={() => onDetails(item)} className="fw-bold text-dark">
                  <InfoCircleFill className="me-1"/> Detalhes
                </Button>
                {/* Botões só aparecem para quem pode gerir */}
                {canManageItems && (
                  <>
                    <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)} className="fw-bold">
                      <PencilSquare className="me-1"/> Editar
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(item)} className="fw-bold">
                      <Trash3Fill className="me-1"/> Excluir
                    </Button>
                  </>
                )}
              </Stack>
            </td>
          </tr>
        ))}
        {itens.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center py-4 text-muted fst-italic">
              Nenhum item cadastrado no sistema.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default ItensTable;