// src/components/usuarios/UsuariosTable.tsx
import { Table, Button, Stack, Badge } from 'react-bootstrap';
import { PencilSquare, Trash3Fill } from 'react-bootstrap-icons';
import type { User, Role } from '../../types/index'; 
import { useAuth } from '../../hooks/useAuth';
import { useConfirm } from '../../contexts/ConfirmContext';

interface UsuariosTableProps {
  usuarios: User[];
  onEdit: (usuario: User) => void;
  onDelete: (usuario: User) => void;
}

function UsuariosTable({ usuarios, onEdit, onDelete }: UsuariosTableProps) {
  const { user: currentUser } = useAuth();
  const usersToDisplay = usuarios.filter(u => u.id !== currentUser?.id);
  const { confirmar } = useConfirm();

  const getRoleBadge = (role: Role) => {
    const variants: Partial<Record<Role, string>> = {
      admin: 'danger',
      gerente: 'primary',
      tecnico: 'secondary',
      tecnico_impressora: 'info',
      tecnico_eletronica: 'dark',
    };
    
    const variant = variants[role] || 'light';
    
    const formattedRole = role
      .replace('_', ' ')
      .replace(/\b\w/g, char => char.toUpperCase());

    return <Badge bg={variant}>{formattedRole}</Badge>;
  }

  // 🚀 NOVA FUNÇÃO: Interceta o clique e mostra o Cartão de Confirmação Moderno
  const handleDeleteClick = async (usuario: User) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Excluir Usuário',
      mensagem: `Tem certeza que deseja remover o acesso do usuário "${usuario.nome_completo}"? Esta ação não pode ser desfeita.`,
      textoConfirmar: 'Sim, Excluir',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (confirmou) {
      // Se o usuário clicou em "Sim", passamos a ordem para a página Pai apagar na API
      onDelete(usuario);
    }
  };

  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded tabela-cards">
      <thead className="table-light">
        <tr>
          <th>Usuário (Login)</th>
          <th>Nome Completo</th>
          <th>Perfil</th>
          <th>Unidade Organizacional</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {usersToDisplay.map((user) => (
          <tr key={user.id}>
            <td data-label="Usuário" className="fw-medium">{user.username}</td>
            <td data-label="Nome">{user.nome_completo}</td>
            <td data-label="Perfil">{getRoleBadge(user.role)}</td>
            <td data-label="Unidade" className="text-muted">{user.unidades_organizacionais?.nome || '[ Acesso Global ]'}</td>
            <td className="text-center acoes">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(user)} className="fw-bold">
                  <PencilSquare className="me-1"/> Editar
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(user)} className="fw-bold">
                  <Trash3Fill className="me-1"/> Excluir
                </Button>
              </Stack>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default UsuariosTable;