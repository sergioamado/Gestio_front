// src/pages/GerenciarUsuarios.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { getAllUsuarios, deleteUsuario } from '../services/usuarioService';
import type { Usuario } from '../services/usuarioService';
import UsuarioFormModal from '../components/UsuarioFormModal';
import { useAuth } from '../context/AuthContext';

const GerenciarUsuarios = () => {
  const { user: loggedInUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('Falha ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleOpenModal = (usuario: Usuario | null) => {
    setSelectedUsuario(usuario);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchUsuarios();
  };

  const handleDelete = async (usuario: Usuario) => {
    if (loggedInUser?.id === usuario.id) {
        alert("Você não pode excluir sua própria conta.");
        return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome_completo}?`)) {
      try {
        await deleteUsuario(usuario.id);
        fetchUsuarios();
      } catch (err) {
        alert('Não foi possível excluir o usuário. Ele pode estar associado a solicitações.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <>
      <h1>Gerenciar Usuários</h1>
      <p>Adicione, edite ou remova usuários do sistema.</p>
      <hr />
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Button className="mb-3" onClick={() => handleOpenModal(null)}>
        Adicionar Novo Usuário
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>Usuário (Login)</th>
            <th>Perfil</th>
            <th>Unidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.nome_completo}</td>
              <td>{usuario.username}</td>
              <td>{usuario.role}</td>
              <td>{usuario.unidades_organizacionais?.nome || 'N/A (Admin)'}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(usuario)}>
                  Editar
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(usuario)}>
                  Excluir
                </Button>
                {/* Botão para resetar senha pode ser adicionado aqui */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <UsuarioFormModal 
        show={showModal}
        handleClose={handleCloseModal}
        onSuccess={handleSuccess}
        currentUser={selectedUsuario}
      />
    </>
  );
};

export default GerenciarUsuarios;