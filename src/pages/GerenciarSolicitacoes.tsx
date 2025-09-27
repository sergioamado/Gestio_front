// src/pages/GerenciarSolicitacoes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { getAllSolicitacoes } from '../services/solicitacaoService';
import type { Solicitacao } from '../types';
import SolicitacaoDetalhesModal from '../components/SolicitacaoDetalhesModal';

const GerenciarSolicitacoes = () => {
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchSolicitacoes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllSolicitacoes();
            setSolicitacoes(data);
        } catch (err) {
            setError('Falha ao carregar solicitações.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSolicitacoes();
    }, [fetchSolicitacoes]);

    const handleOpenModal = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedId(null);
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <>
            <h1>Gerenciar Solicitações</h1>
            <p>Visualize e gerencie as solicitações de material pendentes e concluídas.</p>
            <hr />
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Técnico Responsável</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitacoes.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{new Date(s.data_solicitacao).toLocaleString('pt-BR')}</td>
                            <td>{s.status}</td>
                            <td>{s.tecnico_responsavel}</td>
                            <td>
                                <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(s.id)}>
                                    Ver Detalhes
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <SolicitacaoDetalhesModal
                show={showModal}
                handleClose={handleCloseModal}
                solicitacaoId={selectedId}
                onUpdate={fetchSolicitacoes}
            />
        </>
    );
};

export default GerenciarSolicitacoes;