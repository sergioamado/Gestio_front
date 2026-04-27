// src/pages/Patrimonio/ImportarSipacPage.tsx
import { useState, useEffect } from 'react';
import { Card, Form, Alert, Table, Row, Col } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import * as unidadeService from '../../services/unidadeService';
import * as patrimonioService from '../../services/patrimonioService';
import type { Unidade, BemPatrimonial } from '../../types';

function ImportarSipacPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [selectedUnidade, setSelectedUnidade] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [bensPreview, setBensPreview] = useState<Partial<BemPatrimonial>[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string, text: string } | null>(null);

  useEffect(() => {
    unidadeService.getAllUnidades().then(setUnidades);
  }, []);

  const handleProcessar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedUnidade) return;

    setLoading(true);
    try {
      const data = await patrimonioService.processarSipac(Number(selectedUnidade), file);
      setBensPreview(data);
      setMessage({ type: 'info', text: `${data.length} bens identificados. Verifique a lista abaixo.` });
    } catch (err: any) {
      setMessage({ type: 'danger', text: 'Erro ao processar PDF.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      await patrimonioService.confirmarImportacao(Number(selectedUnidade), bensPreview);
      setMessage({ type: 'success', text: 'Patrimônios importados com sucesso!' });
      setBensPreview([]);
      setFile(null);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Erro ao salvar importação.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout pageTitle="📤 Importação Patrimonial SIPAC">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <Card className="floating-card mb-4">
        <Card.Body>
          <Form onSubmit={handleProcessar}>
            <Row className="align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Unidade Destino</Form.Label>
                  <Form.Select value={selectedUnidade} onChange={e => setSelectedUnidade(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Arquivo PDF</Form.Label>
                  <Form.Control type="file" accept=".pdf" onChange={e => setFile((e.target as any).files[0])} required />
                </Form.Group>
              </Col>
              <Col md={2}>
                <PrimaryButton type="submit" isLoading={loading} className="w-100">Analisar</PrimaryButton>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {bensPreview.length > 0 && (
        <Card className="floating-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Dados Extraídos do PDF</h5>
            <PrimaryButton variant="success" onClick={handleConfirmar} isLoading={loading}>
              ✅ Aceitar e Salvar Tudo
            </PrimaryButton>
          </Card.Header>
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Tombamento</th>
                <th>Descrição</th>
                <th>Marca</th>
              </tr>
            </thead>
            <tbody>
              {bensPreview.map((bem, idx) => (
                <tr key={idx}>
                  <td><code>{bem.tombamento}</code></td>
                  <td>{bem.descricao}</td>
                  <td>{bem.marca}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </MainLayout>
  );
}

export default ImportarSipacPage;