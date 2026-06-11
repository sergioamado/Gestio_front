// src/components/patrimonio/BemDetailsModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Tabs, Tab, Row, Col, Spinner, Badge, Table } from 'react-bootstrap';
import * as patrimonioService from '../../services/patrimonioService';
import * as usuarioService from '../../services/usuarioService';
import * as unidadeService from '../../services/unidadeService';
import PrimaryButton from '../PrimaryButton';
import api from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';

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

  // 🚀 INICIALIZAÇÃO DOS MOTORES UI
  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();

  useEffect(() => {
    if (show && bem) {
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
        mostrarCard('Aviso', 'Não foi possível carregar alguns dados auxiliares do histórico.', 'alerta');
      }).finally(() => setLoadingDados(false));
    }
  }, [show, bem, mostrarCard]);

  if (!bem) return null;

  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;
    setLoadingAcao(true);
    try {
      const formData = new FormData();
      formData.append('foto', foto);
      await api.post(`/patrimonio/${bem.id}/foto`, formData);
      mostrarCard('Foto Atualizada', 'A foto do bem foi atualizada com sucesso!', 'sucesso');
      setFoto(null);
      onUpdate();
    } catch (err) {
      mostrarCard('Erro', 'Não foi possível atualizar a foto.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleMovimentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadeDestinoId) return;

    const unidadeDestino = unidades.find(u => u.id === Number(unidadeDestinoId));

    const confirmou = await confirmar({
      titulo: '🔄 Transferir Equipamento',
      mensagem: `Confirma a transferência deste equipamento para a unidade "${unidadeDestino?.nome}"?`,
      textoConfirmar: 'Sim, Transferir',
      textoCancelar: 'Cancelar',
      varianteBotao: 'warning'
    });

    if (!confirmou) return;

    setLoadingAcao(true);
    try {
      await patrimonioService.registrarMovimentacao({
        bem_ids: [bem.id],
        origem_unidade_id: bem.unidade_id,
        destino_unidade_id: Number(unidadeDestinoId),
        observacao: observacaoTransferencia
      });
      mostrarCard('Transferência Concluída', 'O bem foi transferido com sucesso!', 'sucesso');
      onUpdate();
      
      const novoHistorico = await patrimonioService.getHistoricoBem(bem.id);
      setHistorico(novoHistorico);
      setUnidadeDestinoId('');
      setObservacaoTransferencia('');
    } catch (err) {
      mostrarCard('Erro', 'Não foi possível registrar a transferência.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleAtribuir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tecnicoAtribuicaoId) return;

    const tecnicoDestino = tecnicos.find(t => t.id === Number(tecnicoAtribuicaoId));

    const confirmou = await confirmar({
      titulo: '🤝 Emitir Termo de Cautela',
      mensagem: `Deseja entregar a responsabilidade deste equipamento ao utilizador "${tecnicoDestino?.nome_completo}"?`,
      textoConfirmar: 'Sim, Atribuir',
      textoCancelar: 'Cancelar',
      varianteBotao: 'primary'
    });

    if (!confirmou) return;

    setLoadingAcao(true);
    try {
      await patrimonioService.atribuirBem({
        bem_id: bem.id,
        tecnico_id: Number(tecnicoAtribuicaoId),
        observacoes: observacaoAtribuicao
      });
      mostrarCard('Equipamento Atribuído', 'Termo de cautela registado com sucesso.', 'sucesso');
      onUpdate();
      setTecnicoAtribuicaoId('');
      setObservacaoAtribuicao('');
    } catch (err) {
      mostrarCard('Erro', 'Falha ao atribuir o equipamento.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleDevolver = async () => {
    const confirmou = await confirmar({
      titulo: '↩️ Registar Devolução',
      mensagem: 'Confirma que este equipamento foi devolvido e deverá voltar ao inventário geral da unidade?',
      textoConfirmar: 'Sim, Devolver',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (!confirmou) return;

    setLoadingAcao(true);
    try {
      await patrimonioService.devolverBem(bem.id);
      mostrarCard('Devolução Concluída', 'O equipamento voltou para o inventário.', 'sucesso');
      onUpdate();
    } catch (err) {
      mostrarCard('Erro', 'Falha ao registar a devolução.', 'erro');
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
              <strong>Unidade:</strong> <Badge bg="primary" className="ms-1">{bem.unidade_nome || 'Inventário Geral'}</Badge> <br/>
              <strong>Status:</strong> {bem.status_atual === 'Ativo' ? <span className="text-success fw-bold ms-1">✅ Ativo</span> : <span className="text-warning fw-bold ms-1">🔄 Transferido</span>}
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
               <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted shadow-sm" style={{ height: '120px' }}>Sem Foto</div>
            )}
          </Col>
        </Row>

        {loadingDados ? (
           <div className="text-center my-4"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Tabs defaultActiveKey="cautela" className="mb-3 custom-tabs">
            
            {/* ABA 1: CAUTELA E ATRIBUIÇÃO */}
            <Tab eventKey="cautela" title="👤 Atribuição">
              <div className="mt-3">
                {bem.tecnico_responsavel ? (
                  <div className="p-4 bg-light rounded border text-center shadow-sm">
                     <span className="fs-1 d-block mb-3">💼</span>
                     <h5 className="fw-bold">Emprestado a {bem.tecnico_responsavel}</h5>
                     <p className="text-muted small mb-4">Este equipamento não está no inventário geral da unidade. Ele está sob a responsabilidade direta deste utilizador.</p>
                     <PrimaryButton variant="danger" onClick={handleDevolver} isLoading={loadingAcao}>
                        ↩️ Registar Devolução!
                     </PrimaryButton>
                  </div>
                ) : (
                  <Form onSubmit={handleAtribuir} className="p-4 bg-light rounded border shadow-sm">
                    <h6 className="fw-bold text-dark mb-1">Emitir Termo de Cautela</h6>
                    <p className="small text-muted mb-3">Ao atribuir, o equipamento passa a ser responsabilidade direta da pessoa selecionada.</p>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Selecione o Responsável</Form.Label>
                      <Form.Select value={tecnicoAtribuicaoId} onChange={(e) => setTecnicoAtribuicaoId(e.target.value)} required className="shadow-sm border-0 bg-white py-2">
                        <option value="">Escolha um utilizador...</option>
                        {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Observações (Opcional)</Form.Label>
                      <Form.Control as="textarea" rows={2} value={observacaoAtribuicao} onChange={(e) => setObservacaoAtribuicao(e.target.value)} placeholder="Estado do equipamento na entrega..." className="shadow-sm border-0 bg-white"/>
                    </Form.Group>
                    
                    <div className="text-end">
                      <PrimaryButton type="submit" isLoading={loadingAcao} disabled={!tecnicoAtribuicaoId} className="px-4">
                        🤝 Atribuir Equipamento
                      </PrimaryButton>
                    </div>
                  </Form>
                )}
              </div>
            </Tab>

            <Tab eventKey="historico" title="📜 Histórico">
              <div className="mt-3 bg-white p-3 rounded border shadow-sm">
                {historico.length > 0 ? (
                  <Table size="sm" hover responsive className="align-middle mb-0">
                    <thead className="bg-light text-secondary small">
                      <tr><th className="border-0">Data</th><th className="border-0">De ➔ Para</th><th className="border-0">Motivo</th></tr>
                    </thead>
                    <tbody className="small">
                      {historico.map((mov: any) => (
                        <tr key={mov.id}>
                          <td className="fw-bold text-muted">{formatData(mov.data_envio)}</td>
                          <td>
                            <Badge bg="light" text="dark" className="border text-truncate" style={{maxWidth: '120px'}}>{mov.unidade_origem?.nome || 'Externa'}</Badge> 
                            <span className="mx-2 text-primary">➔</span>
                            <Badge bg="light" text="dark" className="border text-truncate" style={{maxWidth: '120px'}}>{mov.unidade_destino?.nome || 'Indefinida'}</Badge>
                          </td>
                          <td className="text-muted fst-italic">{mov.subtipo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center text-muted p-4 bg-light rounded border-dashed">Nenhuma transferência registada no histórico.</div>
                )}
              </div>
            </Tab>

            <Tab eventKey="movimentar" title="🔄 Transferir">
              <Form onSubmit={handleMovimentar} className="mt-3 p-4 bg-light rounded border shadow-sm">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Unidade de Destino</Form.Label>
                  <Form.Select value={unidadeDestinoId} onChange={(e) => setUnidadeDestinoId(e.target.value)} required className="shadow-sm border-0 bg-white py-2">
                    <option value="">Selecione para onde vai o bem...</option>
                    {unidades.filter(u => u.id !== bem.unidade_id).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Motivo / Observação</Form.Label>
                  <Form.Control as="textarea" rows={2} value={observacaoTransferencia} onChange={(e) => setObservacaoTransferencia(e.target.value)} className="shadow-sm border-0 bg-white" placeholder="Justificativa da transferência..."/>
                </Form.Group>
                <div className="text-end">
                  <PrimaryButton type="submit" variant="warning" isLoading={loadingAcao} disabled={!unidadeDestinoId} className="px-4 text-dark fw-bold">
                    Registrar Transferência
                  </PrimaryButton>
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