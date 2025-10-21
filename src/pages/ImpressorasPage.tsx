// src/pages/ImpressorasPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Row, Col, Form, Button, Stack } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import ModalForm from '../components/ModalForm';
import { useAuth } from '../hooks/useAuth';
import * as impressoraService from '../services/impressoraService';
import type { Impressora, ImpressoraCreateData, ImpressoraFiltros, ImpressoraUpdateData, Unidade } from '../types';
import * as unidadeService from '../services/unidadeService';
import ImpressorasTable from '../components/impressoras/ImpressorasTable';
import ImpressoraForm from '../components/impressoras/ImpressoraForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ImpressoraDetailsModal from '../components/impressoras/ImpressoraDetailsModal';

function ImpressorasPage() {
  const { user } = useAuth();
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingImpressora, setEditingImpressora] = useState<Impressora | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingImpressora, setDeletingImpressora] = useState<Impressora | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingImpressora, setViewingImpressora] = useState<Impressora | null>(null);
  
  const [filtros, setFiltros] = useState<ImpressoraFiltros>({});

  const fetchData = (currentFilters: ImpressoraFiltros = {}) => {
    setLoading(true);
    setError(null);
    impressoraService.getFilteredImpressoras(currentFilters)
      .then(setImpressoras)
      .catch(() => setError('Falha ao carregar impressoras.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      unidadeService.getAllUnidades()
        .then(setUnidades)
        .catch(() => setError('Falha ao carregar lista de unidades.'));
      fetchData();
    }
  }, [user]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleFiltrar = () => {
    fetchData(filtros);
  };
  
  const handleLimparFiltros = () => {
    setFiltros({});
    fetchData();
  };

  const handleShowCreateModal = () => {
    setEditingImpressora(null);
    setShowFormModal(true);
  };
  
  const handleShowEditModal = (impressora: Impressora) => {
    setEditingImpressora(impressora);
    setShowFormModal(true);
  };

  const handleShowDetailsModal = (impressora: Impressora) => {
    setViewingImpressora(impressora);
    setShowDetailsModal(true);
  };

  const handleShowDeleteModal = (impressora: Impressora) => {
    setDeletingImpressora(impressora);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (data: ImpressoraCreateData | ImpressoraUpdateData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // <<< LÓGICA CORRETA RESTAURADA AQUI >>>
      if (editingImpressora) {
        // Se estamos a editar, usamos o ID da impressora em estado para chamar o update
        await impressoraService.updateImpressora(editingImpressora.id, data as ImpressoraUpdateData);
      } else {
        // Se estamos a criar, calculamos a unidade_id e chamamos o create
        const createData = data as ImpressoraCreateData;
        let unidadeIdFinal: number;
        if (user?.role === 'admin') {
          if (!createData.unidade_id) throw new Error("A unidade organizacional é obrigatória.");
          unidadeIdFinal = Number(createData.unidade_id);
        } else {
          if (!user?.unidade_id) throw new Error("Utilizador não está associado a uma unidade.");
          unidadeIdFinal = user.unidade_id;
        }
        await impressoraService.createImpressora({ ...createData, unidade_id: unidadeIdFinal });
      }
      setShowFormModal(false);
      fetchData(filtros); // Re-busca os dados com os filtros atuais
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar a impressora.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingImpressora) return;
    setIsDeleting(true);
    setError(null);
    try {
      await impressoraService.deleteImpressora(deletingImpressora.id);
      setShowDeleteModal(false);
      fetchData(filtros);
    } catch (err) {
      setError('Não foi possível excluir a impressora.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout pageTitle="🖨️ Gerir Impressoras">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      <Card className="floating-card mb-4">
        <Card.Header as="h5">Filtros de Pesquisa</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="mb-2"><Form.Group><Form.Label>IP</Form.Label><Form.Control type="text" name="ip" value={filtros.ip || ''} onChange={handleFiltroChange} /></Form.Group></Col>
            <Col md={3} className="mb-2"><Form.Group><Form.Label>Nº de Série</Form.Label><Form.Control type="text" name="numero_serie" value={filtros.numero_serie || ''} onChange={handleFiltroChange} /></Form.Group></Col>
            {user?.role === 'admin' && (
              <Col md={3} className="mb-2">
                <Form.Group><Form.Label>Unidade Organizacional</Form.Label>
                  <Form.Select name="unidade_id_filtro" value={filtros.unidade_id_filtro || ''} onChange={handleFiltroChange}>
                    <option value="">Todas</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col md={3} className="mb-2">
              <Form.Group><Form.Label>Políticas Aplicadas</Form.Label>
                <Form.Select name="politicas_aplicadas" value={filtros.politicas_aplicadas || ''} onChange={handleFiltroChange}>
                  <option value="">Todas</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Stack direction="horizontal" gap={2} className="mt-3 justify-content-end">
            <Button variant="outline-secondary" onClick={handleLimparFiltros}>Limpar Filtros</Button>
            <PrimaryButton onClick={handleFiltrar} isLoading={loading}>Filtrar</PrimaryButton>
          </Stack>
        </Card.Body>
      </Card>
      
      <Card className="floating-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Impressoras Registadas</h5>
          <PrimaryButton onClick={handleShowCreateModal}>+ Nova Impressora</PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
             <ImpressorasTable 
                impressoras={impressoras}
                onEdit={handleShowEditModal}
                onDelete={handleShowDeleteModal}
                onDetails={handleShowDetailsModal}
             />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)}
        title={editingImpressora ? 'Editar Impressora' : 'Registar Nova Impressora'}
      >
        <ImpressoraForm
            impressora={editingImpressora}
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
        body={`Tem a certeza de que deseja excluir a impressora "${deletingImpressora?.nome}"?`}
        isDeleting={isDeleting}
      />
      
      <ImpressoraDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        impressora={viewingImpressora}
      />
    </MainLayout>
  );
}

export default ImpressorasPage;