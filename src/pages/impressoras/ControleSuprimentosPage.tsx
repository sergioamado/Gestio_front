// src/pages/ControleSuprimentosPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ModalForm from '../../components/ModalForm';
import { useAuth } from '../../hooks/useAuth';
import * as suprimentosService from '../../services/suprimentosService';
import * as impressoraService from '../../services/impressoraService';
import type { Impressora, ControleSuprimentos, ControleSuprimentosCreateData } from '../../types';
import SuprimentosTable from '../../components/suprimentos/SuprimentosTable';
import SuprimentoForm from '../../components/suprimentos/SuprimentoForm';
import { socket } from '../../services/socket'; 

//  IMPORTAÇÃO DOS NOVOS COMPONENTES
import CorrecaoEstoqueModal from '../../components/suprimentos/CorrecaoEstoqueModal';
import ReportarErroModal from '../../components/suprimentos/ReportarErroModal';
import HistoricoSuprimentosModal from '../../components/suprimentos/HistoricoSuprimentosModal';

function ControleSuprimentosPage() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<ControleSuprimentos[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGestor = user?.role === 'admin' || user?.role === 'gerente';
  const isTecnicoImpressora = user?.role === 'tecnico_impressora';
  const hasAccess = isGestor || isTecnicoImpressora;

  // Estados dos Modais
  const [showModalReporte, setShowModalReporte] = useState(false);
  const [showModalCorrecao, setShowModalCorrecao] = useState(false);
  const [showModalHistorico, setShowModalHistorico] = useState(false);

  const [historicoEntradas, setHistoricoEntradas] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [feedback, setFeedback] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'danger' }>({
    show: false, title: '', message: '', variant: 'success'
  });

  const fetchData = useCallback((isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    Promise.all([
      suprimentosService.getControleSuprimentos(),
      impressoraService.getAllImpressoras()
    ]).then(([registrosData, impressorasData]) => {
      setRegistros(registrosData);
      setImpressoras(impressorasData);
    }).catch(() => {
      if (!isSilent) setError('Falha ao carregar o histórico de suprimentos.');
    }).finally(() => {
      if (!isSilent) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user && hasAccess) {
      fetchData(false);

      const lidarComAtualizacaoTempoReal = () => fetchData(true);
      socket.on('atualizar_suprimentos', lidarComAtualizacaoTempoReal);
      return () => { socket.off('atualizar_suprimentos', lidarComAtualizacaoTempoReal); };
    }
  }, [user, hasAccess, fetchData]);

  const handleFormSubmit = async (data: ControleSuprimentosCreateData) => {
    setIsSubmitting(true);
    try {
      await suprimentosService.createControleSuprimentos(data);
      setShowFormModal(false);
      fetchData(true); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar a requisição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportarErro = async (mensagemCompleta: string) => {
    setIsSubmitting(true);
    try {
      await suprimentosService.reportarErroEstoque({ mensagem: mensagemCompleta });
      setShowModalReporte(false);
      setFeedback({ show: true, title: 'Reporte Enviado', message: 'Inconsistência reportada à gerência.', variant: 'success' });
    } catch (err: any) {
      setFeedback({ show: true, title: 'Erro no Envio', message: err.response?.data?.message || 'Erro ao reportar.', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrigirEstoque = async (data: { cor: string; novaQuantidade: number; justificativa: string }) => {
    setIsSubmitting(true);
    try {
      await suprimentosService.corrigirEstoque(data);
      setShowModalCorrecao(false);
      fetchData(true);
      setFeedback({ show: true, title: 'Estoque Atualizado', message: 'Ajuste de estoque registrado com sucesso.', variant: 'success' });
    } catch (err: any) {
      setFeedback({ show: true, title: 'Erro na Correção', message: err.response?.data?.message || 'Erro ao corrigir estoque.', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbrirHistorico = async () => {
    setShowModalHistorico(true);
    setLoadingHistorico(true);
    try {
      const data = await suprimentosService.getHistoricoEntradas();
      setHistoricoEntradas(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setFeedback({ show: true, title: 'Erro ao Carregar', message: 'Falha ao buscar o histórico.', variant: 'danger' });
    } finally {
      setLoadingHistorico(false);
    }
  };

  if (!user || !hasAccess) return (<MainLayout pageTitle="🚫 Acesso Restrito"><Alert variant="danger">Acesso Negado</Alert></MainLayout>);

  return (
    <MainLayout pageTitle="🖨️ Requisição e Controle de Suprimentos">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div className="d-flex flex-wrap gap-2">
          {isTecnicoImpressora && (
            <Button variant="outline-danger" className="fw-medium shadow-sm" onClick={() => setShowModalReporte(true)}>
              ⚠️ Reportar Erro no Estoque
            </Button>
          )}

          {isGestor && (
            <>
              <Button variant="outline-warning" className="fw-medium shadow-sm text-dark" onClick={() => setShowModalCorrecao(true)}>
                ✏️ Corrigir Quantidade de Suprimentos
              </Button>
              <Button variant="outline-info" className="fw-medium shadow-sm" onClick={handleAbrirHistorico}>
                🕒 Histórico de Entradas / Ajustes
              </Button>
            </>
          )}
        </div>

        <PrimaryButton onClick={() => setShowFormModal(true)}>
          + Nova Requisição
        </PrimaryButton>
      </div>

      <Card className="floating-card border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5"><Spinner animation="border" variant="primary" /></div>
          ) : registros.length > 0 ? (
             <SuprimentosTable registros={registros} />
          ) : (
            <div className="text-center text-muted p-5">Nenhuma requisição registrada.</div>
          )}
        </Card.Body>
      </Card>

      <ModalForm show={showFormModal} onHide={() => setShowFormModal(false)} title="📦 Registrar Requisição">
        <SuprimentoForm impressoras={impressoras} onSubmit={handleFormSubmit} isLoading={isSubmitting} />
      </ModalForm>

      {/* 🚀 COMPONENTES EXTRAÍDOS RENDERIZADOS AQUI */}
      <ReportarErroModal show={showModalReporte} onHide={() => setShowModalReporte(false)} onSubmit={handleReportarErro} isSubmitting={isSubmitting} />
      
      <CorrecaoEstoqueModal show={showModalCorrecao} onHide={() => setShowModalCorrecao(false)} onSubmit={handleCorrigirEstoque} isSubmitting={isSubmitting} />
      
      <HistoricoSuprimentosModal show={showModalHistorico} onHide={() => setShowModalHistorico(false)} historicoEntradas={historicoEntradas} loadingHistorico={loadingHistorico} />

      <Modal show={feedback.show} onHide={() => setFeedback(prev => ({ ...prev, show: false }))} centered>
        <Modal.Header closeButton className={`bg-${feedback.variant} text-white`}>
          <Modal.Title className="fs-6 fw-bold">{feedback.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-dark">{feedback.message}</Modal.Body>
      </Modal>
    </MainLayout>
  );
}

export default ControleSuprimentosPage;