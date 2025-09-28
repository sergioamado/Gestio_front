// src/pages/UsuariosPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import UsuariosTable from '../components/usuarios/UsuariosTable';
import ModalForm from '../components/ModalForm';
import UsuarioForm from '../components/usuarios/UsuarioForm';

import * as usuarioService from '../services/usuarioService';
import type { User, UserCreateData, UserUpdateData } from '../types/index';
import * as unidadeService from '../services/unidadeService';
import type { Unidade } from '../types/index';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      usuarioService.getAllUsers(),
      unidadeService.getAllUnidades()
    ]).then(([usersData, unidadesData]) => {
      setUsuarios(usersData);
      setUnidades(unidadesData);
    }).catch(() => {
      setError('Falha ao carregar dados da página.');
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowCreateModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleShowEditModal = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: UserCreateData | UserUpdateData) => {
    setIsSubmitting(true);
    setError(null);
    
    // Converte unidade_id para número ou nulo, pois o form envia como string
    const processedData = {
        ...data,
        unidade_id: data.unidade_id ? Number(data.unidade_id) : null,
    };

    try {
      if (editingUser) {
        // Para edição, removemos campos que o backend não espera na atualização
        const { username, password, ...updateData } = processedData as UserUpdateData & { username: string, password?: string };
        await usuarioService.updateUser(editingUser.id, updateData);
      } else {
        await usuarioService.createUser(processedData as UserCreateData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || 'Erro ao salvar usuário. O nome de usuário ou email pode já existir.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setEditingUser(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.username}"?`)) {
      try {
        await usuarioService.deleteUser(user.id);
        fetchData();
      } catch (err) {
        setError('Não foi possível excluir. O usuário pode estar associado a solicitações.');
      }
    }
  };

  return (
    <MainLayout pageTitle="👥 Gerenciar Usuários">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Usuários Cadastrados</h5>
          <PrimaryButton onClick={handleShowCreateModal}>
            + Novo Usuário
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <UsuariosTable usuarios={usuarios} onEdit={handleShowEditModal} onDelete={handleDelete} />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showModal} 
        onHide={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
      >
        <UsuarioForm 
            usuario={editingUser}
            unidades={unidades}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
        />
      </ModalForm>
    </MainLayout>
  );
}

export default UsuariosPage;