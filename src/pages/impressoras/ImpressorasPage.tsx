// src/pages/ImpressorasPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ModalForm from '../../components/ModalForm';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import * as impressoraService from '../../services/impressoraService';
import type { Impressora, ImpressoraCreateData, ImpressoraFiltros, ImpressoraUpdateData, Unidade } from '../../types';
import * as unidadeService from '../../services/unidadeService';
import { socket } from '../../services/socket';

// COMPONENTES EXTERNOS
import ImpressorasTable from '../../components/impressoras/ImpressorasTable';
import ImpressoraForm from '../../components/impressoras/ImpressoraForm';
import ImpressoraDetailsModal from '../../components/impressoras/ImpressoraDetailsModal';
import FiltrosImpressora from '../../components/impressoras/FiltrosImpressora'; // 🚀 Novo Componente!

function ImpressorasPage() {
  const { user } = useAuth();
  const { mostrarCard } = useToast();
  
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingImpressora, setEditingImpressora] = useState<Impressora | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingImpressora, setViewingImpressora] = useState<Impressora | null>(null);
  
  const [filtros, setFiltros] = useState<ImpressoraFiltros>({});

  const hasAccess = user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_impressora';
  const isAdmin = user?.role === 'admin';

  const fetchData = useCallback((currentFilters: ImpressoraFiltros = {}, isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    impressoraService.getFilteredImpressoras(currentFilters)
      .then(setImpressoras)
      .catch(() => {
        if (!isSilent) setError('Falha ao carregar a lista de impressoras.');
      })
      .finally(() => {
        if (!isSilent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user && hasAccess) {
      if (isAdmin) {
        unidadeService.getAllUnidades()
          .then(setUnidades)
          .catch(() => setError('Falha ao carregar a lista de unidades organizacionais.'));
      }
      
      fetchData(filtros, false);

      const lidarComAtualizacaoTempoReal = () => fetchData(filtros, true);
      socket.on('atualizar_impressoras', lidarComAtualizacaoTempoReal);

      return () => {
        socket.off('atualizar_impressoras', lidarComAtualizacaoTempoReal);
      };
    }
  }, [user, hasAccess, isAdmin, fetchData]); 

  // FUNÇÕES DE AÇÃO

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (data: ImpressoraCreateData | ImpressoraUpdateData) => {
    setIsSubmitting(true);
    try {
      if (editingImpressora) {
        await impressoraService.updateImpressora(editingImpressora.id, data as ImpressoraUpdateData);
        mostrarCard('Sucesso', 'Impressora atualizada com sucesso!', 'sucesso');
      } else {
        const createData = data as ImpressoraCreateData;
        let unidadeIdFinal = isAdmin ? Number(createData.unidade_id) : user?.unidade_id;
        
        if (!unidadeIdFinal) throw new Error("A unidade organizacional é obrigatória.");
        await impressoraService.createImpressora({ ...createData, unidade_id: unidadeIdFinal });
        mostrarCard('Sucesso', 'Nova impressora cadastrada com sucesso!', 'sucesso');
      }
      setShowFormModal(false);
      fetchData(filtros, true); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || '';
      if (err.response?.status === 400 || errorMsg.toLowerCase().includes('unique')) {
        mostrarCard('Erro de Duplicidade', 'Este Número de Série ou Endereço IP já se encontra registado noutra impressora.', 'erro');
      } else {
        mostrarCard('Erro', 'Ocorreu um problema ao salvar a impressora.', 'erro');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (impressora: Impressora) => {
    try {
      await impressoraService.deleteImpressora(impressora.id);
      mostrarCard('Sucesso', 'Impressora excluída permanentemente.', 'sucesso');
      fetchData(filtros, true);
    } catch (err) {
      mostrarCard('Aviso', 'Não foi possível excluir a impressora. Ela pode estar vinculada a históricos ou chamados.', 'alerta');
    }
  };

  if (!user || !hasAccess) return (<MainLayout pageTitle="🚫 Acesso Restrito"><Alert variant="danger">Acesso Negado</Alert></MainLayout>);

  return (
    <MainLayout pageTitle="🖨️ Gerenciar Impressoras">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      {/* 🚀 O FILTRO FOI COMPONENTIZADO! A PÁGINA FICOU LIMPA */}
      <FiltrosImpressora 
        filtros={filtros}
        unidades={unidades}
        isAdmin={isAdmin}
        onFiltroChange={handleFiltroChange}
        onFiltrar={() => fetchData(filtros, false)}
        onLimparFiltros={() => { setFiltros({}); fetchData({}, false); }}
        isLoading={loading}
      />
      
      <Card className="floating-card border-0 shadow-sm bg-white">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Impressoras Cadastradas</h5>
          <PrimaryButton onClick={() => { setEditingImpressora(null); setShowFormModal(true); }} className="fw-bold shadow-sm">
            + Nova Impressora
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
             <ImpressorasTable 
                impressoras={impressoras}
                onEdit={(imp) => { setEditingImpressora(imp); setShowFormModal(true); }}
                onDelete={handleConfirmDelete} // 🚀 Vai direto para a tabela!
                onDetails={(imp) => { setViewingImpressora(imp); setShowDetailsModal(true); }}
             />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)}
        title={editingImpressora ? '✏️ Editar Impressora' : '🖨️ Cadastrar Nova Impressora'}
      >
        <ImpressoraForm impressora={editingImpressora} unidades={unidades} onSubmit={handleFormSubmit} isLoading={isSubmitting} />
      </ModalForm>

      <ImpressoraDetailsModal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} impressora={viewingImpressora} />
    </MainLayout>
  );
}

export default ImpressorasPage;