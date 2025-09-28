// src/pages/UnidadesPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import UnidadesTable from '../components/unidades/UnidadesTable';
import ModalForm from '../components/ModalForm';
import UnidadeForm from '../components/unidades/UnidadeForm';

import * as unidadeService from '../services/unidadeService';
import  type { Unidade, UnidadeCreateData } from '../types/index';

function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUnidades = () => {
    setLoading(true);
    unidadeService.getAllUnidades()
      .then(setUnidades)
      .catch(() => setError('Falha ao carregar unidades.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  const handleShowCreateModal = () => {
    setEditingUnidade(null);
    setShowModal(true);
  };

  const handleShowEditModal = (unidade: Unidade) => {
    setEditingUnidade(unidade);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: UnidadeCreateData) => {
    setIsSubmitting(true);
    try {
      if (editingUnidade) {
        await unidadeService.updateUnidade(editingUnidade.id, data);
      } else {
        await unidadeService.createUnidade(data);
      }
      setShowModal(false);
      fetchUnidades(); // Recarrega a lista
    } catch (err) {
      // Idealmente, tratar o erro de forma mais específica
      setError('Erro ao salvar unidade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (unidade: Unidade) => {
    // Adicionar um modal de confirmação aqui seria o ideal
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${unidade.nome}"?`)) {
      try {
        await unidadeService.deleteUnidade(unidade.id);
        fetchUnidades(); // Recarrega a lista
      } catch (err) {
        setError('Não foi possível excluir. A unidade pode estar em uso.');
      }
    }
  };


  return (
    <MainLayout pageTitle="🏢 Unidades Organizacionais">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="floating-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Unidades Cadastradas</h5>
          <PrimaryButton onClick={handleShowCreateModal}>
            + Nova Unidade
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <UnidadesTable unidades={unidades} onEdit={handleShowEditModal} onDelete={handleDelete} />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showModal} 
        onHide={() => setShowModal(false)}
        title={editingUnidade ? 'Editar Unidade' : 'Cadastrar Nova Unidade'}
      >
        <UnidadeForm 
            unidade={editingUnidade}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
        />
      </ModalForm>
    </MainLayout>
  );
}

export default UnidadesPage;