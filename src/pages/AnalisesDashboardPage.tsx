// src/pages/AnalisesDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { PlusCircle, Save } from 'react-bootstrap-icons';
import MainLayout from '../layouts/MainLayout';
import PrimaryButton from '../components/PrimaryButton';
import WidgetContainer from '../components/dashboard/WidgetContainer';
import { analiseService } from '../services/analiseService';

export default function AnalisesDashboardPage() {
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  
  // Controle do Modal de Novo Gráfico
  const [showModal, setShowModal] = useState(false);
  const [novoWidget, setNovoWidget] = useState({
    titulo: '',
    tipo: 'bar',
    dataset: '',
    dimensao: '',
    metrica: '',
    largura: 6 // Padrão: metade da tela
  });

  useEffect(() => {
    // Carrega o catálogo analítico do Backend ao abrir a tela
    analiseService.getCatalogo().then(setCatalogo).catch(console.error);
  }, []);

  // Quando o usuário seleciona um dataset, o sistema busca os detalhes dele no catálogo
  const datasetSelecionado = catalogo.find(c => c.id === novoWidget.dataset);

  const handleAdicionarWidget = (e: React.FormEvent) => {
    e.preventDefault();
    const widgetPronto = {
      id: Date.now(), // ID temporário
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
    
    // Reseta o form
    setNovoWidget({ titulo: '', tipo: 'bar', dataset: '', dimensao: '', metrica: '', largura: 6 });
  };

  const salvarDashboardNoBanco = async () => {
    try {
      await analiseService.salvarDashboard({
        nome: "Meu Dashboard Personalizado",
        descricao: "Dashboard criado dinamicamente",
        widgets: widgets
      });
      alert("Dashboard salvo com sucesso!");
    } catch (error) {
      alert("Erro ao salvar o dashboard.");
    }
  };

  return (
    <MainLayout pageTitle="🧠 Inteligência e Análise (BI)">
      
      {/* BARRA DE FERRAMENTAS */}
      <Card className="border-0 shadow-sm mb-4 bg-white">
        <Card.Body className="p-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">Painel de Gestão</h5>
            <small className="text-muted">Monte os seus próprios gráficos e relatórios</small>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={() => setShowModal(true)} className="fw-bold px-4">
              <PlusCircle className="me-2" /> Adicionar Gráfico
            </Button>
            <PrimaryButton onClick={salvarDashboardNoBanco} className="fw-bold px-4">
              <Save className="me-2" /> Salvar Painel
            </PrimaryButton>
          </div>
        </Card.Body>
      </Card>

      {/* ÁREA DOS WIDGETS (GRID DINÂMICO) */}
      <Row className="g-4">
        {widgets.length === 0 ? (
          <Col md={12}>
            <div className="p-5 text-center bg-light rounded border border-dashed text-muted">
              <PlusCircle size={40} className="mb-3 opacity-50" />
              <h5>O seu painel está vazio</h5>
              <p>Clique em "Adicionar Gráfico" para começar a explorar os dados.</p>
            </div>
          </Col>
        ) : (
          widgets.map((widget) => (
            <Col md={widget.largura} key={widget.id}>
              <WidgetContainer widget={widget} />
            </Col>
          ))
        )}
      </Row>

      {/* MODAL: CONSTRUTOR DE GRÁFICOS */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Novo Gráfico</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdicionarWidget}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="fw-bold small">Título do Gráfico</Form.Label>
                <Form.Control required type="text" placeholder="Ex: Produtividade Mensal" value={novoWidget.titulo} onChange={e => setNovoWidget({...novoWidget, titulo: e.target.value})} />
              </Col>
              
              <Col md={6}>
                <Form.Label className="fw-bold small">Origem dos Dados (Dataset)</Form.Label>
                <Form.Select required value={novoWidget.dataset} onChange={e => setNovoWidget({...novoWidget, dataset: e.target.value, dimensao: '', metrica: ''})}>
                  <option value="">Selecione...</option>
                  {catalogo.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label className="fw-bold small">Visualização</Form.Label>
                <Form.Select required value={novoWidget.tipo} onChange={e => setNovoWidget({...novoWidget, tipo: e.target.value})}>
                  <option value="bar">Gráfico de Barras</option>
                  <option value="line">Gráfico de Linhas</option>
                  <option value="pie">Gráfico de Pizza (Donut)</option>
                </Form.Select>
              </Col>

              {/* Só mostra Dimensão e Métrica se já tiver escolhido o Dataset */}
              {datasetSelecionado && (
                <>
                  <Col md={6}>
                    <Form.Label className="fw-bold small text-primary">Agrupar por (Dimensão/Eixo X)</Form.Label>
                    <Form.Select required value={novoWidget.dimensao} onChange={e => setNovoWidget({...novoWidget, dimensao: e.target.value})}>
                      <option value="">Selecione...</option>
                      {datasetSelecionado.dimensoes.map((dim: any) => <option key={dim.campo} value={dim.campo}>{dim.label}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="fw-bold small text-success">O que medir? (Métrica/Eixo Y)</Form.Label>
                    <Form.Select required value={novoWidget.metrica} onChange={e => setNovoWidget({...novoWidget, metrica: e.target.value})}>
                      <option value="">Selecione...</option>
                      {datasetSelecionado.metricas.map((met: any) => <option key={met.campo} value={met.campo}>{met.label} ({met.agregacao})</option>)}
                    </Form.Select>
                  </Col>
                </>
              )}

              <Col md={12}>
                <Form.Label className="fw-bold small">Tamanho na Tela</Form.Label>
                <Form.Select value={novoWidget.largura} onChange={e => setNovoWidget({...novoWidget, largura: Number(e.target.value)})}>
                  <option value={4}>Pequeno (1/3 da tela)</option>
                  <option value={6}>Médio (Metade da tela)</option>
                  <option value={12}>Grande (Tela inteira)</option>
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <PrimaryButton type="submit">Gerar Gráfico</PrimaryButton>
          </Modal.Footer>
        </Form>
      </Modal>

    </MainLayout>
  );
}