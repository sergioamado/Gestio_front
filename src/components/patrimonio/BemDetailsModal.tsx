// src/components/patrimonio/BemDetailsModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Alert, Tabs, Tab, Row, Col, Spinner, Badge, Table } from 'react-bootstrap';
import * as patrimonioService from '../../services/patrimonioService';
import * as usuarioService from '../../services/usuarioService';
import * as unidadeService from '../../services/unidadeService';
import PrimaryButton from '../PrimaryButton';
import api from '../../services/api';

import type { BemPatrimonial, User, Unidade, BemDetailsModalProps } from '../../types';

function BemDetailsModal({ show, onHide, bem, onUpdate }: BemDetailsModalProps) {
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [unidadeDestinoId, setUnidadeDestinoId] = useState('');
  const [observacaoTransferencia, setObservacaoTransferencia] = useState('');
  
  // Estados da Fase 3 (Cautela)
  const [tecnicoAtribuicaoId, setTecnicoAtribuicaoId] = useState('');
  const [observacaoAtribuicao, setObservacaoAtribuicao] = useState('');

  const [loadingAcao, setLoadingAcao] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: string; texto: string } | null>(null);

  useEffect(() => {
    if (show && bem) {
      setMensagem(null);
      setFoto(null);
      setUnidadeDestinoId('');
      setObservacaoTransferencia('');
      setTecnicoAtribuicaoId('');
      setObservacaoAtribuicao('');
      setLoadingDados(true);
      
      Promise.all([
        usuarioService.getTecnicos(),
        unidadeService.getAllUnidades(),
        patrimonioService.getHistoricoBem(bem.id)
      ]).then(([tecData, unidData, histData]) => {
        setTecnicos(tecData);
        setUnidades(unidData);
        setHistorico(histData);
      }).catch(() => {
        setMensagem({ tipo: 'warning', texto: 'Aviso: Não foi possível carregar alguns dados auxiliares.' });
      }).finally(() => setLoadingDados(false));
    }
  }, [show, bem]);

  if (!bem) return null;

  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;
    setLoadingAcao(true);
    try {
      const formData = new FormData();
      formData.append('foto', foto);
      await api.post(`/patrimonio/${bem.id}/foto`, formData);
      setMensagem({ tipo: 'success', texto: 'Foto atualizada com sucesso!' });
      setFoto(null);
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao atualizar a foto.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleMovimentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadeDestinoId) return;
    setLoadingAcao(true);
    try {
      await patrimonioService.registrarMovimentacao({
        bem_ids: [bem.id],
        origem_unidade_id: bem.unidade_id,
        destino_unidade_id: Number(unidadeDestinoId),
        observacao: observacaoTransferencia
      });
      setMensagem({ tipo: 'success', texto: 'Bem transferido com sucesso!' });
      onUpdate();
      const novoHistorico = await patrimonioService.getHistoricoBem(bem.id);
      setHistorico(novoHistorico);
      setUnidadeDestinoId('');
      setObservacaoTransferencia('');
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao registrar transferência.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  // ==========================================
  // FUNÇÕES DA FASE 3: ATRIBUIR E DEVOLVER
  // ==========================================
  const handleAtribuir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tecnicoAtribuicaoId) return;
    setLoadingAcao(true);
    try {
      await patrimonioService.atribuirBem({
        bem_id: bem.id,
        tecnico_id: Number(tecnicoAtribuicaoId),
        observacoes: observacaoAtribuicao
      });
      setMensagem({ tipo: 'success', texto: 'Termo de cautela registado. Equipamento entregue ao utilizador!' });
      onUpdate();
      setTecnicoAtribuicaoId('');
      setObservacaoAtribuicao('');
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao atribuir o equipamento.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleDevolver = async () => {
    setLoadingAcao(true);
    try {
      await patrimonioService.devolverBem(bem.id);
      setMensagem({ tipo: 'success', texto: 'Equipamento devolvido com sucesso ao inventário da unidade!' });
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao registar devolução.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const formatData = (dataStr: string) => {
    try { return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } 
    catch { return 'Data inválida'; }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light border-bottom-0">
        <Modal.Title className="fw-bold text-dark fs-5">
          📦 Detalhes do Bem: <span className="text-primary">{bem.tombamento}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-2">
        <Row className="mb-4">
          <Col md={8}>
            <h5 className="fw-bold text-dark">{bem.descricao}</h5>
            <div className="text-muted small mb-3">
              <strong>Localização Atual:</strong> {bem.localizacao_fisica} <br/>
              <strong>Unidade:</strong> <Badge bg="primary">{bem.unidade_nome || 'Inventário Geral'}</Badge> <br/>
              <strong>Status:</strong> {bem.status_atual === 'Ativo' ? <span className="text-success fw-bold">✅ Ativo</span> : <span className="text-warning fw-bold">🔄 Transferido</span>}
            </div>
            
            <div className="mt-2">
              <strong className="d-block small text-secondary text-uppercase mb-1">Posse Atual:</strong>
              {bem.tecnico_responsavel ? (
                <Badge bg="info" text="dark" className="shadow-sm py-2 px-3 fs-6">👤 Com: {bem.tecnico_responsavel}</Badge>
              ) : (
                <Badge bg="secondary" className="shadow-sm py-2 px-3 fs-6">🏢 No Setor / Inventário Geral</Badge>
              )}
            </div>
          </Col>
          <Col md={4} className="text-center">
            {bem.foto_url ? (
               <img src={`http://localhost:3001/${bem.foto_url}`} alt="Bem" className="img-thumbnail shadow-sm" style={{ maxHeight: '120px' }} />
            ) : (
               <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted" style={{ height: '120px' }}>Sem Foto</div>
            )}
          </Col>
        </Row>

        {mensagem && <Alert variant={mensagem.tipo} className="border-0 shadow-sm">{mensagem.texto}</Alert>}

        {loadingDados ? (
           <div className="text-center my-4"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Tabs defaultActiveKey="cautela" className="mb-3 custom-tabs">
            
            {/* ABA 1: CAUTELA E ATRIBUIÇÃO */}
            <Tab eventKey="cautela" title="👤 Atribuição">
              <div className="mt-3">
                {bem.tecnico_responsavel ? (
                  <div className="p-4 bg-light rounded border text-center">
                     <span className="fs-1 d-block mb-3">💼</span>
                     <h5 className="fw-bold">Emprestado a {bem.tecnico_responsavel}</h5>
                     <p className="text-muted small mb-4">Este equipamento não está no inventário geral da unidade. Ele está sob a responsabilidade direta deste utilizador.</p>
                     <PrimaryButton variant="danger" onClick={handleDevolver} isLoading={loadingAcao}>
                        ↩️ Registar Devolução
                     </PrimaryButton>
                  </div>
                ) : (
                  <Form onSubmit={handleAtribuir} className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-dark mb-3">Emitir Termo de Cautela</h6>
                    <Alert variant="info" className="small border-0 shadow-sm py-2">Ao atribuir, o equipamento passa a ser responsabilidade direta da pessoa selecionada.</Alert>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Selecione o Responsável</Form.Label>
                      <Form.Select value={tecnicoAtribuicaoId} onChange={(e) => setTecnicoAtribuicaoId(e.target.value)} required className="shadow-sm">
                        <option value="">Escolha um utilizador...</option>
                        {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Observações (Opcional)</Form.Label>
                      <Form.Control as="textarea" rows={2} value={observacaoAtribuicao} onChange={(e) => setObservacaoAtribuicao(e.target.value)} placeholder="Estado do equipamento na entrega..." className="shadow-sm"/>
                    </Form.Group>
                    
                    <div className="text-end">
                      <PrimaryButton type="submit" isLoading={loadingAcao} disabled={!tecnicoAtribuicaoId}>🤝 Atribuir Equipamento</PrimaryButton>
                    </div>
                  </Form>
                )}
              </div>
            </Tab>

            <Tab eventKey="historico" title="📜 Histórico">
              <div className="mt-3">
                {historico.length > 0 ? (
                  <Table size="sm" hover responsive className="align-middle">
                    <thead className="bg-light text-secondary small">
                      <tr><th className="border-0">Data</th><th className="border-0">De ➔ Para</th><th className="border-0">Motivo</th></tr>
                    </thead>
                    <tbody className="small">
                      {historico.map((mov: any) => (
                        <tr key={mov.id}>
                          <td className="fw-bold text-muted">{formatData(mov.data_envio)}</td>
                          <td>
                            <Badge bg="light" text="dark" className="border">{mov.unidade_origem?.nome || 'Externa'}</Badge> <span className="mx-2 text-primary">➔</span>
                            <Badge bg="light" text="dark" className="border">{mov.unidade_destino?.nome || 'Indefinida'}</Badge>
                          </td>
                          <td className="text-muted fst-italic">{mov.subtipo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center text-muted p-4 bg-light rounded border-dashed">Nenhuma transferência registada.</div>
                )}
              </div>
            </Tab>

            <Tab eventKey="movimentar" title="🔄 Transferir">
              <Form onSubmit={handleMovimentar} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Unidade de Destino</Form.Label>
                  <Form.Select value={unidadeDestinoId} onChange={(e) => setUnidadeDestinoId(e.target.value)} required>
                    <option value="">Selecione para onde vai o bem...</option>
                    {unidades.filter(u => u.id !== bem.unidade_id).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Motivo / Observação</Form.Label>
                  <Form.Control as="textarea" rows={2} value={observacaoTransferencia} onChange={(e) => setObservacaoTransferencia(e.target.value)} />
                </Form.Group>
                <div className="text-end">
                  <PrimaryButton type="submit" variant="warning" isLoading={loadingAcao} disabled={!unidadeDestinoId}>Registrar Transferência</PrimaryButton>
                </div>
              </Form>
            </Tab>

          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default BemDetailsModal;