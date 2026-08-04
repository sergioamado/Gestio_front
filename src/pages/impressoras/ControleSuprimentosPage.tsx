// src/pages/ControleSuprimentosPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ModalForm from '../../components/ModalForm';
import { useAuth } from '../../hooks/useAuth';
import * as suprimentosService from '../../services/suprimentosService';
import * as impressoraService from '../../services/impressoraService';
import type { Impressora, ControleSuprimentos, ControleSuprimentosCreateData } from '../../types';
import SuprimentosTable from '../../components/suprimentos/SuprimentosTable';
import SuprimentoForm from '../../components/suprimentos/SuprimentoForm';

function ControleSuprimentosPage() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<ControleSuprimentos[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CONTROLO DE ACESSO: Apenas Admin, Gerente e Técnico de Impressoras
  const hasAccess = user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_impressora';

  const fetchData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      suprimentosService.getControleSuprimentos(),
      impressoraService.getAllImpressoras()
    ]).then(([registrosData, impressorasData]) => {
      setRegistros(registrosData);
      setImpressoras(impressorasData);
    }).catch(() => setError('Falha ao carregar o histórico de suprimentos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Só tenta buscar os dados no backend se tiver permissão visual
    if (user && hasAccess) {
      fetchData();
    }
  }, [user, hasAccess]);
  
  const handleFormSubmit = async (data: ControleSuprimentosCreateData) => {
    setIsSubmitting(true);
    setError(null);
    try {
        await suprimentosService.createControleSuprimentos(data);
        setShowFormModal(false);
        fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar a requisição de suprimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TELA DE BLOQUEIO: Se não for um dos perfis autorizados, exibe o alerta e barra a tela
  if (!user || !hasAccess) {
    return (
      <MainLayout pageTitle="🚫 Acesso Restrito">
        <Alert variant="danger" className="shadow-sm border-0 mt-4 d-flex align-items-center p-4">
          <span className="fs-1 me-3">🔒</span>
          <div>
            <h5 className="fw-bold mb-1">Acesso Negado</h5>
            Apenas administradores, gerentes e técnicos do setor de impressão podem acessar o controle de requisições de suprimentos.
          </div>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="🖨️ Requisição de Suprimentos">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">Histórico de Requisições</h5>
          <PrimaryButton onClick={() => setShowFormModal(true)}>
            + Nova Requisição
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted fw-medium">Carregando histórico...</div>
            </div>
          ) : registros.length > 0 ? (
             <SuprimentosTable registros={registros} />
          ) : (
            <div className="text-center text-muted p-5 bg-white rounded shadow-sm border mt-3">
              <span className="fs-1 d-block mb-3">📭</span>
              <h5 className="fw-bold text-dark">Nenhuma requisição registrada.</h5>
              <p className="mb-0">Clique em "Nova Requisição" para registrar a primeira saída de suprimentos.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)}
        title="📦 Registrar Requisição de Suprimento"
      >
        <SuprimentoForm
            impressoras={impressoras}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
        />
      </ModalForm>
    </MainLayout>
  );
}

export default ControleSuprimentosPage;