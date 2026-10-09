// src/pages/AnalisesDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { PlusCircle, Save, ArrowClockwise } from 'react-bootstrap-icons';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import WidgetContainer from '../components/dashboard/WidgetContainer';
import { analiseService } from '../services/analiseService';
import { socket } from '../services/socket'; // Antena de Rádio!
import { useToast } from '../contexts/ToastContext';

export default function AnalisesDashboardPage() {
  const { mostrarCard } = useToast();
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  
  //  Variável gatilho: muda o valor para forçar os widgets a recarregar
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  // Controle do Modal de Novo Gráfico
  const [showModal, setShowModal] = useState(false);
  const [novoWidget, setNovoWidget] = useState({
    titulo: '',
    tipo: 'bar',
    dataset: '',
    dimensao: '',
    metrica: '',
    largura: 6 
  });

  useEffect(() => {
    analiseService.getCatalogo().then(setCatalogo).catch(console.error);
    
    // (Opcional) Aqui também deveria carregar o Dashboard guardado no banco, 
    // caso o utilizador já tivesse um guardado previamente.
  }, []);

  
  //  MOTOR DE BI EM TEMPO REAL (WebSockets Multicanal)
  
  useEffect(() => {
    //  O GRANDE ESCUTADOR: Ouve todas as frequências do sistema
    const lidarComNovosDados = () => {
      console.log("📊 BI Real-Time: O sistema foi alterado. Atualizando gráficos...");
      setRefreshTrigger(prev => prev + 1); // Dispara a atualização dos filhos
    };

    // Sintoniza em tudo o que configurámos até agora
    socket.on('atualizar_tabelas_os', lidarComNovosDados);
    socket.on('atualizar_manutencao', lidarComNovosDados);
    socket.on('atualizar_estoque', lidarComNovosDados);
    socket.on('atualizar_atendimentos', lidarComNovosDados);
    socket.on('atualizar_suprimentos', lidarComNovosDados);
    socket.on('atualizar_producao', lidarComNovosDados); // (Preparando para a Produção)

    // Desliga tudo ao sair
    return () => {
      socket.off('atualizar_tabelas_os', lidarComNovosDados);
      socket.off('atualizar_manutencao', lidarComNovosDados);
      socket.off('atualizar_estoque', lidarComNovosDados);
      socket.off('atualizar_atendimentos', lidarComNovosDados);
      socket.off('atualizar_suprimentos', lidarComNovosDados);
      socket.off('atualizar_producao', lidarComNovosDados);
    };
  }, []);
  // ==========================================================================

  // Força uma atualização manual se o utilizador clicar no botão
  const forceRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const datasetSelecionado = catalogo.find(c => c.id === novoWidget.dataset);

  const handleAdicionarWidget = (e: React.FormEvent) => {
    e.preventDefault();
    const widgetPronto = {
      id: Date.now(), 
      titulo: novoWidget.titulo,
      tipo: novoWidget.tipo as any,
      dataset: novoWidget.dataset,
      largura: novoWidget.largura,
      configuracao: {
        dimensoes: [novoWidget.dimensao],
        metricas: [novoWidget.metrica]
      }
    };
    setWidgets([...widgets, widgetPronto]);
    setShowModal(false);
    setNovoWidget({ titulo: '', tipo: 'bar', dataset: '', dimensao: '', metrica: '', largura: 6 });
  };

  const salvarDashboardNoBanco = async () => {
    try {
      if (widgets.length === 0) {
          mostrarCard('Aviso', 'Não pode salvar um dashboard vazio.', 'alerta');
          return;
      }
      
      await analiseService.salvarDashboard({
        nome: "Meu Dashboard Personalizado",
        descricao: "Dashboard criado dinamicamente",
        widgets: widgets
      });
      mostrarCard('Sucesso', 'Painel analítico salvo com sucesso!', 'sucesso');
    } catch (error) {
      mostrarCard('Erro', 'Não foi possível salvar a configuração do dashboard.', 'erro');
    }
  };

  const removerWidget = (id: number) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  return (
    <MainLayout pageTitle="🧠 Inteligência e Análise (BI)">
      
      <Card className="border-0 shadow-sm mb-4 bg-white border-start border-info border-4">
        <Card.Body className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Painel de Gestão e Performance</h5>
            <small className="text-muted fw-medium">
                Os dados exibidos neste painel são <span className="text-success fw-bold">Live (Tempo Real)</span>. Os gráficos atualizam sozinhos.
            </small>
          </div>
          <div className="d-flex flex-wrap gap-2">
             <Button variant="light" onClick={forceRefresh} className="fw-bold text-secondary shadow-sm border" title="Forçar Atualização">
              <ArrowClockwise />
            </Button>
            <Button variant="outline-primary" onClick={() => setShowModal(true)} className="fw-bold px-3 shadow-sm bg-white">
              <PlusCircle className="me-2" /> Adicionar Gráfico
            </Button>
            <PrimaryButton onClick={salvarDashboardNoBanco} className="fw-bold px-4 shadow-sm">
              <Save className="me-2" /> Salvar Painel
            </PrimaryButton>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {widgets.length === 0 ? (
          <Col md={12}>
            <div className="p-5 text-center bg-white rounded shadow-sm border mt-4">
              <span className="fs-1 d-block mb-3 opacity-75">📊</span>
              <h5 className="fw-bold text-dark">O seu painel de BI está vazio</h5>
              <p className="text-muted mb-0">Clique em "Adicionar Gráfico" para começar a explorar os dados do Gestio.</p>
            </div>
          </Col>
        ) : (
          widgets.map((widget) => (
            <Col md={widget.largura} key={widget.id}>
              {/*  Passamos o refreshTrigger para o WidgetContainer saber quando buscar dados novos */}
              <div className="position-relative">
                  <Button 
                      variant="light" 
                      size="sm" 
                      className="position-absolute top-0 end-0 m-2 rounded-circle border shadow-sm z-1 text-danger" 
                      onClick={() => removerWidget(widget.id)}
                      title="Remover Gráfico"
                      style={{width: '32px', height: '32px', padding: 0}}
                  >
                      ✕
                  </Button>
                  <WidgetContainer widget={widget} refreshTrigger={refreshTrigger} />
              </div>
            </Col>
          ))
        )}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title className="fw-bold text-dark fs-5">📊 Montar Novo Gráfico</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdicionarWidget}>
          <Modal.Body className="p-4">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                    <Form.Label className="fw-bold small text-uppercase text-secondary">Título do Gráfico</Form.Label>
                    <Form.Control required type="text" placeholder="Ex: Produtividade Mensal, OS por Setor..." value={novoWidget.titulo} onChange={e => setNovoWidget({...novoWidget, titulo: e.target.value})} className="bg-light border-0 shadow-none fw-medium" />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                 <Form.Group>
                    <Form.Label className="fw-bold small text-uppercase text-secondary">Origem dos Dados</Form.Label>
                    <Form.Select required value={novoWidget.dataset} onChange={e => setNovoWidget({...novoWidget, dataset: e.target.value, dimensao: '', metrica: ''})} className="bg-light border-0 shadow-none fw-medium">
                    <option value="">Selecione o Dataset...</option>
                    {catalogo.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                    </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small text-uppercase text-secondary">Visualização Visual</Form.Label>
                    <Form.Select required value={novoWidget.tipo} onChange={e => setNovoWidget({...novoWidget, tipo: e.target.value})} className="bg-light border-0 shadow-none fw-medium">
                    <option value="bar">📊 Gráfico de Barras</option>
                    <option value="line">📈 Gráfico de Linhas</option>
                    <option value="pie">🍩 Gráfico de Pizza (Donut)</option>
                    </Form.Select>
                </Form.Group>
              </Col>

              {datasetSelecionado && (
                <>
                  <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-bold small text-uppercase text-primary">Agrupar Por (Eixo X / Fatias)</Form.Label>
                        <Form.Select required value={novoWidget.dimensao} onChange={e => setNovoWidget({...novoWidget, dimensao: e.target.value})} className="bg-primary bg-opacity-10 border-0 shadow-none fw-bold text-primary">
                        <option value="">Selecione o campo...</option>
                        {datasetSelecionado.dimensoes.map((dim: any) => <option key={dim.campo} value={dim.campo}>{dim.label}</option>)}
                        </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                     <Form.Group>
                        <Form.Label className="fw-bold small text-uppercase text-success">Métrica a Calcular (Eixo Y)</Form.Label>
                        <Form.Select required value={novoWidget.metrica} onChange={e => setNovoWidget({...novoWidget, metrica: e.target.value})} className="bg-success bg-opacity-10 border-0 shadow-none fw-bold text-success">
                        <option value="">Selecione a medição...</option>
                        {datasetSelecionado.metricas.map((met: any) => <option key={met.campo} value={met.campo}>{met.label} ({met.agregacao})</option>)}
                        </Form.Select>
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col md={12}>
                <Form.Group>
                    <Form.Label className="fw-bold small text-uppercase text-secondary">Espaço Ocupado na Tela</Form.Label>
                    <Form.Select value={novoWidget.largura} onChange={e => setNovoWidget({...novoWidget, largura: Number(e.target.value)})} className="bg-light border-0 shadow-none fw-medium">
                    <option value={4}>Pequeno (Ocupa 1/3 da tela)</option>
                    <option value={6}>Médio (Ocupa 1/2 da tela)</option>
                    <option value={8}>Largo (Ocupa 2/3 da tela)</option>
                    <option value={12}>Extra Grande (Ocupa a tela inteira)</option>
                    </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 bg-light">
            <Button variant="outline-secondary" className="fw-bold shadow-sm bg-white" onClick={() => setShowModal(false)}>Cancelar</Button>
            <PrimaryButton type="submit" className="shadow-sm">✨ Gerar Gráfico no Painel</PrimaryButton>
          </Modal.Footer>
        </Form>
      </Modal>

    </MainLayout>
  );
}