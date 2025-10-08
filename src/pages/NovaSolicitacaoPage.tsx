// src/pages/NovaSolicitacaoPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Form } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import SolicitacaoInfoForm from '../components/solicitacoes/SolicitacaoInfoForm';
import ItemSelectionList from '../components/solicitacoes/ItemSelectionList';
import CartView from '../components/solicitacoes/CartView';
import SuccessModal from '../components/SuccessModal';
import { useAuth } from '../hooks/useAuth';

import * as itemService from '../services/itemService';
import * as usuarioService from '../services/usuarioService';
import * as solicitacaoService from '../services/solicitacaoService';
import type { Item, User, CartItem, SolicitacaoCreateData } from '../types';

function NovaSolicitacaoPage() {
  const { user } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm();

   useEffect(() => {
    if (user) { 
      if (user.role === 'admin' && !user.unidade_id) {
        setError("Administradores sem unidade associada não podem criar solicitações. Por favor, associe uma unidade ao seu perfil.");
        setLoading(false);
        return;
      }

      if (user.unidade_id) {
          setLoading(true);
          Promise.all([
            itemService.getAllItems(user.unidade_id),
            usuarioService.getTecnicosByUnidade(user.unidade_id), 
          ]).then(([itemsData, tecnicosData]) => {
            setItens(itemsData.filter(item => item.quantidade > 0));
            setTecnicos(tecnicosData);
          }).catch((err) => {
            setError(err.response?.data?.message || 'Falha ao carregar os dados da página.');
          }).finally(() => {
            setLoading(false);
          });
      }
    }
  }, [user]);

  const handleAddItem = (item: Item, quantidade: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantidade } : i);
      }
      return [...prevCart, { id: item.id, descricao: item.descricao, quantidade, quantidade_estoque: item.quantidade }];
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const onSubmit = async (data: any) => {
    if (cart.length === 0) {
      setError("O carrinho não pode estar vazio para finalizar a solicitação.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    const solicitacaoData: SolicitacaoCreateData = {
      ...data,
      responsavel_usuario_id: Number(data.responsavel_usuario_id),
      unidade_id: user!.unidade_id!,
      itens: cart.map(item => ({ id: item.id, quantidade: item.quantidade })),
    };

    try {
      const novaSolicitacao = await solicitacaoService.createSolicitacao(solicitacaoData);
      setSuccessMessage(`Solicitação Nº ${novaSolicitacao.id} registrada com sucesso!`);
      setShowSuccessModal(true);
      setCart([]);
      methods.reset();
    } catch (err) {
      setError("Ocorreu um erro ao registrar a solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout pageTitle="📝 Nova Solicitação de Material">
      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {!loading && !error && (
        <FormProvider {...methods}>
          <Form onSubmit={methods.handleSubmit(onSubmit)}>
            <Card className="floating-card mb-4">
              <Card.Header as="h5">1. Dados da Solicitação</Card.Header>
              <Card.Body><SolicitacaoInfoForm tecnicos={tecnicos} /></Card.Body>
            </Card>

            <Card className="floating-card mb-4">
              <Card.Header as="h5">2. Adicionar Itens</Card.Header>
              <Card.Body><ItemSelectionList itens={itens} cart={cart} onAddItem={handleAddItem} /></Card.Body>
            </Card>

            <Card className="floating-card mb-4">
              <Card.Header as="h5">3. Itens no Carrinho</Card.Header>
              <Card.Body><CartView cart={cart} onRemoveItem={handleRemoveItem} /></Card.Body>
            </Card>

            <Card className="floating-card text-center">
                <Card.Body>
                    <Card.Title>4. Finalizar Solicitação</Card.Title>
                    <Card.Text className="text-muted">
                        Ao clicar no botão abaixo, a solicitação será registrada e o estoque será atualizado.
                    </Card.Text>
                    <PrimaryButton type="submit" size="lg" isLoading={isSubmitting}>
                        ✅ Registrar Solicitação
                    </PrimaryButton>
                </Card.Body>
            </Card>
          </Form>
        </FormProvider>
      )}

      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title="Sucesso!"
        body={successMessage}
      />
    </MainLayout>
  );
}

export default NovaSolicitacaoPage;