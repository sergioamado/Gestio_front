// src/components/unidades/UnidadesTable.tsx
import { Table, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill } from 'react-bootstrap-icons';
import type { Unidade } from '../../types/index';
import { useConfirm } from '../../contexts/ConfirmContext';

interface UnidadesTableProps {
  unidades: Unidade[];
  onEdit: (unidade: Unidade) => void;
  onDelete: (unidade: Unidade) => void;
}

function UnidadesTable({ unidades, onEdit, onDelete }: UnidadesTableProps) {
  const { confirmar } = useConfirm();

  // 🚀 NOVA FUNÇÃO: Interceta o clique e mostra o Cartão de Confirmação
  const handleDeleteClick = async (unidade: Unidade) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Excluir Unidade',
      mensagem: `Tem certeza que deseja excluir a unidade "${unidade.nome}" (${unidade.sigla})? Esta ação não pode ser desfeita.`,
      textoConfirmar: 'Sim, Excluir',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (confirmou) {
      // Se o usuário clicou em "Sim", passamos a ordem para a página Pai
      onDelete(unidade);
    }
  };

  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded tabela-cards">
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
            <td data-label="ID" className="fw-medium text-muted">#{unidade.id}</td>
            <td data-label="Nome" className="fw-medium">{unidade.nome}</td>
            <td data-label="Sigla">{unidade.sigla}</td>
            <td data-label="Campus">{unidade.campus}</td>
            <td className="text-center acoes">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(unidade)}
                  className="fw-bold"
                >
                  <PencilSquare className="me-1"/> Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteClick(unidade)}
                  className="fw-bold"
                >
                  <Trash3Fill className="me-1"/> Excluir
                </Button>
              </Stack>
            </td>
          </tr>
        ))}
        {unidades.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-4 text-muted fst-italic vazio">
              Nenhuma unidade organizacional cadastrada.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default UnidadesTable;