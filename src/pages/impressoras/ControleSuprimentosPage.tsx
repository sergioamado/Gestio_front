// src/pages/ControleSuprimentosPage.tsx
import { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button, Modal, Form, Table, Badge } from 'react-bootstrap';
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

  // Perfis de Acesso
  const isGestor = user?.role === 'admin' || user?.role === 'gerente';
  const isTecnicoImpressora = user?.role === 'tecnico_impressora';
  const hasAccess = isGestor || isTecnicoImpressora;

  // Estados dos Novos Modais
  const [showModalReporte, setShowModalReporte] = useState(false);
  const [showModalCorrecao, setShowModalCorrecao] = useState(false);
  const [showModalHistorico, setShowModalHistorico] = useState(false);

  // Estados dos Formulários
  const [corReporte, setCorReporte] = useState('');
  const [mensagemReporte, setMensagemReporte] = useState('');
  const [corCorrecao, setCorCorrecao] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState<number | ''>('');
  const [justificativaCorrecao, setJustificativaCorrecao] = useState('');
  const [historicoEntradas, setHistoricoEntradas] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // Modal de Feedback Geral
  const [feedback, setFeedback] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'danger' }>({
    show: false,
    title: '',
    message: '',
    variant: 'success'
  });

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

  // 1. Técnico Reporta Inconsistência
  const handleReportarErro = async () => {
    if (!mensagemReporte.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = corReporte ? `[Cor: ${corReporte}] ${mensagemReporte}` : mensagemReporte;
      await suprimentosService.reportarErroEstoque({ mensagem: payload });
      setShowModalReporte(false);
      setMensagemReporte('');
      setCorReporte('');
      setFeedback({
        show: true,
        title: 'Reporte Enviado',
        message: 'Inconsistência de estoque reportada à gerência com sucesso.',
        variant: 'success'
      });
    } catch (err: any) {
      setFeedback({
        show: true,
        title: 'Erro no Envio',
        message: err.response?.data?.message || 'Erro ao reportar inconsistência.',
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Gestor Corrige Estoque Manualmente
  const handleCorrigirEstoque = async () => {
    if (!corCorrecao || novaQuantidade === '' || !justificativaCorrecao.trim()) return;
    setIsSubmitting(true);
    try {
      await suprimentosService.corrigirEstoque({
        cor: corCorrecao,
        novaQuantidade: Number(novaQuantidade),
        justificativa: justificativaCorrecao
      });
      setShowModalCorrecao(false);
      setCorCorrecao('');
      setNovaQuantidade('');
      setJustificativaCorrecao('');
      fetchData();
      setFeedback({
        show: true,
        title: 'Estoque Atualizado',
        message: 'Ajuste de estoque e justificativa registrados com sucesso.',
        variant: 'success'
      });
    } catch (err: any) {
      setFeedback({
        show: true,
        title: 'Erro na Correção',
        message: err.response?.data?.message || 'Erro ao corrigir estoque.',
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Gestor Visualiza Histórico de Entradas
  const handleAbrirHistorico = async () => {
    setShowModalHistorico(true);
    setLoadingHistorico(true);
    try {
      const data = await suprimentosService.getHistoricoEntradas();
      setHistoricoEntradas(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setFeedback({
        show: true,
        title: 'Erro ao Carregar',
        message: 'Não foi possível buscar o histórico de entradas de suprimentos.',
        variant: 'danger'
      });
    } finally {
      setLoadingHistorico(false);
    }
  };

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
    <MainLayout pageTitle="🖨️ Requisição e Controle de Suprimentos">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Barra de Ações Operacionais */}
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
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="fw-bold text-dark mb-0">Histórico de Requisições de Saída</h5>
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

      {/* Modal Nova Requisição */}
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

      {/* MODAL 1: Técnico de Impressora Reportar Erro */}
      <Modal show={showModalReporte} onHide={() => setShowModalReporte(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-6 fw-bold">⚠️ Reportar Inconsistência de Estoque</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="small text-muted mb-3">
            Informe a divergência entre a quantidade física no armário e o saldo do sistema. O gestor receberá este aviso para efetuar a correção.
          </p>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-secondary">Suprimento / Cor (Opcional)</Form.Label>
            <Form.Select value={corReporte} onChange={(e) => setCorReporte(e.target.value)}>
              <option value="">Selecione se aplicável...</option>
              <option value="Preto">Preto</option>
              <option value="Cyan">Cyan</option>
              <option value="Magenta">Magenta</option>
              <option value="Amarelo">Amarelo</option>
              <option value="Kit Manutenção">Kit Manutenção / Peça</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Descrição da Divergência</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Ex: No sistema constam 5 toners pretos, porém na prateleira física restam apenas 2."
              value={mensagemReporte}
              onChange={(e) => setMensagemReporte(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowModalReporte(false)}>Cancelar</Button>
          <Button variant="danger" size="sm" onClick={handleReportarErro} disabled={isSubmitting || !mensagemReporte.trim()}>
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL 2: Gestor Corrigir Estoque */}
      <Modal show={showModalCorrecao} onHide={() => setShowModalCorrecao(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title className="fs-6 fw-bold">✏️ Ajuste Manual de Estoque de Suprimentos</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-secondary">Suprimento / Cor</Form.Label>
            <Form.Select value={corCorrecao} onChange={(e) => setCorCorrecao(e.target.value)}>
              <option value="">Selecione o suprimento...</option>
              <option value="Preto">Preto</option>
              <option value="Cyan">Cyan</option>
              <option value="Magenta">Magenta</option>
              <option value="Amarelo">Amarelo</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-secondary">Nova Quantidade Real Total</Form.Label>
            <Form.Control 
              type="number" 
              min="0"
              placeholder="Ex: 4"
              value={novaQuantidade}
              onChange={(e) => setNovaQuantidade(e.target.value ? Number(e.target.value) : '')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Justificativa da Alteração</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              placeholder="Ex: Contagem física refeita após reporte do técnico de impressora."
              value={justificativaCorrecao}
              onChange={(e) => setJustificativaCorrecao(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowModalCorrecao(false)}>Cancelar</Button>
          <Button 
            variant="warning" 
            size="sm" 
            className="fw-bold" 
            onClick={handleCorrigirEstoque} 
            disabled={isSubmitting || !corCorrecao || novaQuantidade === '' || !justificativaCorrecao.trim()}
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar Ajuste'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL 3: Gestor Histórico de Entradas / Entradas por Período */}
      <Modal show={showModalHistorico} onHide={() => setShowModalHistorico(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="fs-6 fw-bold">🕒 Histórico de Entradas e Ajustes de Suprimentos</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {loadingHistorico ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" variant="info" />
              <div className="small text-muted mt-2">Buscando histórico...</div>
            </div>
          ) : historicoEntradas.length === 0 ? (
            <div className="text-center text-muted py-4">Nenhum registro de entrada ou ajuste localizado.</div>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm" className="align-middle mb-0">
                <thead className="bg-light text-secondary small">
                  <tr>
                    <th>Data / Hora</th>
                    <th>Operação</th>
                    <th>Cor / Suprimento</th>
                    <th className="text-center">Qtd</th>
                    <th>Responsável</th>
                    <th>Justificativa</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {historicoEntradas.map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td>{new Date(item.data_registro || item.createdAt).toLocaleString('pt-BR')}</td>
                      <td>
                        <Badge bg={item.tipo_operacao === 'CORRECAO' || item.tipo_operacao === 'CORRECAO_GESTOR' ? 'warning' : 'success'} text={item.tipo_operacao?.includes('CORRECAO') ? 'dark' : 'white'}>
                          {item.tipo_operacao || 'ENTRADA'}
                        </Badge>
                      </td>
                      <td className="fw-bold">{item.cor}</td>
                      <td className={`text-center fw-bold ${item.quantidade >= 0 ? 'text-success' : 'text-danger'}`}>
                        {item.quantidade >= 0 ? `+${item.quantidade}` : item.quantidade}
                      </td>
                      <td>{item.usuarios?.nome_completo || item.usuario?.nome_completo || 'N/A'}</td>
                      <td className="text-muted">{item.justificativa || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModalHistorico(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Feedback */}
      <Modal show={feedback.show} onHide={() => setFeedback(prev => ({ ...prev, show: false }))} centered>
        <Modal.Header closeButton className={`bg-${feedback.variant} text-white`}>
          <Modal.Title className="fs-6 fw-bold">{feedback.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-dark">
          {feedback.message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setFeedback(prev => ({ ...prev, show: false }))}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
}

export default ControleSuprimentosPage;