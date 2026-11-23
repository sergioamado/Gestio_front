// src/components/patrimonio/BemDetailsModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Tabs, Tab, Row, Col, Spinner, Badge, Table } from 'react-bootstrap';
import * as patrimonioService from '../../services/patrimonioService';
import * as usuarioService from '../../services/usuarioService';
import * as unidadeService from '../../services/unidadeService';
import PrimaryButton from '../PrimaryButton';
import { useAuthImage } from '../../hooks/useAuthImage';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';

import type { User, Unidade, BemDetailsModalProps } from '../../types';

function BemDetailsModal({ show, onHide, bem, onUpdate }: BemDetailsModalProps) {
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [unidadeDestinoId, setUnidadeDestinoId] = useState('');
  const [observacaoTransferencia, setObservacaoTransferencia] = useState('');
  
  const [tecnicoAtribuicaoId, setTecnicoAtribuicaoId] = useState('');
  const [observacaoAtribuicao, setObservacaoAtribuicao] = useState('');

  const [loadingAcao, setLoadingAcao] = useState(false);

  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();
  const { src: fotoSrc } = useAuthImage(bem?.foto_url);

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

  //  FUNÇÃO DA FOTO MANTIDA, MAS AGORA TEMOS ONDE A USAR!
  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;
    setLoadingAcao(true);
    try {
      await patrimonioService.uploadFoto(bem.id, foto);
      mostrarCard('Foto Atualizada', 'A foto do bem foi atualizada com sucesso!', 'sucesso');
      setFoto(null);
      onUpdate();
    } catch {
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
    } catch {
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
      mensagem: `Deseja entregar a responsabilidade deste equipamento ao usuário "${tecnicoDestino?.nome_completo}"?`,
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
      mostrarCard('Equipamento Atribuído', 'Termo de cautela registrado com sucesso.', 'sucesso');
      onUpdate();
      setTecnicoAtribuicaoId('');
      setObservacaoAtribuicao('');
    } catch {
      mostrarCard('Erro', 'Falha ao atribuir o equipamento.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleDevolver = async () => {
    const confirmou = await confirmar({
      titulo: '↩️ Registrar Devolução',
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
    } catch {
      mostrarCard('Erro', 'Falha ao registrar a devolução.', 'erro');
    } finally {
      setLoadingAcao(false);
    }
  };

  //  CORREÇÃO DA DATA: Melhorada a extração e a formatação (Data + Hora precisas)
  const formatData = (dataStr: string | null | undefined) => {
    if (!dataStr) return '-';
    try { 
        return new Date(dataStr).toLocaleString('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }); 
    } catch { 
        return 'Data inválida'; 
    }
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
            {bem.foto_url && fotoSrc ? (
               <img src={fotoSrc} alt="Bem" className="img-thumbnail shadow-sm" style={{ maxHeight: '120px' }} />
            ) : (
               <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted shadow-sm" style={{ height: '120px' }}>Sem Foto</div>
            )}
          </Col>
        </Row>

        {loadingDados ? (
           <div className="text-center my-4"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Tabs defaultActiveKey="historico" className="mb-3 custom-tabs">
            
            <Tab eventKey="historico" title="📜 Histórico">
              <div className="mt-3 bg-white p-3 rounded border shadow-sm">
                {historico.length > 0 ? (
                  <Table size="sm" hover responsive className="align-middle mb-0">
                    <thead className="bg-light text-secondary small">
                      <tr><th className="border-0">Data / Hora</th><th className="border-0">De ➔ Para</th><th className="border-0">Motivo</th></tr>
                    </thead>
                    <tbody className="small">
                      {historico.map((mov: any) => (
  <tr key={mov.id}>
    <td className="fw-bold text-muted">{formatData(mov.data_registro)}</td>
    <td>
      {mov.unidade_origem || mov.unidade_destino ? (
        <>
          <Badge bg="light" text="dark" className="border text-truncate" style={{ maxWidth: '120px' }}>
            {mov.unidade_origem?.nome || 'Externa'}
          </Badge>
          <span className="mx-2 text-primary">➔</span>
          <Badge bg="light" text="dark" className="border text-truncate" style={{ maxWidth: '120px' }}>
            {mov.unidade_destino?.nome || 'Indefinida'}
          </Badge>
        </>
      ) : (
        <Badge bg="info" text="dark" className="bg-opacity-25 border border-info">
          {mov.acao} {mov.tecnico_alvo?.nome_completo ? `(${mov.tecnico_alvo.nome_completo})` : ''}
        </Badge>
      )}
    </td>
    <td className="text-muted fst-italic">{mov.detalhes || '-'}</td>
  </tr>
))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center text-muted p-4 bg-light rounded border-dashed">Nenhuma transferência registrada no histórico.</div>
                )}
              </div>
            </Tab>

            <Tab eventKey="cautela" title="👤 Atribuição">
              <div className="mt-3">
                {bem.tecnico_responsavel ? (
                  <div className="p-4 bg-light rounded border text-center shadow-sm">
                     <span className="fs-1 d-block mb-3">💼</span>
                     <h5 className="fw-bold">Emprestado a {bem.tecnico_responsavel}</h5>
                     <p className="text-muted small mb-4">Este equipamento não está no inventário geral da unidade. Ele está sob a responsabilidade direta deste usuário.</p>
                     <PrimaryButton variant="danger" onClick={handleDevolver} isLoading={loadingAcao}>
                        ↩️ Registrar Devolução!
                     </PrimaryButton>
                  </div>
                ) : (
                  <Form onSubmit={handleAtribuir} className="p-4 bg-light rounded border shadow-sm">
                    <h6 className="fw-bold text-dark mb-1">Emitir Termo de Cautela</h6>
                    <p className="small text-muted mb-3">Ao atribuir, o equipamento passa a ser responsabilidade direta da pessoa selecionada.</p>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Selecione o Responsável</Form.Label>
                      <Form.Select value={tecnicoAtribuicaoId} onChange={(e) => setTecnicoAtribuicaoId(e.target.value)} required className="shadow-sm border-0 bg-white py-2">
                        <option value="">Escolha um usuário...</option>
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

            {/*  ABA DA FOTO (CORREÇÃO DA ISSUE) */}
            <Tab eventKey="foto" title="📸 Imagem">
              <Form onSubmit={handleUploadFoto} className="mt-3 p-4 bg-light rounded border shadow-sm text-center">
                <h6 className="fw-bold text-dark mb-3">Atualizar Foto do Equipamento</h6>
                <Form.Group className="mb-4">
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    onChange={(e: any) => setFoto(e.target.files[0])} 
                    required 
                    className="shadow-sm bg-white"
                  />
                </Form.Group>
                <PrimaryButton type="submit" isLoading={loadingAcao} disabled={!foto} className="px-4 fw-bold">
                  Enviar Nova Foto
                </PrimaryButton>
              </Form>
            </Tab>

          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default BemDetailsModal;