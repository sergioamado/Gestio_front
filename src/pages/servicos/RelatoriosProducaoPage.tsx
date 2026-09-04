// src/pages/RelatoriosProducaoPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Table, Form, Spinner, Alert, Button } from 'react-bootstrap';
import { PrinterFill, GraphUpArrow, CashCoin, Tools, Laptop, CalendarCheck } from 'react-bootstrap-icons';
import { useReactToPrint } from 'react-to-print';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { relatoriosService } from '../../services/relatorioService';

export default function RelatoriosProducaoPage() {
  const [dados, setDados] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de Data
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  // Referência para o gerador de PDF
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: `Relatorio_Producao_TI_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`,
  });

  useEffect(() => {
    carregarDashboard();
  }, []); // Carrega tudo ao iniciar

  const carregarDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resposta = await relatoriosService.getDashboardProducao(dataInicial, dataFinal);
      setDados(resposta);
    } catch (err) {
      setError("Falha ao carregar os dados do relatório.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    carregarDashboard();
  };

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  return (
    <MainLayout pageTitle="📊 Dashboard Executivo de Produção">
      
      {/* BARRA DE FERRAMENTAS (Filtros e Botão PDF) - NÃO SAI NO PDF */}
      <Card className="border-0 shadow-sm mb-4 bg-white d-print-none">
        <Card.Body className="p-3">
          <Form onSubmit={handleFiltrar} className="d-flex flex-wrap align-items-end gap-3">
            <Form.Group>
              <Form.Label className="small fw-bold text-muted mb-1">Data Inicial</Form.Label>
              <Form.Control type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} className="shadow-sm" />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted mb-1">Data Final</Form.Label>
              <Form.Control type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} className="shadow-sm" />
            </Form.Group>
            <PrimaryButton type="submit" className="shadow-sm px-4">
              <CalendarCheck className="me-2" /> Filtrar
            </PrimaryButton>
            
            <div className="ms-auto">
              <Button variant="danger" onClick={handlePrint} className="shadow-sm px-4 fw-bold d-flex align-items-center" disabled={isLoading}>
                <PrinterFill className="me-2" /> Exportar para PDF
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading && <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>}

      {/* ÁREA QUE VAI PARA O PDF */}
      {!isLoading && dados && (
        <div ref={componentRef} className="pdf-container p-1">
          
          {/* Cabeçalho do PDF (Só aparece na impressão se quiser, ou deixamos visível sempre) */}
          <div className="d-none d-print-block text-center mb-4 pb-3 border-bottom">
            <h2 className="fw-bold text-dark">Relatório Executivo de TI</h2>
            <p className="text-muted mb-0">
              Período: {dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'Início'} até {dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'Atual'}
            </p>
          </div>

          {/* 1. CARDS DE RESUMO FINANCEIRO */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-primary text-white h-100">
                <Card.Body>
                  <h6 className="opacity-75 mb-3 fw-bold"><CashCoin className="me-2" /> Mão de Obra</h6>
                  <h3 className="fw-bold mb-0">{formatarMoeda(dados.resumoFinanceiro.totalMaoObra)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-warning text-dark h-100">
                <Card.Body>
                  <h6 className="opacity-75 mb-3 fw-bold"><Tools className="me-2" /> Custo de Peças</h6>
                  <h3 className="fw-bold mb-0">{formatarMoeda(dados.resumoFinanceiro.totalPecas)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-success text-white h-100">
                <Card.Body>
                  <h6 className="opacity-75 mb-3 fw-bold"><GraphUpArrow className="me-2" /> Economia Total</h6>
                  <h3 className="fw-bold mb-0">{formatarMoeda(dados.resumoFinanceiro.economiaTotal)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm bg-dark text-white h-100">
                <Card.Body>
                  <h6 className="opacity-75 mb-3 fw-bold"><CalendarCheck className="me-2" /> Serviços Fechados</h6>
                  <h3 className="fw-bold mb-0">{dados.totalServicosExecutados}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 2. GRÁFICOS */}
          <Row className="mb-4 g-3">
            {/* Evolução Mensal */}
            <Col md={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                  <h6 className="fw-bold text-dark">Evolução Mensal (R$)</h6>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dados.evolucaoMensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(val) => `R$ ${val / 1000}k`} />
                      <Tooltip formatter={(value: any) => formatarMoeda(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total Produzido" stroke="#198754" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="maoObra" name="Mão de Obra" stroke="#0d6efd" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            
            {/* Top Serviços */}
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                  <h6 className="fw-bold text-dark">Top 5 Serviços Realizados</h6>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dados.topServicos} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="qtd" name="Qtd Executada" fill="#0dcaf0" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* 3. TABELAS (Ranking e Reincidência) */}
          <Row className="g-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-2">
                  <h6 className="fw-bold text-dark mb-0">👨‍🔧 Ranking de Produtividade (Técnicos)</h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover striped className="mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Técnico</th>
                        <th className="text-center">Serviços</th>
                        <th className="text-end pe-4">Valor Gerado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.rankingTecnicos.map((tec: any, index: number) => (
                        <tr key={index}>
                          <td className="ps-4 fw-bold text-dark">{tec.nome}</td>
                          <td className="text-center">
                            <span className="badge bg-primary rounded-pill">{tec.qtd}</span>
                          </td>
                          <td className="text-end pe-4 text-success fw-bold">{formatarMoeda(tec.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-2">
                  <h6 className="fw-bold text-dark mb-0"><Laptop className="me-2"/> Alerta de Reincidência (Equipamentos)</h6>
                  <small className="text-muted">Patrimônios que mais consumiram manutenção</small>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="mb-0 small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Patrimônio / Série</th>
                        <th className="text-center">Qtd Manutenções</th>
                        <th className="text-end pe-4">Custo Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.reincidenciaEquipamentos.length === 0 ? (
                        <tr><td colSpan={3} className="text-center text-muted py-4">Nenhuma reincidência registrada.</td></tr>
                      ) : (
                        dados.reincidenciaEquipamentos.map((eq: any, index: number) => (
                          <tr key={index}>
                            <td className="ps-4 fw-bold">{eq.patrimonio}</td>
                            <td className="text-center">
                              {/* Se quebrou mais de 2 vezes, pinta de vermelho */}
                              <span className={`badge ${eq.qtd >= 3 ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill`}>{eq.qtd}x</span>
                            </td>
                            <td className="text-end pe-4 fw-bold text-danger">{formatarMoeda(eq.custoTotal)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </div>
      )}
    </MainLayout>
  );
}