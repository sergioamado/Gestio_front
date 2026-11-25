// src/pages/Patrimonio/LevantamentoPage.tsx
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Badge, ProgressBar, Table, Alert, Spinner, InputGroup } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import * as patrimonioService from '../../services/patrimonioService';
import type { BemPatrimonial, Unidade } from '../../types';
import * as unidadeService from '../../services/unidadeService';
import { useTempoReal } from '../../hooks/useTempoReal';

function LevantamentoPage() {
  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();
  const { user } = useAuth();
  
  const [levantamentoAberto, setLevantamentoAberto] = useState(false);
  const [resumo, setResumo] = useState({ total: 0, conferidos_qtd: 0, pendentes_qtd: 0 });
  const [pendentes, setPendentes] = useState<BemPatrimonial[]>([]);
  const [conferidos, setConferidos] = useState<BemPatrimonial[]>([]);
  
  const [tombamentoBip, setTombamentoBip] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 🚀 CONTROLO DE ACESSO: Apenas Admin e Gerente
  const hasAccess = user?.role === 'admin' || user?.role === 'gerente';

  // Gerente: sempre a própria unidade. Admin não tem unidade (vê tudo): escolhe qual acompanhar,
  // ou "Todas as unidades". Antes o admin caía sempre na unidade 1.
  const isAdmin = user?.role === 'admin';
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeEscolhida, setUnidadeEscolhida] = useState('');
  const unidadeId: number | undefined = isAdmin
    ? (unidadeEscolhida ? Number(unidadeEscolhida) : undefined)
    : (user?.unidade_id ?? undefined);
  const nomeUnidade = isAdmin
    ? (unidades.find((u) => u.id === unidadeId)?.nome ?? 'Todas as unidades')
    : 'sua unidade';

  useEffect(() => {
    if (isAdmin) unidadeService.getAllUnidades().then(setUnidades).catch(() => setUnidades([]));
  }, [isAdmin]);

  // silencioso = recarga em tempo real (sem spinner e sem roubar o foco)
  const carregarLevantamento = async (silencioso = false) => {
    if (silencioso !== true) setLoading(true);
    try {
      const data = await patrimonioService.getLevantamentoAtual(unidadeId);
      if (data && data.levantamento) {
        setLevantamentoAberto(true);
        setResumo(data.resumo);
        setPendentes(data.pendentes);
        setConferidos(data.conferidos);
        
        // Foca automaticamente no campo de bipe após carregar
        if (silencioso !== true) setTimeout(() => inputRef.current?.focus(), 300);
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
    // 🚀 Só tenta buscar os dados se o usuário tiver permissão
    if (user && hasAccess) {
      carregarLevantamento();
    } else if (user && !hasAccess) {
      setLoading(false); // Remove o loading infinito para quem não tem acesso
    }
  }, [unidadeId, user, hasAccess]);

  // Tempo real: outro colega bipando (ex.: pelo celular), levantamento iniciado/finalizado
  // ou bens alterados → o progresso se atualiza sozinho.
  useTempoReal(['levantamento', 'patrimonio'], () => carregarLevantamento(true), !!user && hasAccess);

  const handleIniciar = async () => {
    setLoadingAcao(true);
    try {
      await patrimonioService.iniciarLevantamento();
      await carregarLevantamento();
      mostrarCard('Sucesso', 'Auditoria Anual Iniciada! Comece a bipar os equipamentos.', 'sucesso');
    } catch (err: any) {
      mostrarCard('Erro', err.response?.data?.message || 'Erro ao iniciar.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleFinalizar = async () => {
    if (resumo.pendentes_qtd > 0) {
      const ok = await confirmar({
        titulo: '⚠️ Itens Pendentes',
        mensagem: `Faltam ${resumo.pendentes_qtd} itens para conferir. Deseja fechar o levantamento mesmo assim e considerá-los como "Não Localizados"?`,
        textoConfirmar: 'Sim, Fechar',
        varianteBotao: 'warning',
      });
      if (!ok) return;
    }
    
    setLoadingAcao(true);
    try {
      await patrimonioService.finalizarLevantamento();
      setLevantamentoAberto(false);
      mostrarCard('Sucesso', 'Relatório de Levantamento encerrado e salvo com sucesso!', 'sucesso');
    } catch (err: any) {
      mostrarCard('Erro', err.response?.data?.message || 'Erro ao finalizar.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleBipar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tombamentoBip.trim()) return;
    if (!unidadeId) {
      // A unidade define se o bem está no lugar certo (OK) ou não (Inconsistente).
      mostrarCard('Escolha a unidade', 'Selecione acima a unidade que está sendo conferida antes de bipar.', 'alerta');
      return;
    }

    setLoadingAcao(true);
    try {
      await patrimonioService.biparItemLevantamento({
        tombamento: tombamentoBip.trim(),
        unidade_id: unidadeId
      });
      setTombamentoBip(''); // Limpa o input rápido para o próximo bipe
      mostrarCard('Sucesso', `✅ Item ${tombamentoBip} conferido com sucesso!`, 'sucesso');
      await carregarLevantamento(); // Atualiza as listas e a barra de progresso
    } catch (err: any) {
      mostrarCard('Erro', err.response?.data?.message || 'Erro ao bipar item.', 'erro');
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

  // 🚀 TELA DE BLOQUEIO: Exibida se o usuário não for Admin ou Gerente
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
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h5 className="fw-bold mb-0">Progresso: {nomeUnidade}</h5>
                    {isAdmin && (
                      <Form.Select
                        size="sm"
                        style={{ maxWidth: 260 }}
                        value={unidadeEscolhida}
                        onChange={(e) => setUnidadeEscolhida(e.target.value)}
                        aria-label="Unidade a acompanhar"
                      >
                        <option value="">Todas as unidades</option>
                        {unidades.map((u) => <option key={u.id} value={u.id}>{u.sigla ? `${u.sigla} – ${u.nome}` : u.nome}</option>)}
                      </Form.Select>
                    )}
                  </div>
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