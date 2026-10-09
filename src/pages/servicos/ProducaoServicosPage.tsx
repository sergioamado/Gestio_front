// src/pages/ProducaoServicosPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Modal } from 'react-bootstrap';
import { PlusCircle, Tools } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { servicosService } from '../../services/servicosService';

import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import ProducaoTable from '../../components/servicos/ProducaoTable';
import ProducaoForm from '../../components/servicos/ProducaoForm';

import type { CatalogoServico, ProducaoServico } from '../../types';

function ProducaoServicosPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const prefillData = location.state || {};

  const [historico, setHistorico] = useState<ProducaoServico[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ProducaoServico | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isGestor = user?.role === 'admin' || user?.role === 'gerente';

  useEffect(() => {
    carregarDados();

    if (prefillData && prefillData.defaultVinculoId) {
       setShowFormModal(true);
       // Limpa o estado usando o React Router de forma segura
       navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [historicoData, catalogoData] = await Promise.all([
        servicosService.getHistorico(),
        servicosService.getCatalogo()
      ]);
      setHistorico(historicoData || []);
      setCatalogo((catalogoData || []).filter(c => c.ativo));
    } catch (error) {
      setError("Falha ao carregar os dados. Verifique a sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await servicosService.registrarProducao(payload);
      await carregarDados();
      setSuccessMsg("Produção registada com sucesso!");
      setShowFormModal(false);
      
      if (prefillData.defaultVinculoId) {
         setTimeout(() => navigate('/gerenciar-solicitacoes'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao registar produção. O ID do chamado pode estar incorreto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await servicosService.deleteProducao(deletingItem.id);
      await carregarDados();
      setSuccessMsg("Registo apagado com sucesso.");
      setShowDeleteModal(false);
    } catch (err: any) {
      setError("Não foi possível apagar o registo.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout pageTitle="⚙️ Registo de Produção">
      
      {error && <Alert variant="danger" className="shadow-sm border-0 mb-3" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" className="shadow-sm border-0 mb-3" onClose={() => setSuccessMsg(null)} dismissible>{successMsg}</Alert>}

      <Card className="floating-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-1"><Tools className="me-2 text-primary" /> Histórico de Produção</h5>
            <small className="text-muted">Acompanhe os custos e serviços realizados.</small>
          </div>
          <PrimaryButton onClick={() => setShowFormModal(true)} className="px-4 shadow-sm fw-bold">
            <PlusCircle className="me-2" /> Lançar Serviço
          </PrimaryButton>
        </Card.Body>
      </Card>

      <Card className="floating-card border-0 shadow-sm">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center my-5 py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <ProducaoTable historico={historico} isGestor={isGestor} onDelete={(item) => { setDeletingItem(item); setShowDeleteModal(true); }} />
          )}
        </Card.Body>
      </Card>

      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} size="xl" centered backdrop="static">
        <Modal.Header closeButton className="bg-light border-0 pb-4">
          <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center">
            <Tools className="me-2 text-primary" /> Lançar Fechamento de Serviço
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0 bg-light">
          <ProducaoForm 
            catalogo={catalogo}
            historico={historico}
            user={user}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
            onCancel={() => setShowFormModal(false)}
            defaultTipoVinculo={prefillData.defaultTipoVinculo}
            defaultVinculoId={prefillData.defaultVinculoId}
            defaultPatrimonio={prefillData.defaultPatrimonio}
          />
        </Modal.Body>
      </Modal>

      <DeleteConfirmationModal 
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        body="Tem certeza que deseja apagar este registo de produção? O valor será removido do histórico."
        isDeleting={isDeleting}
        confirmButtonText="Apagar Registo"
      />
    </MainLayout>
  );
}

export default ProducaoServicosPage;