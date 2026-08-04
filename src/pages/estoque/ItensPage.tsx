// src/pages/ItensPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Spinner, Alert, Card, Row, Col, InputGroup, Form, Pagination } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ItensTable from '../../components/itens/ItensTable';
import ModalForm from '../../components/ModalForm';
import ItemForm from '../../components/itens/ItemForm';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import ItemDetailsModal from '../../components/itens/ItemDetailsModal';
import * as itemService from '../../services/itemService';
import * as unidadeService from '../../services/unidadeService';
import type { Item, ItemCreateData, Unidade } from '../../types';

function ItensPage() {
  const { user } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Modais
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);

  // 🚀 Regra de Ouro: Apenas Admin e Gerente podem gerir e ver quantidades
  const canManageItems = user?.role === 'admin' || user?.role === 'gerente';

  // Estados de Paginação e Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchItens = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    const params: any = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm
    };

    if (user.role !== 'admin' && user.unidade_id) {
      params.unidade_id = user.unidade_id;
    }

    const promises: [Promise<any>, Promise<Unidade[]>?] = [
      itemService.getAllItems ? itemService.getAllItems(params) : (itemService as any).getAllItens(params)
    ];

    if (user.role === 'admin') {
      promises.push(unidadeService.getAllUnidades());
    }

    Promise.all(promises)
      .then((results) => {
        const [itemsResponse, unidadesData] = results;
        
        if (itemsResponse.data && itemsResponse.meta) {
          setItens(itemsResponse.data);
          setTotalPages(itemsResponse.meta.totalPages);
          setTotalItems(itemsResponse.meta.total);
        } else {
          setItens(itemsResponse as Item[]);
          setTotalItems((itemsResponse as Item[]).length);
          setTotalPages(1);
        }

        if (unidadesData) {
          setUnidades(unidadesData as Unidade[]);
        }
      })
      .catch((err: any) => {
        const errorMessage = err.response?.data?.message || 'Falha ao carregar o catálogo de itens.';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [user, currentPage, searchTerm]);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    let items = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
          {number}
        </Pagination.Item>
      );
    }
    return items;
  };

  // 🚀 Travas de segurança nas ações
  const handleShowCreateModal = () => {
    if (!canManageItems) return;
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleShowEditModal = (item: Item) => {
    if (!canManageItems) return;
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleShowDetailsModal = (item: Item) => {
    setViewingItem(item);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (data: ItemCreateData) => {
    if (!canManageItems) return;
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
      fetchItens();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar o item.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowDeleteModal = (item: Item) => {
    if (!canManageItems) return;
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!canManageItems || !deletingItem) return;
    setIsDeleting(true);
    setError(null);
    try {
      await itemService.deleteItem(deletingItem.id);
      setShowDeleteModal(false);
      fetchItens();
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

      {/* Painel de Pesquisa e Ações */}
      <Card className="floating-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-light border-0 text-muted">🔍</InputGroup.Text>
              <Form.Control 
                placeholder="Buscar por nome ou código SIPAC..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-light border-0 shadow-none"
              />
            </InputGroup>
          </div>
          
          {canManageItems && (
            <PrimaryButton onClick={handleShowCreateModal} className="px-4 shadow-sm fw-bold">
              + Cadastrar Novo Item
            </PrimaryButton>
          )}
        </Card.Body>
      </Card>
      
      {/* Tabela de Itens */}
      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-1">Catálogo de Estoque</h5>
            {!loading && totalItems > 0 && (
               <small className="text-muted fw-bold text-uppercase">
                 Exibindo {itens.length} de {totalItems} registros
               </small>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted fw-medium">Carregando catálogo de itens...</div>
            </div>
          ) : itens.length > 0 ? (
             <ItensTable 
              itens={itens} 
              // 🚀 Passa null/undefined se não puder editar/excluir
              onEdit={canManageItems ? handleShowEditModal : undefined} 
              onDelete={canManageItems ? handleShowDeleteModal : undefined}
              onDetails={handleShowDetailsModal}
              canManageItems={canManageItems} // 🚀 Passamos a permissão para a tabela esconder a coluna "Quantidade"
            />
          ) : (
             <div className="text-center text-muted p-5 border border-dashed rounded bg-light my-3">
                <span className="fs-1 d-block mb-3">📭</span>
                <h6 className="fw-bold text-dark">Nenhum item encontrado.</h6>
                <p className="mb-0 small">Nenhum registro corresponde à sua busca.</p>
             </div>
          )}

          {/* Paginação */}
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 mb-2">
              <Pagination className="shadow-sm">
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                
                {renderPaginationItems()}
                
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modais de Ação */}
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
        canManageItems={canManageItems} 
      />
    </MainLayout>
  );
}

export default ItensPage;