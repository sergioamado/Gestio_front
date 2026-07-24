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
    setError(null);
    suprimentosService.getEstoqueSuprimentos()
      .then(setEstoque)
      .catch((err: any) => {
        const errorMessage = err.response?.data?.message || 'Falha ao carregar o estoque de suprimentos.';
        setError(errorMessage);
      })
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
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar nova entrada no estoque.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading inicial de Autenticação
  if (isAuthLoading) {
    return (
      <MainLayout pageTitle="📦 Gerenciar Estoque de Suprimentos">
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2 text-muted fw-medium">Verificando permissões de acesso...</div>
        </div>
      </MainLayout>
    );
  }

  // 2. Trava de Segurança visualmente amigável
  if (!canManageImpressoras) {
    return (
      <MainLayout pageTitle="🚫 Acesso Negado">
        <Alert variant="danger" className="shadow-sm border-0 mt-3 p-4">
          <h5 className="fw-bold mb-2">Acesso Restrito</h5>
          Apenas administradores e técnicos do setor de impressão podem acessar esta página para gerenciamento de estoque.
        </Alert>
      </MainLayout>
    );
  }

  // 3. Loading dos dados da API
  if (loading) {
      return (
          <MainLayout pageTitle="📦 Gerenciar Estoque de Suprimentos">
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted fw-medium">Carregando dados do estoque...</div>
            </div>
          </MainLayout>
      );
  }

  // 4. Renderização Principal
  return (
    <MainLayout pageTitle="📦 Gerenciar Estoque de Suprimentos">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <EstoqueAtualCard estoque={estoque} loading={loading} />

      <div className="mt-4">
        <AdicionarEstoqueForm onSubmit={handleAddEstoque} isLoading={isSubmitting} />
      </div>
    </MainLayout>
  );
}

export default EstoqueSuprimentosPage;