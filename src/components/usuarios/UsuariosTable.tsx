// src/components/usuarios/UsuariosTable.tsx
import { Table, Button, Stack, Badge } from 'react-bootstrap';
import { PencilSquare, Trash3Fill } from 'react-bootstrap-icons';
import type { User } from '../../types/index'; 
import { useAuth } from '../../hooks/useAuth';

interface UsuariosTableProps {
  usuarios: User[];
  onEdit: (usuario: User) => void;
  onDelete: (usuario: User) => void;
}

// Corrigido: Definimos um tipo para as chaves do objeto de variantes.
type Role = 'admin' | 'gerente' | 'tecnico';

function UsuariosTable({ usuarios, onEdit, onDelete }: UsuariosTableProps) {
  const { user: currentUser } = useAuth();

  const usersToDisplay = usuarios.filter(u => u.id !== currentUser?.id);

  // Corrigido: A função agora espera um tipo 'Role' em vez de uma 'string' genérica.
  const getRoleBadge = (role: Role) => {
    const variants: Record<Role, string> = {
      admin: 'danger',
      gerente: 'primary',
      tecnico: 'secondary',
    };
    // Agora o TypeScript sabe que 'role' será sempre uma chave válida de 'variants'.
    const variant = variants[role] || 'light';
    return <Badge bg={variant}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  }

  return (
    <Table striped hover responsive className="align-middle">
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