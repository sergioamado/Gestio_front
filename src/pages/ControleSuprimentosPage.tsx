// src/pages/ControleSuprimentosPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import ModalForm from '../components/ModalForm';
import { useAuth } from '../hooks/useAuth';
import * as suprimentosService from '../services/suprimentosService'; // <<< CORREÇÃO: Importar o novo serviço
import * as impressoraService from '../services/impressoraService';
import type { Impressora, ControleSuprimentos, ControleSuprimentosCreateData } from '../types';
import SuprimentosTable from '../components/suprimentos/SuprimentosTable';
import SuprimentoForm from '../components/suprimentos/SuprimentoForm';

function ControleSuprimentosPage() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<ControleSuprimentos[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      // CORREÇÃO: Chamar a função do serviço correto
      suprimentosService.getControleSuprimentos(),
      impressoraService.getAllImpressoras()
    ]).then(([registrosData, impressorasData]) => {
      setRegistros(registrosData);
      setImpressoras(impressorasData);
    }).catch(() => setError('Falha ao carregar dados.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);
  
  const handleFormSubmit = async (data: ControleSuprimentosCreateData) => {
    setIsSubmitting(true);
    setError(null);
    try {
        // CORREÇÃO: Chamar a função do serviço correto
        await suprimentosService.createControleSuprimentos(data);
        setShowFormModal(false);
        fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registar a requisição de suprimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout pageTitle="🖨️ Requisição de Suprimentos">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card className="floating-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Histórico de Requisições</h5>
          <PrimaryButton onClick={() => setShowFormModal(true)}>
            + Nova Requisição
          </PrimaryButton>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
             <SuprimentosTable registros={registros} />
          )}
        </Card.Body>
      </Card>

      <ModalForm 
        show={showFormModal} 
        onHide={() => setShowFormModal(false)}
        title="Registar Nova Requisição de Suprimento"
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