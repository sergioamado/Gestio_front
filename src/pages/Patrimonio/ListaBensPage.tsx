import { useState, useEffect } from 'react';
import { Table, Card, Form, Row, Col, Badge } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import * as patrimonioService from '../../services/patrimonioService';
import  type { BemPatrimonial } from '../../types/index';
import PrimaryButton from '../../components/PrimaryButton';

function ListaBensPage() {
  const [bens, setBens] = useState<BemPatrimonial[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    patrimonioService.getAllBens({ status: filtroStatus, search: busca }).then(setBens);
  }, [filtroStatus, busca]);

  return (
    <MainLayout pageTitle="📦 Gestão de Patrimônio">
      <Card className="floating-card mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Control 
                placeholder="Buscar por tombamento ou descrição..." 
                onChange={(e) => setBusca(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Transferido">Transferidos</option>
                <option value="Inservivel">Inservíveis</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="floating-card">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Tombamento</th>
              <th>Descrição</th>
              <th>Localização</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {bens.map(bem => (
              <tr key={bem.id}>
                <td><code>{bem.tombamento}</code></td>
                <td>{bem.descricao}</td>
                <td>{bem.localizacao_fisica}</td>
                <td>
                  <Badge bg={bem.status_atual === 'Ativo' ? 'success' : 'secondary'}>
                    {bem.status_atual}
                  </Badge>
                </td>
                <td>
                  <PrimaryButton size="sm" onClick={() => {/* Abrir Modal Detalhes */}}>
                    Detalhes
                  </PrimaryButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </MainLayout>
  );
}