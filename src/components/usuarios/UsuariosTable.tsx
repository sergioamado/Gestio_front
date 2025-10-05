// src/components/usuarios/UsuariosTable.tsx
import { Table, Button, Stack, Badge } from 'react-bootstrap';
import { PencilSquare, Trash3Fill } from 'react-bootstrap-icons';
import type { User, Role } from '../../types/index'; 
import { useAuth } from '../../hooks/useAuth';

interface UsuariosTableProps {
  usuarios: User[];
  onEdit: (usuario: User) => void;
  onDelete: (usuario: User) => void;
}

function UsuariosTable({ usuarios, onEdit, onDelete }: UsuariosTableProps) {
  const { user: currentUser } = useAuth();
  const usersToDisplay = usuarios.filter(u => u.id !== currentUser?.id);

  const getRoleBadge = (role: Role) => { // <-- CORREÇÃO: Usa o tipo específico 'Role'
    const variants: Record<Role, string> = {
      admin: 'danger',
      gerente: 'primary',
      tecnico: 'secondary',
    };
    const variant = variants[role] || 'light';
    return <Badge bg={variant}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  }

  return (
    <Table striped hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Utilizador (Login)</th>
          <th>Nome Completo</th>
          <th>Perfil</th>
          <th>Unidade Organizacional</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {usersToDisplay.map((user) => (
          <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.nome_completo}</td>
            <td>{getRoleBadge(user.role)}</td>
            <td>{user.unidades_organizacionais?.nome || '[ Acesso Global ]'}</td>
            <td className="text-center">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                <Button variant="primary" size="sm" onClick={() => onEdit(user)} className="action-btn">
                  <PencilSquare /> Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(user)} className="action-btn">
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

export default UsuariosTable;