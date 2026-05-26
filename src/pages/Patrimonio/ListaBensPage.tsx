// src/pages/Patrimonio/ListaBensPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Form, Badge, Spinner, Alert, InputGroup, Pagination } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import BemDetailsModal from '../../components/patrimonio/BemDetailsModal';
import ModalForm from '../../components/ModalForm';
import BemForm from '../../components/patrimonio/BemForm';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

import * as patrimonioService from '../../services/patrimonioService';
import * as unidadeService from '../../services/unidadeService';
import { useAuth } from '../../hooks/useAuth';
import type { BemPatrimonial, Unidade } from '../../types';

function ListaBensPage() {
  const { user } = useAuth();
  const [bens, setBens] = useState<BemPatrimonial[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBem, setSelectedBem] = useState<BemPatrimonial | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBem, setEditingBem] = useState<BemPatrimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBem, setDeletingBem] = useState<BemPatrimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const canManage = user?.role === 'admin' || user?.role === 'gerente';

  const fetchDados = useCallback(() => {
    setLoading(true);
    const params: any = { status_atual: filtroStatus, search: busca, page: currentPage, limit: ITEMS_PER_PAGE };
    if (user?.role !== 'admin' && user?.unidade_id) params.unidade_id = user.unidade_id;

    Promise.all([patrimonioService.getAllBens(params), unidadeService.getAllUnidades()])
      .then(([bensRes, unidRes]) => {
        const respBens = bensRes as any;
        if (respBens.data) {
          setBens(respBens.data); setTotalPages(respBens.meta.totalPages); setTotalItems(respBens.meta.total);
        } else {
          setBens(respBens as BemPatrimonial[]); setTotalItems((respBens as BemPatrimonial[]).length); setTotalPages(1);
        }
        setUnidades(unidRes);
      }).catch(() => setError('Falha ao carregar o inventário.')).finally(() => setLoading(false));
  }, [filtroStatus, busca, currentPage, user]);

  useEffect(() => { fetchDados(); }, [fetchDados]);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingBem) await patrimonioService.updateBem(editingBem.id, data);
      else await patrimonioService.createBem(data);
      setShowFormModal(false);
      fetchDados();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar o bem.');
    } finally { setIsSubmitting(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBem) return;
    setIsDeleting(true);
    try {
      await patrimonioService.deleteBem(deletingBem.id);
      setShowDeleteModal(false);
      fetchDados();
    } catch (err) {
      setError('Erro ao excluir. O bem pode estar em uso.');
      setShowDeleteModal(false);
    } finally { setIsDeleting(false); }
  };

  const renderPaginationItems = () => {
    let items = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    for (let number = startPage; number <= endPage; number++) {
      items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => {setCurrentPage(number); window.scrollTo(0,0);}}>{number}</Pagination.Item>);
    }
    return items;
  };

  return (
    <MainLayout pageTitle="📦 Gestão de Património">
      {error && <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="floating-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between gap-3">
          <div className="d-flex gap-3 w-100" style={{ maxWidth: '600px' }}>
            <InputGroup className="shadow-sm flex-grow-1">
              <InputGroup.Text className="bg-light border-0">🔍</InputGroup.Text>
              <Form.Control className="bg-light border-0" placeholder="Buscar..." value={busca} onChange={(e) => {setBusca(e.target.value); setCurrentPage(1);}} />
            </InputGroup>
            <Form.Select className="bg-light border-0 shadow-sm w-auto" value={filtroStatus} onChange={(e) => { setFiltroStatus(e.target.value); setCurrentPage(1); }}>
              <option value="">Todos Status</option>
              <option value="Ativo">✅ Ativos</option>
              <option value="Transferido">🔄 Transferidos</option>
            </Form.Select>
          </div>
          {canManage && <PrimaryButton onClick={() => { setEditingBem(null); setShowFormModal(true); }}>+ Novo Equipamento</PrimaryButton>}
        </Card.Body>
      </Card>

      <Card className="floating-card border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
          ) : bens.length > 0 ? (
            <>
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light text-secondary">
                  <tr>
                    <th className="ps-4 border-0">Tombamento</th>
                    <th className="border-0">Descrição</th>
                    <th className="border-0">Status</th>
                    <th className="pe-4 text-end border-0">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bens.map(bem => (
                    <tr key={bem.id}>
                      <td className="ps-4"><span className="fw-bold text-primary bg-light px-2 py-1 rounded">{bem.tombamento}</span></td>
                      <td className="fw-medium text-dark">{bem.descricao} <br/><small className="text-muted">{bem.localizacao_fisica}</small></td>
                      <td>{bem.status_atual === 'Ativo' ? <Badge bg="success">✅ Ativo</Badge> : <Badge bg="warning" text="dark">🔄 Transferido</Badge>}</td>
                      <td className="pe-4 text-end">
                        <PrimaryButton size="sm" variant="outline-primary" onClick={() => { setSelectedBem(bem); setShowDetailsModal(true); }} className="me-2">⚙️</PrimaryButton>
                        {canManage && (
                          <>
                            <PrimaryButton size="sm" variant="outline-secondary" onClick={() => { setEditingBem(bem); setShowFormModal(true); }} className="me-2">✏️</PrimaryButton>
                            <PrimaryButton size="sm" variant="outline-danger" onClick={() => { setDeletingBem(bem); setShowDeleteModal(true); }}>🗑️</PrimaryButton>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3">
                  <Pagination className="mb-0">
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                    {renderPaginationItems()}
                    <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted p-5">📭 Nenhum bem encontrado.</div>
          )}
        </Card.Body>
      </Card>

      <BemDetailsModal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} bem={selectedBem} onUpdate={fetchDados} />
      
      <ModalForm show={showFormModal} onHide={() => setShowFormModal(false)} title={editingBem ? '✏️ Editar Equipamento' : '📦 Cadastrar Equipamento'}>
        <BemForm bem={editingBem} unidades={unidades} onSubmit={handleFormSubmit} isLoading={isSubmitting} />
      </ModalForm>

      <DeleteConfirmationModal 
        show={showDeleteModal} onHide={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} 
        title="Excluir Equipamento" body={`Deseja excluir o tombamento "${deletingBem?.tombamento}"?`} 
        isDeleting={isDeleting} confirmButtonText="Excluir Definitivamente" 
      />
    </MainLayout>
  );
}

export default ListaBensPage;