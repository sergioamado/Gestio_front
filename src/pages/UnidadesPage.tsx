// src/pages/UnidadesPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import UnidadesTable from '../components/unidades/UnidadesTable';
import ModalForm from '../components/ModalForm';
import UnidadeForm from '../components/unidades/UnidadeForm';

import * as unidadeService from '../services/unidadeService';
import type { Unidade, UnidadeCreateData } from '../types';

function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUnidades = () => {
    setLoading(true);
    setError(null);
    unidadeService.getAllUnidades()
      .then(setUnidades)
      .catch((err: any) => {
        const errorMessage = err.response?.data?.message || 'Falha ao carregar as unidades organizacionais.';
        setError(errorMessage);
      })
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
    setError(null);
    try {
      if (editingUnidade) {
        await unidadeService.updateUnidade(editingUnidade.id, data);
      } else {
        await unidadeService.createUnidade(data);
      }
      setShowModal(false);
      fetchUnidades(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar a unidade.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (unidade: Unidade) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${unidade.nome}"?`)) {
      try {
        await unidadeService.deleteUnidade(unidade.id);
        fetchUnidades(); 
      } catch (err: any) {
        setError('Não foi possível excluir. Esta unidade pode estar vinculada a usuários, itens ou solicitações existentes.');
      }
    }
  };

  return (
    <MainLayout pageTitle="🏢 Unidades Organizacionais">
      {error && (
        <Alert variant="danger" className="shadow-sm" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Unidades Cadastradas</h5>
          <PrimaryButton onClick={handleShowCreateModal}>
            + Nova Unidade
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Carregando unidades...</div>
            </div>
          ) : (
            <UnidadesTable unidades={unidades} onEdit={handleShowEditModal} onDelete={handleDelete} />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showModal} 
        onHide={() => setShowModal(false)}
        title={editingUnidade ? '✏️ Editar Unidade' : '🏢 Cadastrar Nova Unidade'}
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