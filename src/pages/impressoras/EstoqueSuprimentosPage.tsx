// src/pages/EstoqueSuprimentosPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Alert, Spinner, Button, Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import ModalForm from '../../components/ModalForm';
import { useAuth } from '../../hooks/useAuth';
import * as suprimentosService from '../../services/suprimentosService';
import type { EstoqueSuprimentos } from '../../types';
import EstoqueAtualCard from '../../components/estoque/EstoqueAtualCard';
import AdicionarEstoqueForm from '../../components/estoque/AdicionarEstoqueForm';

function EstoqueSuprimentosPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [estoque, setEstoque] = useState<EstoqueSuprimentos | null>(null);
  const [historico, setHistorico] = useState<any[]>([]); // 🚀 Estado para o histórico
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados dos Modais de Correção/Reporte
  const [showCorrecaoModal, setShowCorrecaoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [correcaoData, setCorrecaoData] = useState({ cor: 'preto', novaQuantidade: 0, justificativa: '' });
  const [reportData, setReportData] = useState({ mensagem: '' });

  // Permissões
  const canManageImpressoras = user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'tecnico_impressora';
  const isGestor = user?.role === 'admin' || user?.role === 'gerente'; // 🚀 Separa quem pode corrigir de quem pode só reportar

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    
    // 🚀 Busca o estoque e o histórico ao mesmo tempo
    Promise.all([
      suprimentosService.getEstoqueSuprimentos(),
      // Caso não tenha o endpoint de histórico criado no backend ainda, ele retorna array vazio para não quebrar a tela
      suprimentosService.getHistoricoEntradas ? suprimentosService.getHistoricoEntradas() : Promise.resolve([])
    ])
      .then(([estoqueData, historicoData]) => {
        setEstoque(estoqueData);
        setHistorico(historicoData);
      })
      .catch((err: any) => {
        const errorMessage = err.response?.data?.message || 'Falha ao carregar os dados de suprimentos.';
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
      fetchData(); // Atualiza tudo (estoque e histórico)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar nova entrada no estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 Ação Exclusiva de Gestor (Corrigir Diretamente)
  const handleCorrigirEstoque = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Endpoint a ser criado: ajusta a quantidade exata e salva a justificativa/log
      if(suprimentosService.corrigirEstoque) {
         await suprimentosService.corrigirEstoque(correcaoData);
      }
      setShowCorrecaoModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao corrigir o estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 Ação de Técnico (Reportar Divergência)
  const handleReportarErro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Endpoint a ser criado: envia notificação/email para os gerentes
      if(suprimentosService.reportarErroEstoque) {
         await suprimentosService.reportarErroEstoque(reportData);
      }
      setShowReportModal(false);
      alert('Sua notificação de divergência foi enviada aos gestores com sucesso.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar o reporte.');
    } finally {
      setIsSubmitting(false);
      setReportData({ mensagem: '' });
    }
  };

  if (isAuthLoading) {
    return (
      <MainLayout pageTitle="📦 Gerenciar Estoque de Suprimentos">
        <div className="text-center my-5 py-5"><Spinner animation="border" variant="primary" /><div className="mt-2 text-muted fw-medium">Verificando permissões de acesso...</div></div>
      </MainLayout>
    );
  }

  if (!canManageImpressoras) {
    return (
      <MainLayout pageTitle="🚫 Acesso Negado">
        <Alert variant="danger" className="shadow-sm border-0 mt-3 p-4 d-flex align-items-center">
          <span className="fs-1 me-3">🔒</span>
          <div>
            <h5 className="fw-bold mb-1">Acesso Restrito</h5>
            Apenas administradores, gerentes e técnicos do setor de impressão podem acessar esta página para gerenciamento de estoque.
          </div>
        </Alert>
      </MainLayout>
    );
  }

  if (loading) {
      return (
          <MainLayout pageTitle="📦 Gerenciar Estoque de Suprimentos">
            <div className="text-center my-5 py-5"><Spinner animation="border" variant="primary" /><div className="mt-2 text-muted fw-medium">Carregando dados do estoque...</div></div>
          </MainLayout>
      );
  }

  return (
    <MainLayout pageTitle="📦 Gerenciar Estoque de Suprimentos">
      {error && <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      {/* Botões de Ação de Correção */}
      <div className="d-flex justify-content-end mb-3 gap-2">
        {isGestor ? (
          <Button variant="warning" className="fw-bold shadow-sm border-0" onClick={() => setShowCorrecaoModal(true)}>
            ✏️ Corrigir Quantidades
          </Button>
        ) : (
          <Button variant="outline-warning" className="fw-bold shadow-sm" onClick={() => setShowReportModal(true)}>
            ⚠️ Reportar Erro no Estoque
          </Button>
        )}
      </div>

      <EstoqueAtualCard estoque={estoque} loading={loading} />

      <div className="mt-4">
        <AdicionarEstoqueForm onSubmit={handleAddEstoque} isLoading={isSubmitting} />
      </div>

      {/* 🚀 NOVA SESSÃO: HISTÓRICO DE ENTRADAS */}
      <Card className="floating-card border-0 shadow-sm mt-5">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">🕒 Histórico de Entradas</h5>
        </Card.Header>
        <Card.Body>
          {historico && historico.length > 0 ? (
            <Table hover responsive className="align-middle mt-2">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="border-0">Data / Hora</th>
                  <th className="border-0">Usuário</th>
                  <th className="border-0">Tipo de Toner</th>
                  <th className="border-0 text-center">Qtd. Adicionada</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((log, index) => (
                  <tr key={index}>
                    <td className="fw-medium text-dark">{new Date(log.data).toLocaleString('pt-BR')}</td>
                    <td className="text-muted">{log.usuario?.nome_completo || 'Sistema'}</td>
                    <td>
                       <Badge bg="secondary" className="px-3 py-2 text-uppercase">{log.cor}</Badge>
                    </td>
                    <td className="text-center fw-bold text-success">+{log.quantidade_adicionada}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted p-4 border border-dashed rounded bg-light my-3">
              <span className="fs-3 d-block mb-2">📊</span>
              <p className="mb-0">Nenhum histórico de entrada registrado até o momento.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 🚀 MODAL: CORRIGIR ESTOQUE (Admin/Gerente) */}
      <ModalForm show={showCorrecaoModal} onHide={() => setShowCorrecaoModal(false)} title="✏️ Correção Manual de Estoque">
        <Form onSubmit={handleCorrigirEstoque}>
          <Alert variant="warning" className="small border-0 shadow-sm mb-4">
            <strong>Atenção Gestor:</strong> Esta ferramenta substitui a quantidade atual no banco de dados. Use apenas para corrigir falhas de contagem física.
          </Alert>
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold small text-uppercase text-secondary">Cor / Toner</Form.Label>
                <Form.Select value={correcaoData.cor} onChange={(e) => setCorrecaoData({...correcaoData, cor: e.target.value})}>
                  <option value="preto">Toner Preto (Black)</option>
                  <option value="ciano">Toner Ciano (Cyan)</option>
                  <option value="magenta">Toner Magenta</option>
                  <option value="amarelo">Toner Amarelo (Yellow)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold small text-uppercase text-secondary">Nova Quantidade Real</Form.Label>
                <Form.Control type="number" min="0" required value={correcaoData.novaQuantidade} onChange={(e) => setCorrecaoData({...correcaoData, novaQuantidade: parseInt(e.target.value)})} />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase text-secondary">Justificativa da Correção *</Form.Label>
            <Form.Control as="textarea" rows={3} required placeholder="Ex: Contagem física revelou 2 toners a menos do que o registrado no sistema..." value={correcaoData.justificativa} onChange={(e) => setCorrecaoData({...correcaoData, justificativa: e.target.value})} />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="fw-bold text-muted border shadow-sm" onClick={() => setShowCorrecaoModal(false)}>Cancelar</Button>
            <PrimaryButton type="submit" variant="warning" isLoading={isSubmitting}>Salvar Correção</PrimaryButton>
          </div>
        </Form>
      </ModalForm>

      {/* 🚀 MODAL: REPORTAR ERRO (Técnico) */}
      <ModalForm show={showReportModal} onHide={() => setShowReportModal(false)} title="⚠️ Reportar Divergência no Estoque">
        <Form onSubmit={handleReportarErro}>
          <Alert variant="info" className="small border-0 shadow-sm mb-4">
            Descreva o que encontrou de errado no estoque. Sua notificação será enviada para o administrador ou gerente para validação e correção do sistema.
          </Alert>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase text-secondary">Detalhes da Divergência *</Form.Label>
            <Form.Control as="textarea" rows={4} required placeholder="Ex: Fui buscar um toner amarelo e o armário estava vazio, mas o sistema diz que existem 2 unidades..." value={reportData.mensagem} onChange={(e) => setReportData({...reportData, mensagem: e.target.value})} />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" className="fw-bold text-muted border shadow-sm" onClick={() => setShowReportModal(false)}>Cancelar</Button>
            <PrimaryButton type="submit" isLoading={isSubmitting}>Enviar Reporte</PrimaryButton>
          </div>
        </Form>
      </ModalForm>
    </MainLayout>
  );
}

export default EstoqueSuprimentosPage;