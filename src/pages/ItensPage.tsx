// src/pages/ItensPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import ItensTable from '../components/itens/ItensTable';
import ModalForm from '../components/ModalForm';
import ItemForm from '../components/itens/ItemForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../hooks/useAuth';
import ItemDetailsModal from '../components/itens/ItemDetailsModal';

import * as itemService from '../services/itemService';
import * as unidadeService from '../services/unidadeService';
// Importação limpa pelo nosso barril
import type { Item, ItemCreateData, Unidade } from '../types';

function ItensPage() {
  const { user } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);

  const canManageItems = user?.role === 'admin' || user?.role === 'gerente';

  const fetchData = () => {
    setLoading(true);
    setError(null);
    
    const unidadeIdParaFiltrar = user?.role === 'admin' ? undefined : user?.unidade_id;

    const promises: [Promise<Item[]>, Promise<Unidade[]>?] = [
      itemService.getAllItems(unidadeIdParaFiltrar)
    ];

    if (user?.role === 'admin') {
      promises.push(unidadeService.getAllUnidades());
    }

    Promise.all(promises)
      .then((results) => {
        const [itemsData, unidadesData] = results;
        setItens(itemsData as Item[]);
        if (unidadesData) {
          setUnidades(unidadesData as Unidade[]);
        }
      })
      .catch((err: any) => {
        const errorMessage = err.response?.data?.message || 'Falha ao carregar o catálogo de itens.';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleShowCreateModal = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleShowEditModal = (item: Item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleShowDetailsModal = (item: Item) => {
    setViewingItem(item);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (data: ItemCreateData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const finalData = { ...data };
      if (editingItem) {
        await itemService.updateItem(editingItem.id, finalData);
      } else {
        await itemService.createItem(finalData);
      }
      setShowFormModal(false);
      fetchData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar o item.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowDeleteModal = (item: Item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setError(null);
    try {
      await itemService.deleteItem(deletingItem.id);
      setShowDeleteModal(false);
      fetchData();
    } catch (err: any) {
      setError('Não foi possível excluir. O item provavelmente já está associado a uma Ordem de Serviço.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout pageTitle="📦 Gerenciar Itens e Ferramentas">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Catálogo de Estoque</h5>
          {canManageItems && (
            <PrimaryButton onClick={handleShowCreateModal}>
              + Novo Item
            </PrimaryButton>
          )}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Carregando catálogo de itens...</div>
            </div>
          ) : (
             <ItensTable 
              itens={itens} 
              onEdit={handleShowEditModal} 
              onDelete={handleShowDeleteModal}
              onDetails={handleShowDetailsModal} 
            />
          )}
        </Card.Body>
      </Card>

      {canManageItems && (
        <>
          <ModalForm 
            show={showFormModal} 
            onHide={() => setShowFormModal(false)}
            title={editingItem ? '✏️ Editar Item do Catálogo' : '📦 Cadastrar Novo Item'}
          >
            <ItemForm 
                item={editingItem}
                unidades={unidades}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
            />
          </ModalForm>

          <DeleteConfirmationModal 
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão"
            body={`Tem certeza que deseja excluir o item "${deletingItem?.descricao}"? Esta ação não pode ser desfeita.`}
            isDeleting={isDeleting}
            confirmButtonText="Excluir Item"
          />
        </>
      )}

       <ItemDetailsModal 
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        item={viewingItem}
      />
    </MainLayout>
  );
}

export default ItensPage;