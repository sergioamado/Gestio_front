// src/pages/Patrimonio/LevantamentoPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Badge, ProgressBar, Table, Alert, Spinner, InputGroup } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import * as patrimonioService from '../../services/patrimonioService';
import type { BemPatrimonial } from '../../types';

function LevantamentoPage() {
  const { user } = useAuth();
  
  const [levantamentoAberto, setLevantamentoAberto] = useState(false);
  const [resumo, setResumo] = useState({ total: 0, conferidos_qtd: 0, pendentes_qtd: 0 });
  const [pendentes, setPendentes] = useState<BemPatrimonial[]>([]);
  const [conferidos, setConferidos] = useState<BemPatrimonial[]>([]);
  
  const [tombamentoBip, setTombamentoBip] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: string, texto: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // 🚀 CONTROLO DE ACESSO: Apenas Admin e Gerente
  const hasAccess = user?.role === 'admin' || user?.role === 'gerente';

  // Forçamos a buscar o Levantamento usando o ID da Unidade do usuário atual (ou 1 se for Admin sem unidade)
  const unidadeId = user?.unidade_id || 1;

  const carregarLevantamento = async () => {
    setLoading(true);
    setMensagem(null);
    try {
      const data = await patrimonioService.getLevantamentoAtual(unidadeId);
      if (data && data.levantamento) {
        setLevantamentoAberto(true);
        setResumo(data.resumo);
        setPendentes(data.pendentes);
        setConferidos(data.conferidos);
        
        // Foca automaticamente no campo de bipe após carregar
        setTimeout(() => inputRef.current?.focus(), 300);
      } else {
        setLevantamentoAberto(false);
      }
    } catch (error) {
      console.error("Erro ao carregar levantamento:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🚀 Só tenta buscar os dados se o utilizador tiver permissão
    if (user && hasAccess) {
      carregarLevantamento();
    } else if (user && !hasAccess) {
      setLoading(false); // Remove o loading infinito para quem não tem acesso
    }
  }, [unidadeId, user, hasAccess]);

  const handleIniciar = async () => {
    setLoadingAcao(true);
    try {
      await patrimonioService.iniciarLevantamento();
      await carregarLevantamento();
      setMensagem({ tipo: 'success', texto: 'Auditoria Anual Iniciada! Comece a bipar os equipamentos.' });
    } catch (err: any) {
      setMensagem({ tipo: 'danger', texto: err.response?.data?.message || 'Erro ao iniciar.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleFinalizar = async () => {
    if (resumo.pendentes_qtd > 0) {
      const confirmar = window.confirm(`Atenção! Faltam ${resumo.pendentes_qtd} itens para conferir. Deseja fechar o levantamento mesmo assim e considerá-los como "Não Localizados"?`);
      if (!confirmar) return;
    }
    
    setLoadingAcao(true);
    try {
      await patrimonioService.finalizarLevantamento();
      setLevantamentoAberto(false);
      setMensagem({ tipo: 'success', texto: 'Relatório de Levantamento encerrado e guardado com sucesso!' });
    } catch (err: any) {
      setMensagem({ tipo: 'danger', texto: err.response?.data?.message || 'Erro ao finalizar.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleBipar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tombamentoBip.trim()) return;

    setLoadingAcao(true);
    try {
      await patrimonioService.biparItemLevantamento({
        tombamento: tombamentoBip.trim(),
        unidade_id: unidadeId
      });
      setTombamentoBip(''); // Limpa o input rápido para o próximo bipe
      setMensagem({ tipo: 'success', texto: `✅ Item ${tombamentoBip} conferido com sucesso!` });
      await carregarLevantamento(); // Atualiza as listas e a barra de progresso
    } catch (err: any) {
      setMensagem({ tipo: 'danger', texto: err.response?.data?.message || 'Erro ao bipar item.' });
      setTombamentoBip('');
      // Foca de volta no input mesmo se der erro
      inputRef.current?.focus();
    } finally {
      setLoadingAcao(false);
    }
  };

  const calcularProgresso = () => {
    if (resumo.total === 0) return 0;
    return Math.round((resumo.conferidos_qtd / resumo.total) * 100);
  };

  // 🚀 TELA DE BLOQUEIO: Exibida se o utilizador não for Admin ou Gerente
  if (!user || !hasAccess) {
    return (
      <MainLayout pageTitle="🚫 Acesso Restrito">
        <Alert variant="danger" className="shadow-sm border-0 mt-4 d-flex align-items-center p-4">
          <span className="fs-1 me-3">🔒</span>
          <div>
            <h5 className="fw-bold mb-1">Acesso Negado</h5>
            Apenas administradores e gerentes têm permissão para acessar o levantamento e auditoria patrimonial.
          </div>
        </Alert>
      </MainLayout>
    );
  }

  if (loading) {
    return <MainLayout pageTitle="📊 Auditoria Patrimonial"><div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div></MainLayout>;
  }

  return (
    <MainLayout pageTitle="📊 Auditoria Patrimonial (Levantamento Anual)">
      {mensagem && <Alert variant={mensagem.tipo} dismissible onClose={() => setMensagem(null)} className="shadow-sm border-0">{mensagem.texto}</Alert>}

      {!levantamentoAberto ? (
        <Card className="text-center border-0 shadow-sm p-5 mt-4">
          <Card.Body>
            <span className="display-1 d-block mb-4">📋</span>
            <h3 className="fw-bold text-dark">Nenhuma Auditoria em Andamento</h3>
            <p className="text-muted w-75 mx-auto mb-4">
              O Levantamento Anual serve para garantir que todos os equipamentos da sua unidade constam fisicamente no local. 
              Ao iniciar, o sistema criará uma lista de conferência baseada no inventário atual.
            </p>
            <PrimaryButton onClick={handleIniciar} isLoading={loadingAcao} className="px-5 py-3 fs-5">
              🚀 Iniciar Novo Levantamento Anual
            </PrimaryButton>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row className="mb-4 g-3">
            <Col md={8}>
              <Card className="border-0 shadow-sm h-100 bg-white border-start border-primary border-4">
                <Card.Body className="p-4 d-flex flex-column justify-content-center">
                  <h5 className="fw-bold mb-3">Progresso da Unidade</h5>
                  <ProgressBar 
                    now={calcularProgresso()} 
                    label={`${calcularProgresso()}%`} 
                    variant={calcularProgresso() === 100 ? "success" : "primary"}
                    style={{ height: '25px', fontSize: '1rem', fontWeight: 'bold' }} 
                  />
                  <div className="d-flex justify-content-between mt-2 small text-muted fw-bold">
                    <span>{resumo.conferidos_qtd} Lidos</span>
                    <span>Total: {resumo.total}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100 bg-light">
                <Card.Body className="p-4 text-center d-flex flex-column justify-content-center">
                  <Form onSubmit={handleBipar}>
                    <Form.Label className="fw-bold text-uppercase small text-secondary">Leitor de Código de Barras</Form.Label>
                    <InputGroup className="shadow-sm">
                      <InputGroup.Text className="bg-white border-primary">🔫</InputGroup.Text>
                      <Form.Control 
                        ref={inputRef}
                        type="text" 
                        placeholder="Bipar Tombamento..." 
                        value={tombamentoBip}
                        onChange={(e) => setTombamentoBip(e.target.value)}
                        className="border-primary fw-bold text-center fs-5 py-2"
                        autoFocus
                      />
                    </InputGroup>
                    <button type="submit" className="d-none">Submit Escondido</button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm border-top border-danger border-4">
                <Card.Header className="bg-white border-bottom-0 pt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-dark mb-0">⚠️ Pendentes ({resumo.pendentes_qtd})</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table hover responsive className="align-middle mb-0">
                      <thead className="bg-light sticky-top">
                        <tr><th className="ps-4">Tombamento</th><th>Descrição</th></tr>
                      </thead>
                      <tbody>
                        {pendentes.map(b => (
                          <tr key={b.id}>
                            <td className="ps-4 fw-bold text-danger">{b.tombamento}</td>
                            <td className="text-muted small">
                               {b.descricao}
                               {b.tecnico_responsavel && <Badge bg="warning" text="dark" className="d-block mt-1">Com: {b.tecnico_responsavel}</Badge>}
                            </td>
                          </tr>
                        ))}
                        {pendentes.length === 0 && (
                          <tr><td colSpan={2} className="text-center p-4 text-success fw-bold">🎉 Todos os itens pendentes foram localizados!</td></tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm border-top border-success border-4">
                <Card.Header className="bg-white border-bottom-0 pt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-dark mb-0">✅ Conferidos ({resumo.conferidos_qtd})</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table hover responsive className="align-middle mb-0">
                      <thead className="bg-light sticky-top">
                        <tr><th className="ps-4">Tombamento</th><th>Descrição</th></tr>
                      </thead>
                      <tbody>
                        {conferidos.map(b => (
                          <tr key={b.id}>
                            <td className="ps-4 fw-bold text-success">{b.tombamento}</td>
                            <td className="text-muted small">{b.descricao}</td>
                          </tr>
                        ))}
                        {conferidos.length === 0 && (
                          <tr><td colSpan={2} className="text-center p-4 text-muted">Nenhum item bipado ainda.</td></tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <PrimaryButton variant="danger" onClick={handleFinalizar} isLoading={loadingAcao} className="px-4 fw-bold">
              🔒 Encerrar Levantamento Anual
            </PrimaryButton>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default LevantamentoPage;