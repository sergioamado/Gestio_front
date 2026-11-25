// src/pages/ControleSuprimentosPage.tsx
import { useToast } from '../../contexts/ToastContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ModalForm from '../../components/ModalForm';
import { useAuth } from '../../hooks/useAuth';
import * as suprimentosService from '../../services/suprimentosService';
import * as impressoraService from '../../services/impressoraService';
import type { Impressora, ControleSuprimentos, ControleSuprimentosCreateData } from '../../types';
import SuprimentosTable from '../../components/suprimentos/SuprimentosTable';
import SuprimentoForm from '../../components/suprimentos/SuprimentoForm';
import { useTempoReal } from '../../hooks/useTempoReal';

//  IMPORTAÇÃO DOS NOVOS COMPONENTES
import CorrecaoEstoqueModal from '../../components/suprimentos/CorrecaoEstoqueModal';
import ReportarErroModal from '../../components/suprimentos/ReportarErroModal';
import HistoricoSuprimentosModal from '../../components/suprimentos/HistoricoSuprimentosModal';

function ControleSuprimentosPage() {
  const { mostrarCard } = useToast();
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
    }
  }, [user, hasAccess, fetchData]);

  useTempoReal(['suprimentos', 'impressoras'], () => fetchData(true), !!user && hasAccess);

  const handleFormSubmit = async (data: ControleSuprimentosCreateData) => {
    setIsSubmitting(true);
    try {
      await suprimentosService.createControleSuprimentos(data);
      setShowFormModal(false);
      fetchData(true); 
    } catch (err: any) {
      mostrarCard('Erro', err.response?.data?.message || 'Erro ao registrar a requisição.', 'erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportarErro = async (mensagemCompleta: string) => {
    setIsSubmitting(true);
    try {
      await suprimentosService.reportarErroEstoque({ mensagem: mensagemCompleta });
      setShowModalReporte(false);
      mostrarCard('Reporte Enviado', 'Inconsistência reportada à gerência.', 'sucesso');
    } catch (err: any) {
      mostrarCard('Erro no Envio', err.response?.data?.message || 'Erro ao reportar.', 'erro');
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
      mostrarCard('Estoque Atualizado', 'Ajuste de estoque registrado com sucesso.', 'sucesso');
    } catch (err: any) {
      mostrarCard('Erro na Correção', err.response?.data?.message || 'Erro ao corrigir estoque.', 'erro');
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
      mostrarCard('Erro ao Carregar', 'Falha ao buscar o histórico.', 'erro');
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

    </MainLayout>
  );
}

export default ControleSuprimentosPage;