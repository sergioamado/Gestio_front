// src/pages/Patrimonio/ListaBensPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Form, Row, Col, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import * as patrimonioService from '../../services/patrimonioService';
import type { BemPatrimonial } from '../../types';
import PrimaryButton from '../../components/PrimaryButton';
import BemDetailsModal from '../../components/patrimonio/BemDetailsModal';

function ListaBensPage() {
  const [bens, setBens] = useState<BemPatrimonial[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBem, setSelectedBem] = useState<BemPatrimonial | null>(null);

  const fetchBens = useCallback(() => {
    setLoading(true);
    setError(null);
    patrimonioService.getAllBens({ status: filtroStatus, search: busca })
      .then(setBens)
      .catch(() => setError('Falha ao carregar o inventário de bens patrimoniais. Verifique a conexão com o servidor.'))
      .finally(() => setLoading(false));
  }, [filtroStatus, busca]);

  useEffect(() => {
    fetchBens();
  }, [fetchBens]);

  const handleOpenDetails = (bem: BemPatrimonial) => {
    setSelectedBem(bem);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">✅ Ativo</Badge>;
      case 'Transferido':
        return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">🔄 Transferido</Badge>;
      case 'Inservivel':
      case 'Inservível':
        return <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">❌ Inservível</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">{status}</Badge>;
    }
  };

  return (
    <MainLayout pageTitle="📦 Gestão de Patrimônio">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="floating-card border-0 shadow-sm mb-4 bg-white border-start border-primary border-4">
        <Card.Body className="p-4">
          <Card.Title className="fw-bold mb-4 fs-5 text-dark">🔍 Filtros de Busca do Inventário</Card.Title>
          <Row className="g-3">
            <Col md={6} lg={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Buscar Bem</Form.Label>
                <InputGroup className="shadow-sm">
                  <InputGroup.Text className="bg-light border-0">🔍</InputGroup.Text>
                  <Form.Control 
                    className="bg-light border-0 shadow-none"
                    placeholder="Tombamento ou descrição..." 
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary text-uppercase">Status do Bem</Form.Label>
                <Form.Select 
                  className="bg-light border-0 shadow-none"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos os Status</option>
                  <option value="Ativo">✅ Ativos</option>
                  <option value="Transferido">🔄 Transferidos</option>
                  <option value="Inservivel">❌ Inservíveis</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="floating-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="fw-bold text-dark mb-0">Bens Registrados</h5>
        </Card.Header>
        <Card.Body className="p-0 mt-3">
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted fw-medium">Carregando inventário patrimonial...</div>
            </div>
          ) : bens.length > 0 ? (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="ps-4 border-0">Tombamento</th>
                  <th className="border-0">Descrição do Equipamento</th>
                  <th className="border-0">Localização</th>
                  <th className="border-0">Status</th>
                  <th className="pe-4 text-end border-0">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bens.map(bem => (
                  <tr key={bem.id}>
                    <td className="ps-4">
                      <span className="fw-bold text-primary bg-light px-2 py-1 rounded" style={{ letterSpacing: '0.5px' }}>
                        {bem.tombamento}
                      </span>
                    </td>
                    <td className="fw-medium text-dark">{bem.descricao}</td>
                    <td className="text-muted">{bem.localizacao_fisica}</td>
                    <td>{getStatusBadge(bem.status_atual)}</td>
                    <td className="pe-4 text-end">
                      <PrimaryButton size="sm" variant="outline-primary" onClick={() => handleOpenDetails(bem)}>
                        ⚙️ Gerenciar
                      </PrimaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted p-5">
              <span className="fs-1 d-block mb-3">📭</span>
              <h5 className="fw-bold text-dark">Nenhum bem patrimonial encontrado.</h5>
              <p className="mb-0">Ajuste os filtros de busca ou verifique se a sincronização com o SIPAC foi realizada.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <BemDetailsModal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)} 
        bem={selectedBem} 
        onUpdate={fetchBens} 
      />
    </MainLayout>
  );
}

export default ListaBensPage;