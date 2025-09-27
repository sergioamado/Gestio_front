// src/pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Row, Col, Card, Spinner, Alert, Table, Form, Button } from 'react-bootstrap';
// Serviços de API
import { getSolicitacoesPorTecnico, getTopItens, getRelatorioDetalhadoPorTecnico } from '../services/relatorioService';
import { getAllSolicitacoes } from '../services/solicitacaoService';
import { getTecnicos } from '../services/usuarioService';
// Tipos
import type { SolicitacoesPorTecnico, TopItens } from '../types';
import type { Solicitacao, Usuario } from '../types';

// --- Componente para o Relatório Detalhado ---
const RelatorioPorTecnico = () => {
    const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
    const [filters, setFilters] = useState({ tecnicoId: '', dataInicio: '', dataFim: '' });
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getTecnicos().then(setTecnicos);
    }, []);

    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const params = { ...filters, tecnicoId: Number(filters.tecnicoId) };
        getRelatorioDetalhadoPorTecnico(params)
            .then(setReportData)
            .finally(() => setLoading(false));
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Card className="mt-4">
            <Card.Header as="h5">Relatório Detalhado por Técnico</Card.Header>
            <Card.Body>
                <Form onSubmit={handleGenerateReport}>
                    <Row>
                        <Col md={4}><Form.Group><Form.Label>Técnico</Form.Label><Form.Select name="tecnicoId" value={filters.tecnicoId} onChange={handleChange} required><option>Selecione...</option>{tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}</Form.Select></Form.Group></Col>
                        <Col md={3}><Form.Group><Form.Label>Data Início</Form.Label><Form.Control type="date" name="dataInicio" value={filters.dataInicio} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={3}><Form.Group><Form.Label>Data Fim</Form.Label><Form.Control type="date" name="dataFim" value={filters.dataFim} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={2} className="d-flex align-items-end"><Button type="submit" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Gerar'}</Button></Col>
                    </Row>
                </Form>
                {reportData && (
                    <Table striped bordered hover responsive className="mt-4">
                        <thead><tr><th>ID Solic.</th><th>Data</th><th>Status</th><th>Itens</th></tr></thead>
                        <tbody>
                            {reportData.length === 0 ? (
                                <tr><td colSpan={4}>Nenhum resultado encontrado.</td></tr>
                            ) : (
                                reportData.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{new Date(r.data_solicitacao).toLocaleDateString('pt-BR')}</td>
                                        <td>{r.status}</td>
                                        <td>{r.solicitacao_itens.map((item: { itens: { descricao: any; }; }) => item.itens.descricao).join(', ')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
};


// --- Componente Principal do Dashboard ---
const Dashboard = () => {
  // Estados para os gráficos
  const [solicitacoesData, setSolicitacoesData] = useState<SolicitacoesPorTecnico[]>([]);
  const [topItensData, setTopItensData] = useState<TopItens[]>([]);
  // Estado para a tabela de visão geral
  const [visaosGeralData, setVisaoGeralData] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Busca todos os dados para o dashboard de uma só vez
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [solicitacoesRes, topItensRes, visaoGeralRes] = await Promise.all([
        getSolicitacoesPorTecnico(),
        getTopItens(),
        getAllSolicitacoes(),
      ]);
      setSolicitacoesData(solicitacoesRes);
      setTopItensData(topItensRes);
      setVisaoGeralData(visaoGeralRes);
    } catch (err) {
      setError('Falha ao carregar os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h1>Dashboard de Relatórios</h1>
      <p>Análise de solicitações e uso de itens no sistema.</p>
      <hr />
      {/* Gráficos */}
      <Row>
        <Col md={6} className="mb-4"><Card><Card.Body><Card.Title className="text-center">Solicitações por Técnico</Card.Title><Plot data={[{x: solicitacoesData.map(d => d.tecnico), y: solicitacoesData.map(d => d.total_solicitacoes), type: 'bar'}]} layout={{}} useResizeHandler style={{ width: '100%', height: '400px' }} /></Card.Body></Card></Col>
        <Col md={6} className="mb-4"><Card><Card.Body><Card.Title className="text-center">Top 10 Itens Mais Solicitados</Card.Title><Plot data={[{x: topItensData.map(d => d.quantidade_total), y: topItensData.map(d => d.descricao), type: 'bar', orientation: 'h'}]} layout={{ yaxis: { categoryorder: 'total ascending' } }} useResizeHandler style={{ width: '100%', height: '400px' }} /></Card.Body></Card></Col>
      </Row>
      
      {/* Visão Geral */}
      <Card className="mt-4">
        <Card.Header as="h5">Visão Geral das Últimas Solicitações</Card.Header>
        <Card.Body>
            <Table striped bordered hover responsive>
                <thead><tr><th>ID</th><th>Data</th><th>Status</th><th>Técnico Responsável</th></tr></thead>
                <tbody>
                    {visaosGeralData.slice(0, 10).map(s => ( // Mostra apenas as 10 últimas
                        <tr key={s.id}><td>{s.id}</td><td>{new Date(s.data_solicitacao).toLocaleString('pt-BR')}</td><td>{s.status}</td><td>{s.tecnico_responsavel}</td></tr>
                    ))}
                </tbody>
            </Table>
        </Card.Body>
      </Card>
      
      {/* Relatório Detalhado Interativo */}
      <RelatorioPorTecnico />
    </>
  );
};

export default Dashboard;