// src/pages/Patrimonio/ListaBensPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Form, Badge, Spinner, Alert, InputGroup, Pagination, Row, Col } from 'react-bootstrap';
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

  //  CONTROLO DE ACESSO: Apenas Admin e Gerente têm acesso a esta página
  const hasAccess = user?.role === 'admin' || user?.role === 'gerente';

  const fetchDados = useCallback(() => {
    //  Trava extra de segurança: não faz requisições se não tiver permissão
    if (!hasAccess) return;

    setLoading(true);
    setError(null);
    const params: any = { status_atual: filtroStatus, search: busca, page: currentPage, limit: ITEMS_PER_PAGE };
    if (user?.role !== 'admin' && user?.unidade_id) params.unidade_id = user.unidade_id;

    Promise.all([
      patrimonioService.getAllBens(params),
      unidadeService.getAllUnidades()
    ])
      .then(([bensRes, unidRes]) => {
        // Trata a paginação dos bens
        const respBens = bensRes as any;
        if (respBens.data) {
          setBens(respBens.data); 
          setTotalPages(respBens.meta?.totalPages || 1); 
          setTotalItems(respBens.meta?.total || 0);
        } else {
          setBens(respBens as BemPatrimonial[]); 
          setTotalItems((respBens as BemPatrimonial[]).length); 
          setTotalPages(1);
        }

        // Garante que o dropdown recebe sempre uma lista (Array)
        const arrayUnidades = Array.isArray(unidRes) ? unidRes : ((unidRes as any).data || []);
        setUnidades(arrayUnidades);
      })
      .catch(() => setError('Falha ao carregar o inventário de bens patrimoniais.'))
      .finally(() => setLoading(false));
  }, [filtroStatus, busca, currentPage, user, hasAccess]);

  useEffect(() => { 
    if (user && hasAccess) {
      fetchDados(); 
    } else if (user && !hasAccess) {
      setLoading(false); // Remove o loading para quem é barrado
    }
  }, [fetchDados, user, hasAccess]);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingBem) await patrimonioService.updateBem(editingBem.id, data);
      else await patrimonioService.createBem(data);
      setShowFormModal(false);
      fetchDados();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar o equipamento.');
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
      setError('Erro ao excluir. O equipamento pode estar em uso num termo de cautela.');
      setShowDeleteModal(false);
    } finally { setIsDeleting(false); }
  };

  const renderPaginationItems = () => {
    let items = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => {setCurrentPage(number); window.scrollTo(0,0);}}>
          {number}
        </Pagination.Item>
      );
    }
    return items;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo': return <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">✅ Ativo</Badge>;
      case 'Transferido': return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">🔄 Transferido</Badge>;
      case 'Inservivel':
      case 'Inservível': return <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">❌ Inservível</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">{status}</Badge>;
    }
  };

  //  TELA DE BLOQUEIO: Se o utilizador não for Gerente ou Administrador, barra o acesso
  if (!user || !hasAccess) {
    return (
      <MainLayout pageTitle="🚫 Acesso Restrito">
        <Alert variant="danger" className="shadow-sm border-0 mt-4 d-flex align-items-center p-4">
          <span className="fs-1 me-3">🔒</span>
          <div>
            <h5 className="fw-bold mb-1">Acesso Negado</h5>
            Apenas administradores e gerentes têm permissão para aceder à lista de bens patrimoniais.
          </div>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="📦 Gestão de Património">
      {error && <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="floating-card border-0 shadow-sm mb-4 bg-white border-start border-primary border-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Card.Title className="fw-bold fs-5 text-dark mb-0">🔍 Filtros de Busca do Inventário</Card.Title>
            <PrimaryButton onClick={() => { setEditingBem(null); setShowFormModal(true); }} className="px-4 shadow-sm fw-bold">
              + Novo Equipamento
            </PrimaryButton>
          </div>
          
          <Row className="g-3">
            <Col md={6} lg={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Buscar Bem</Form.Label>
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-0">🔍</InputGroup.Text>
                  <Form.Control className="bg-light border-0 shadow-none" placeholder="Tombamento ou descrição..." value={busca} onChange={(e) => {setBusca(e.target.value); setCurrentPage(1);}} />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Status do Bem</Form.Label>
                <Form.Select className="bg-light border-0 shadow-none" value={filtroStatus} onChange={(e) => { setFiltroStatus(e.target.value); setCurrentPage(1); }}>
                  <option value="">Todos os Status</option>
                  <option value="Ativo">✅ Ativos</option>
                  <option value="Transferido">🔄 Transferidos</option>
                  <option value="Inservivel">❌ Inservíveis</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Bens Registados</h5>
          {!loading && totalItems > 0 && <small className="text-muted fw-bold text-uppercase">Exibindo {bens.length} de {totalItems} itens</small>}
        </Card.Header>
        <Card.Body className="p-0 mt-3">
          {loading ? (
            <div className="text-center my-5 py-5"><Spinner animation="border" variant="primary" /><div className="mt-2 text-muted fw-medium">Carregando inventário...</div></div>
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
                      <td className="fw-medium text-dark">
                        {bem.descricao} <br/>
                        <small className="text-muted">{bem.localizacao_fisica}</small>
                        {bem.tecnico_responsavel && <span className="ms-2 badge bg-info text-dark">👤 {bem.tecnico_responsavel}</span>}
                      </td>
                      <td>{getStatusBadge(bem.status_atual)}</td>
                      <td className="pe-4 text-end">
                        <PrimaryButton size="sm" variant="outline-primary" onClick={() => { setSelectedBem(bem); setShowDetailsModal(true); }} className="me-2" title="Detalhes do Bem">⚙️</PrimaryButton>
                        <PrimaryButton size="sm" variant="outline-secondary" onClick={() => { setEditingBem(bem); setShowFormModal(true); }} className="me-2" title="Editar">✏️</PrimaryButton>
                        <PrimaryButton size="sm" variant="outline-danger" onClick={() => { setDeletingBem(bem); setShowDeleteModal(true); }} title="Excluir">🗑️</PrimaryButton>
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
            <div className="text-center text-muted p-5">
              <span className="fs-1 d-block mb-3">📭</span>
              <h5 className="fw-bold text-dark">Nenhum bem encontrado.</h5>
            </div>
          )}
        </Card.Body>
      </Card>

      <BemDetailsModal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} bem={selectedBem} onUpdate={fetchDados} />
      
      {hasAccess && (
        <>
          <ModalForm show={showFormModal} onHide={() => setShowFormModal(false)} title={editingBem ? '✏️ Editar Equipamento' : '📦 Cadastrar Novo Equipamento'}>
            <BemForm bem={editingBem} unidades={unidades} onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          </ModalForm>

          <DeleteConfirmationModal 
            show={showDeleteModal} onHide={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} 
            title="Excluir Equipamento" body={`Tem a certeza que deseja excluir o tombamento "${deletingBem?.tombamento}"?`} 
            isDeleting={isDeleting} confirmButtonText="Excluir Definitivamente" 
          />
        </>
      )}
    </MainLayout>
  );
}

export default ListaBensPage;