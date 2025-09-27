// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Spinner, Alert, Row, Col, Table } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getStatsGlobal } from '../services/relatorioService';
import { getLatestSolicitacoes } from '../services/solicitacaoService';
import type { GlobalStats } from '../services/relatorioService';
import type { LatestSolicitacao } from '../services/solicitacaoService';
import StatCard from '../components/StatCard';

const AdminHome = () => {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    useEffect(() => {
        getStatsGlobal().then(setStats);
    }, []);

    if (!stats) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <>
            <h3 className="mb-4">Visão Geral do Sistema</h3>
            <Row>
                <Col md={3}><StatCard title="Unidades" value={stats.total_unidades} icon="🏢" /></Col>
                <Col md={3}><StatCard title="Usuários" value={stats.total_usuarios} icon="👥" /></Col>
                <Col md={3}><StatCard title="Itens em Estoque" value={stats.total_itens} icon="📦" /></Col>
                <Col md={3}><StatCard title="Solicitações Pendentes" value={stats.solicitacoes_pendentes} icon="⏳" /></Col>
            </Row>
        </>
    );
}

const GerenteTecnicoHome = () => {
    const { user } = useAuth();
    const [solicitacoes, setSolicitacoes] = useState<LatestSolicitacao[]>([]);
     useEffect(() => {
        getLatestSolicitacoes().then(setSolicitacoes);
    }, []);

    const title = user?.role === 'gerente' ? "Últimas 5 Solicitações da Unidade" : "Suas Últimas 5 Solicitações";

    if (solicitacoes.length === 0) {
        return <Alert variant="info">Nenhuma solicitação recente encontrada.</Alert>;
    }

    return (
        <>
            <h3 className="mb-4">{title}</h3>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Técnico Responsável</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitacoes.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{new Date(s.data_solicitacao).toLocaleString('pt-BR')}</td>
                            <td>{s.status}</td>
                            <td>{s.tecnico_responsavel}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Painel de Controle</h1>
      <p className="lead">Bem-vindo(a), {user?.nome_completo}!</p>
      <hr />
      
      {user?.role === 'admin' && <AdminHome />}
      {user?.role === 'gerente' && <GerenteTecnicoHome />}
      {user?.role === 'tecnico' && <GerenteTecnicoHome />}
    </>
  );
};

export default Home;