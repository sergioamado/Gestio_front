// src/pages/EstoqueSuprimentosPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import * as suprimentosService from '../services/suprimentosService';
import type { EstoqueSuprimentos } from '../types';
import EstoqueAtualCard from '../components/estoque/EstoqueAtualCard';
import AdicionarEstoqueForm from '../components/estoque/AdicionarEstoqueForm';

function EstoqueSuprimentosPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [estoque, setEstoque] = useState<EstoqueSuprimentos | null>(null);
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageImpressoras = user?.role === 'admin' || user?.role === 'tecnico_impressora';

  const fetchData = useCallback(() => {
    setLoading(true);
    suprimentosService.getEstoqueSuprimentos()
      .then(setEstoque)
      .catch(() => setError('Falha ao carregar o estoque.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthLoading && canManageImpressoras) {
      fetchData();
    }
    if (!isAuthLoading && !canManageImpressoras) {
      setLoading(false);
    }
  }, [canManageImpressoras, fetchData, isAuthLoading]);

  const handleAddEstoque = async (data: Partial<EstoqueSuprimentos>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await suprimentosService.addEstoqueSuprimentos(data);
      fetchData();
    } catch (err) {
      setError('Erro ao adicionar estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <MainLayout pageTitle="📦 Gerir estoque de Suprimentos">
        <div className="text-center"><Spinner animation="border" /></div>
      </MainLayout>
    );
  }

  if (!canManageImpressoras) {
    return (
      <MainLayout pageTitle="Acesso Negado">
        <Alert variant="danger">Apenas administradores e técnicos de impressora podem aceder a esta página.</Alert>
      </MainLayout>
    );
  }

  if (loading) {
      return (
          <MainLayout pageTitle="📦 Gerir estoque de Suprimentos">
              <div className="text-center"><Spinner animation="border" /></div>
          </MainLayout>
      );
  }

  return (
    <MainLayout pageTitle="📦 Gerir estoque de Suprimentos">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <EstoqueAtualCard estoque={estoque} loading={loading} />

      <AdicionarEstoqueForm onSubmit={handleAddEstoque} isLoading={isSubmitting} />

    </MainLayout>
  );
}

export default EstoqueSuprimentosPage;