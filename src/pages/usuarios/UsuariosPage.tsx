// src/pages/UsuariosPage.tsx
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import UsuariosTable from '../../components/usuarios/UsuariosTable';
import ModalForm from '../../components/ModalForm';
import UsuarioForm from '../../components/usuarios/UsuarioForm';

import * as usuarioService from '../../services/usuarioService';
import * as unidadeService from '../../services/unidadeService';
import type { User, UserCreateData, UserUpdateData, Role, Unidade } from '../../types';
import { useTempoReal } from '../../hooks/useTempoReal';

function UsuariosPage() {
  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // silencioso = recarga em tempo real (sem spinner)
  const fetchData = (silencioso = false) => {
    if (silencioso !== true) setLoading(true);
    setError(null);
    Promise.all([
      usuarioService.getAllUsers(),
      unidadeService.getAllUnidades()
    ]).then(([usersData, unidadesData]) => {
      setUsuarios(usersData);
      setUnidades(unidadesData);
    })
    .catch((err: any) => {
      const errorMessage = err.response?.data?.message || 'Falha ao carregar dados. Verifique a conexão com o servidor.';
      setError(errorMessage);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useTempoReal(['usuarios', 'unidades'], () => fetchData(true));
  
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
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar o usuário.';
      mostrarCard('Erro', errorMessage, 'erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (await confirmar({ titulo: '🗑️ Excluir Usuário', mensagem: `Tem certeza de que deseja excluir o usuário "${user.nome_completo || user.username}"?`, textoConfirmar: 'Sim, Excluir', varianteBotao: 'danger' })) {
      try {
        await usuarioService.deleteUser(user.id);
        fetchData();
      } catch {
        mostrarCard('Erro', 'Não foi possível excluir. Este usuário possui Ordens de Serviço associadas a ele.', 'erro');
      }
    }
  };

  return (
    <MainLayout pageTitle="👥 Gerenciar Usuários">
      {error && <Alert variant="danger" className="shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Usuários Cadastrados</h5>
          <PrimaryButton onClick={handleShowCreateModal}>
            + Novo Usuário
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Carregando usuários...</div>
            </div>
          ) : (
            <UsuariosTable usuarios={usuarios} onEdit={handleShowEditModal} onDelete={handleDelete} />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showModal} 
        onHide={() => setShowModal(false)}
        title={editingUser ? '✏️ Editar Usuário' : '👤 Cadastrar Novo Usuário'}
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