// src/pages/GerenciarUnidades.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { getAllUnidades, deleteUnidade } from '../services/unidadeService';
import type { Unidade } from '../services/unidadeService';
import UnidadeFormModal from '../components/UnidadeFormModal';

const GerenciarUnidades = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);

  const fetchUnidades = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllUnidades();
      setUnidades(data);
    } catch (err) {
      setError('Falha ao carregar unidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  const handleOpenModal = (unidade: Unidade | null) => {
    setSelectedUnidade(unidade);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUnidade(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchUnidades();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        await deleteUnidade(id);
        fetchUnidades();
      } catch (err) {
        alert('Não foi possível excluir a unidade. Ela pode estar em uso por usuários ou itens.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <>
      <h1>Gerenciar Unidades Organizacionais</h1>
      <p>Adicione, edite ou remova unidades do sistema.</p>
      <hr />
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Button className="mb-3" onClick={() => handleOpenModal(null)}>
        Adicionar Nova Unidade
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nome da Unidade</th>
            <th>Sigla</th>
            <th>Campus</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {unidades.map(unidade => (
            <tr key={unidade.id}>
              <td>{unidade.nome}</td>
              <td>{unidade.sigla}</td>
              <td>{unidade.campus}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(unidade)}>
                  Editar
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(unidade.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <UnidadeFormModal 
        show={showModal}
        handleClose={handleCloseModal}
        onSuccess={handleSuccess}
        currentUnidade={selectedUnidade}
      />
    </>
  );
};

export default GerenciarUnidades;