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
    setMessage(null);
    try {
      const data = await patrimonioService.processarSipac(Number(selectedUnidade), file);
      setBensPreview(data);
      setMessage({ type: 'info', text: `Análise concluída! ${data.length} bens foram identificados. Verifique a lista abaixo antes de salvar.` });
    } catch (err: any) {
      setMessage({ type: 'danger', text: 'Erro ao processar o arquivo PDF. Verifique se o documento é um relatório válido do SIPAC.' });
      setBensPreview([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await patrimonioService.confirmarImportacao(Number(selectedUnidade), bensPreview);
      setMessage({ type: 'success', text: '✅ Patrimônios importados e registrados com sucesso no banco de dados!' });
      setBensPreview([]);
      setFile(null);
      setSelectedUnidade('');
    } catch (err) {
      setMessage({ type: 'danger', text: 'Erro ao salvar a importação. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout pageTitle="📤 Importação Patrimonial SIPAC">
      {message && (
        <Alert variant={message.type} className="shadow-sm border-0 mb-4" onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Card className="floating-card border-0 shadow-sm mb-4 border-start border-primary border-4">
        <Card.Body className="p-4">
          <Card.Title className="fw-bold mb-4 fs-5 text-dark">📄 Upload de Relatório do SIPAC</Card.Title>
          <Form onSubmit={handleProcessar}>
            <Row className="align-items-end g-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary text-uppercase">Unidade de Destino</Form.Label>
                  <Form.Select 
                    className="bg-light border-0 shadow-none"
                    value={selectedUnidade} 
                    onChange={e => setSelectedUnidade(e.target.value)} 
                    required
                    disabled={loading || bensPreview.length > 0}
                  >
                    <option value="">Selecione a unidade...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary text-uppercase">Arquivo de Relatório (.PDF)</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept=".pdf" 
                    className="bg-light border-0 shadow-none"
                    onChange={e => setFile((e.target as any).files[0])} 
                    required 
                    disabled={loading || bensPreview.length > 0}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <PrimaryButton 
                  type="submit" 
                  isLoading={loading && bensPreview.length === 0} 
                  className="w-100 fw-bold"
                  disabled={!file || !selectedUnidade || bensPreview.length > 0}
                >
                  🔍 Analisar
                </PrimaryButton>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {bensPreview.length > 0 && (
        <Card className="floating-card border-0 shadow-sm animate__animated animate__fadeInUp">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Pré-visualização ({bensPreview.length} bens)</h5>
            <div className="d-flex gap-2">
              <PrimaryButton 
                variant="outline-danger" 
                onClick={() => { setBensPreview([]); setFile(null); setMessage(null); }}
                disabled={loading}
              >
                Cancelar
              </PrimaryButton>
              <PrimaryButton 
                variant="success" 
                onClick={handleConfirmar} 
                isLoading={loading}
              >
                💾 Confirmar e Salvar
              </PrimaryButton>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="custom-scrollbar">
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light text-secondary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th className="ps-4 border-0">Tombamento</th>
                    <th className="border-0">Descrição do Equipamento</th>
                    <th className="pe-4 border-0">Marca/Modelo</th>
                  </tr>
                </thead>
                <tbody>
                  {bensPreview.map((bem, idx) => (
                    <tr key={idx}>
                      <td className="ps-4">
                        <span className="fw-bold text-primary bg-light px-2 py-1 rounded" style={{ letterSpacing: '0.5px' }}>
                          {bem.tombamento}
                        </span>
                      </td>
                      <td className="fw-medium text-dark">{bem.descricao}</td>
                      <td className="pe-4 text-muted">{bem.marca || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </MainLayout>
  );
}

export default ImportarSipacPage;