// src/pages/UsuariosPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import UsuariosTable from '../components/usuarios/UsuariosTable';
import ModalForm from '../components/ModalForm';
import UsuarioForm from '../components/usuarios/UsuarioForm';

import * as usuarioService from '../services/usuarioService';
import type { User, UserCreateData, UserUpdateData, Role } from '../types/index';
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
    })
    .catch((err: any) => {
      const errorMessage = err.response?.data?.message || 'Falha ao carregar dados. Verifique a consola do backend e se o URL da API está correto.';
      setError(errorMessage);
    })
    .finally(() => {
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
    
    const processedData = {
        ...data,
        unidade_id: (data as { role: Role }).role === 'admin' 
          ? null 
          : (data.unidade_id ? Number(data.unidade_id) : null),
    };

    try {
      if (editingUser) {
        const { username, password, ...updateData } = processedData as any;
        await usuarioService.updateUser(editingUser.id, updateData);
      } else {
        await usuarioService.createUser(processedData as UserCreateData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      // CORRIGIDO: Lógica simplificada para garantir que apenas texto seja exibido
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao guardar o utilizador.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Tem a certeza de que deseja excluir o utilizador "${user.username}"?`)) {
      try {
        await usuarioService.deleteUser(user.id);
        fetchData();
      } catch (err) {
        setError('Não foi possível excluir. O utilizador pode estar associado a solicitações.');
      }
    }
  };

  return (
    <MainLayout pageTitle="👥 Gerir Utilizadores">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Utilizadores Registados</h5>
          <PrimaryButton onClick={handleShowCreateModal}>
            + Novo Utilizador
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
        title={editingUser ? 'Editar Utilizador' : 'Registar Novo Utilizador'}
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