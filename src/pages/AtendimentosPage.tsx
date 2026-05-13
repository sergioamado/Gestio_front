// src/pages/AtendimentosPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import ModalForm from '../components/ModalForm';
import { useAuth } from '../hooks/useAuth';
import * as atendimentoService from '../services/atendimentoService';
import * as impressoraService from '../services/impressoraService';
import type { AtendimentoImpressora, AtendimentoCreateData, AtendimentoUpdateData, Impressora } from '../types';
import AtendimentosTable from '../components/atendimentos/AtendimentosTable';
import AtendimentoForm from '../components/atendimentos/AtendimentoForm';
import AtendimentoDetailsModal from '../components/atendimentos/AtendimentoDetailsModal';

function AtendimentosPage() {
  const { user } = useAuth();
  const [atendimentos, setAtendimentos] = useState<AtendimentoImpressora[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<AtendimentoImpressora | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingAtendimento, setViewingAtendimento] = useState<AtendimentoImpressora | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      atendimentoService.getAllAtendimentos(),
      impressoraService.getAllImpressoras(),
    ]).then(([atendimentosData, impressorasData]) => {
      setAtendimentos(atendimentosData);
      setImpressoras(impressorasData);
    }).catch(() => setError('Falha ao carregar os dados de atendimentos e impressoras.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleShowCreateModal = () => {
    setEditingAtendimento(null);
    setShowFormModal(true);
  };

  const handleShowEditModal = (atendimento: AtendimentoImpressora) => {
    setEditingAtendimento(atendimento);
    setShowFormModal(true);
  };

  const handleShowDetailsModal = (atendimento: AtendimentoImpressora) => {
    setViewingAtendimento(atendimento);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (data: AtendimentoCreateData | AtendimentoUpdateData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingAtendimento) {
        await atendimentoService.updateAtendimento(editingAtendimento.id, data as AtendimentoUpdateData);
      } else {
        const createData = data as AtendimentoCreateData;
        const impressora = impressoras.find(p => p.id === createData.impressora_id);
        if (!impressora) throw new Error("A impressora selecionada não é válida.");
        if (!user) throw new Error("Usuário não autenticado.");

        const finalData = { ...createData, unidade_id: impressora.unidade_id, tecnico_id: user.id };
        await atendimentoService.createAtendimento(finalData);
      }
      setShowFormModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar os dados do atendimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout pageTitle="🔧 Atendimentos Técnicos de Impressoras">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Histórico de Atendimentos</h5>
          <PrimaryButton onClick={handleShowCreateModal}>+ Novo Atendimento</PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted fw-medium">Carregando histórico de atendimentos...</div>
            </div>
          ) : atendimentos.length > 0 ? (
             <AtendimentosTable 
                atendimentos={atendimentos} 
                onDetails={handleShowDetailsModal}
                onEdit={handleShowEditModal}
             />
          ) : (
            <div className="text-center text-muted p-5 bg-white rounded shadow-sm border mt-3">
              <span className="fs-1 d-block mb-3">📭</span>
              <h5 className="fw-bold text-dark">Nenhum atendimento registrado.</h5>
              <p className="mb-0">Clique em "Novo Atendimento" para registrar a primeira visita técnica.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)}
        title={editingAtendimento ? `✏️ Evoluir Atendimento #${editingAtendimento.id}` : '🔧 Abrir Novo Atendimento'}
      >
        <AtendimentoForm
            atendimento={editingAtendimento}
            impressoras={impressoras}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
        />
      </ModalForm>

      <AtendimentoDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        atendimento={viewingAtendimento}
      />
    </MainLayout>
  );
}

export default AtendimentosPage;