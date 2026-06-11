// src/components/impressoras/ImpressorasTable.tsx
import { Table, Badge, Button, Stack } from 'react-bootstrap';
import { PencilSquare, Trash3Fill, InfoCircleFill } from 'react-bootstrap-icons';
import type { Impressora } from '../../types';
import { useConfirm } from '../../contexts/ConfirmContext';

interface ImpressorasTableProps {
  impressoras: Impressora[];
  onEdit: (impressora: Impressora) => void;
  onDelete: (impressora: Impressora) => void;
  onDetails: (impressora: Impressora) => void;
}

function ImpressorasTable({ impressoras, onEdit, onDelete, onDetails }: ImpressorasTableProps) {
  const { confirmar } = useConfirm();

  // 🚀 NOVA FUNÇÃO: Mostra o cartão de confirmação customizado antes de prosseguir
  const handleDeleteClick = async (impressora: Impressora) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Remover Impressora',
      mensagem: `Tem a certeza que deseja eliminar do sistema a impressora "${impressora.nome}" (Série: ${impressora.numero_serie})? Esta ação pode afetar relatórios de suprimentos vinculados.`,
      textoConfirmar: 'Sim, Eliminar',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (confirmou) {
      onDelete(impressora);
    }
  };

  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded">
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
        {impressoras.length > 0 ? (
          impressoras.map((item) => (
            <tr key={item.id}>
              <td className="fw-medium text-dark">{item.nome}</td>
              <td>{item.modelo}</td>
              <td className="text-muted fw-bold">{item.numero_serie}</td>
              <td className="font-monospace small">{item.ip || 'N/A'}</td>
              <td>
                <Badge className="bg-primary bg-opacity-10 text-primary border border-primary px-2 py-1 rounded-pill shadow-sm" style={{ fontSize: '0.8rem' }}>
                  {item.unidades_organizacionais?.nome || 'Não Definida'}
                </Badge>
              </td>
              <td className="text-center">
                <Stack direction="horizontal" gap={2} className="justify-content-center">
                  <Button variant="outline-info" size="sm" onClick={() => onDetails(item)} className="fw-bold text-dark">
                    <InfoCircleFill className="me-1" /> Detalhes
                  </Button>
                  <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)} className="fw-bold">
                    <PencilSquare className="me-1" /> Editar
                  </Button>
                  {/* 🚀 ALTERADO: Agora chama a nossa função de interceção */}
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(item)} className="fw-bold">
                    <Trash3Fill className="me-1" /> Excluir
                  </Button>
                </Stack>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center py-4 text-muted fst-italic">Nenhuma impressora encontrada.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default ImpressorasTable;