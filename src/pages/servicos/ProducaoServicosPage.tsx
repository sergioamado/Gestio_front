// src/pages/ProducaoServicosPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Modal } from 'react-bootstrap';
import { PlusCircle, Tools } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext'; // Import do Toast
import { useConfirm } from '../../contexts/ConfirmContext'; // Import do Confirm

import { servicosService } from '../../services/servicosService';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ProducaoTable from '../../components/servicos/ProducaoTable';
import ProducaoForm from '../../components/servicos/ProducaoForm';

import type { CatalogoServico, ProducaoServico } from '../../types';

function ProducaoServicosPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { mostrarCard } = useToast();
  const { confirmar } = useConfirm();
  
  const prefillData = location.state || {};

  const [historico, setHistorico] = useState<ProducaoServico[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGestor = user?.role === 'admin' || user?.role === 'gerente';

  useEffect(() => {
    carregarDados();

    if (prefillData && prefillData.defaultVinculoId) {
       setShowFormModal(true);
       // Limpa o estado usando o React Router de forma segura
       navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      await servicosService.registrarProducao(payload);
      await carregarDados();
      mostrarCard('Sucesso', 'Produção registada com sucesso!', 'sucesso');
      setShowFormModal(false);
      
      if (prefillData.defaultVinculoId) {
         setTimeout(() => navigate('/gerenciar-solicitacoes'), 1500);
      }
    } catch (err: any) {
      mostrarCard('Erro', err.response?.data?.message || "Erro ao registar produção. Verifique os dados informados.", 'erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nova função de exclusão usando o useConfirm Global
  const handleDeleteClick = async (item: ProducaoServico) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Apagar Registo',
      mensagem: `Tem certeza que deseja apagar o registo do serviço "${item.servico?.nome_servico}"? O valor será removido do histórico e dos relatórios.`,
      textoConfirmar: 'Sim, Apagar',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (confirmou) {
      try {
        await servicosService.deleteProducao(item.id);
        await carregarDados();
        mostrarCard('Sucesso', 'Registo apagado com sucesso.', 'sucesso');
      } catch (err: any) {
        mostrarCard('Erro', 'Não foi possível apagar o registo de produção.', 'erro');
      }
    }
  };

  return (
    <MainLayout pageTitle="⚙️ Registo de Produção">
      
      {error && <Alert variant="danger" className="shadow-sm border-0 mb-3" onClose={() => setError(null)} dismissible>{error}</Alert>}

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
            <ProducaoTable 
               historico={historico} 
               isGestor={isGestor} 
               onDelete={handleDeleteClick} 
            />
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

    </MainLayout>
  );
}

export default ProducaoServicosPage;