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
    Promise.all([
      atendimentoService.getAllAtendimentos(),
      impressoraService.getAllImpressoras(),
    ]).then(([atendimentosData, impressorasData]) => {
      setAtendimentos(atendimentosData);
      setImpressoras(impressorasData);
    }).catch(() => setError('Falha ao carregar dados.'))
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
        if (!user) throw new Error("Utilizador não autenticado.");

        const finalData = { ...createData, unidade_id: impressora.unidade_id, tecnico_id: user.id };
        await atendimentoService.createAtendimento(finalData);
      }
      setShowFormModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar atendimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout pageTitle="🔧 Atendimentos Técnicos de Impressoras">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Histórico de Atendimentos</h5>
          <PrimaryButton onClick={handleShowCreateModal}>+ Novo Atendimento</PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
             <AtendimentosTable 
                atendimentos={atendimentos} 
                onDetails={handleShowDetailsModal} // <<< CORREÇÃO: Passar a função para a prop
                onEdit={handleShowEditModal}       // <<< CORREÇÃO: Passar a função para a prop
             />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)}
        title={editingAtendimento ? `Evoluir Atendimento #${editingAtendimento.id}` : 'Abrir Novo Atendimento'}
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