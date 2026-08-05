// src/components/solicitacoes/SolicitacaoItem.tsx
import React, { useState } from 'react';
import { Accordion, Badge, Button, Row, Col, Table, Form, InputGroup, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
  Clipboard, 
  CheckCircleFill, 
  XCircleFill, 
  ClockFill, 
  BoxSeamFill, 
  EyeFill,
  ArrowReturnLeft
} from 'react-bootstrap-icons';
import * as solicitacaoService from '../../services/solicitacaoService';
import * as notificacaoService from '../../services/notificacaoService'; 
import PrimaryButton from '../PrimaryButton';
import type { SolicitacaoDetalhada, StatusSolicitacao } from '../../types';

interface SolicitacaoItemProps {
  solicitacao: SolicitacaoDetalhada;
  onUpdate: () => void;
  currentUserRole?: string;
}

const formatarData = (dataString?: string | null) => {
  if (!dataString) return 'N/A';
  return new Date(dataString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDENTE': return <Badge bg="warning" text="dark" className="px-3 py-2 border border-warning"><ClockFill className="me-1"/> Pendente</Badge>;
    case 'EM ATENDIMENTO': return <Badge bg="info" className="px-3 py-2"><CheckCircleFill className="me-1"/> Em Atendimento</Badge>;
    case 'PRONTA PARA VISTORIA': return <Badge bg="primary" className="px-3 py-2" style={{ backgroundColor: '#6f42c1' }}><EyeFill className="me-1"/> Pronta para Vistoria</Badge>;
    case 'CONCLUIDA': return <Badge bg="success" className="px-3 py-2"><CheckCircleFill className="me-1"/> Concluída</Badge>;
    case 'CANCELADA': return <Badge bg="danger" className="px-3 py-2"><XCircleFill className="me-1"/> Cancelada</Badge>;
    default: return <Badge bg="secondary" className="px-3 py-2">{status}</Badge>;
  }
};

const getEntregaStatusBadge = (status: string) => {
  switch (status) {
    case 'Entregue': return <Badge bg="success">Entregue</Badge>;
    case 'Devolvida': return <Badge bg="danger">Devolvida c/ Defeito</Badge>;
    case 'Recebida pelo Técnico': return <Badge bg="info">Em posse do Técnico</Badge>;
    default: return <Badge bg="warning" text="dark">Pendente</Badge>;
  }
};

const SolicitacaoItem: React.FC<SolicitacaoItemProps> = ({ solicitacao, onUpdate, currentUserRole }) => {
  const isGestor = currentUserRole === 'admin' || currentUserRole === 'gerente';
  const isTecnico = currentUserRole === 'tecnico' || currentUserRole?.startsWith('tecnico');

  // Estados principais
  const [statusOS, setStatusOS] = useState<StatusSolicitacao>(solicitacao.status);
  const [entregas, setEntregas] = useState<Record<number, string>>(
    solicitacao.solicitacao_itens.reduce((acc, item) => ({ ...acc, [item.id]: item.status_entrega }), {})
  );

  const [chamadoAlmoxarifado, setChamadoAlmoxarifado] = useState(solicitacao.numero_pedido_externo ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para Gestão de Modais (Substituindo alerts e prompts nativos)
  const [modalFeedback, setModalFeedback] = useState<{ show: boolean; title: string; message: string; variant: 'success' | 'danger' | 'info' }>({
    show: false, title: '', message: '', variant: 'info'
  });
  
  const [modalConfirmVistoria, setModalConfirmVistoria] = useState(false);

  // Estado para o Modal de Devolução de Peça com Defeito (substitui o window.prompt)
  const [modalDevolucao, setModalDevolucao] = useState<{ show: boolean; itemId: number | null; nomeItem: string }>({
    show: false, itemId: null, nomeItem: ''
  });
  const [motivoDefeito, setMotivoDefeito] = useState('');

  const handleEntregaChange = (itemId: number, novoStatus: string) => {
    setEntregas(prev => ({ ...prev, [itemId]: novoStatus }));
  };

  // AÇÃO DO GESTOR: Salvar OS e Alterações
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      let justificativaAtualizada = solicitacao.justificativa;
      if (chamadoAlmoxarifado !== solicitacao.numero_pedido_externo) {
         const dataHora = formatarData(new Date().toISOString());
         justificativaAtualizada = `${solicitacao.justificativa || ''}\n[${dataHora}] Chamado Almoxarifado atualizado para: ${chamadoAlmoxarifado}`.trim();
      }

      await solicitacaoService.updateSolicitacao(solicitacao.id, { 
        status: statusOS,
        numero_pedido_externo: chamadoAlmoxarifado,
        justificativa: justificativaAtualizada,
        itens_entrega: Object.keys(entregas).map(id => ({
          solicitacao_item_id: Number(id),
          status_entrega: entregas[Number(id)]
        }))
      });
      onUpdate();
      setModalFeedback({ show: true, title: 'Sucesso', message: 'Alterações guardadas com sucesso!', variant: 'success' });
    } catch (error) {
      setModalFeedback({ show: true, title: 'Erro', message: 'Erro ao salvar as alterações da Solicitação.', variant: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  // AÇÃO DO TÉCNICO: Marcar OS Inteira como Pronta para Vistoria
  const handleProntaParaVistoria = async () => {
    setModalConfirmVistoria(false);
    setIsSaving(true);
    try {
      await solicitacaoService.updateSolicitacao(solicitacao.id, { status: 'PRONTA PARA VISTORIA' });
      
      // Exemplo de notificação gerada para o gestor:
      // await notificacaoService.createNotificacao({ titulo: `Vistoria: OS GLPI ${solicitacao.numero_glpi}`, mensagem: `O técnico informou que a máquina está pronta para vistoria.`, roleAlvo: 'admin' });

      onUpdate();
      setModalFeedback({ show: true, title: 'Sucesso', message: 'Status atualizado para Pronta para Vistoria com sucesso!', variant: 'success' });
    } catch (error) {
      setModalFeedback({ show: true, title: 'Erro', message: 'Erro ao atualizar o status para vistoria.', variant: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  // AÇÃO DO TÉCNICO: Confirmar que recebeu a peça fisicamente
  const handleReceberPeca = async (itemId: number, nomeItem: string) => {
    setIsSaving(true);
    try {
       handleEntregaChange(itemId, 'Recebida pelo Técnico');
       
       // Notificação para o Gestor (opcional conforme estrutura)
       // await notificacaoService.createNotificacao({ titulo: `Peça Recebida: OS GLPI ${solicitacao.numero_glpi}`, mensagem: `O técnico confirmou o recebimento físico do item: ${nomeItem}.`, roleAlvo: 'admin' });
       
       setModalFeedback({ show: true, title: 'Recebimento Confirmado', message: `O recebimento de "${nomeItem}" foi registado. O gestor foi notificado.`, variant: 'success' });
    } catch {
       setModalFeedback({ show: true, title: 'Erro', message: 'Não foi possível registrar o recebimento.', variant: 'danger' });
    } finally {
       setIsSaving(false);
    }
  };

  // AÇÃO DO TÉCNICO: Confirmar Devolução via Modal
  const confirmarDevolucaoPeca = async () => {
    if (!motivoDefeito.trim() || modalDevolucao.itemId === null) return;
    
    const itemId = modalDevolucao.itemId;
    setIsSaving(true);
    try {
       handleEntregaChange(itemId, 'Devolvida');
       
       // Notificação para o Gestor / Almoxarifado
       // await notificacaoService.createNotificacao({ titulo: `Peça com Defeito! OS GLPI ${solicitacao.numero_glpi}`, mensagem: `O item ${modalDevolucao.nomeItem} foi devolvido. Motivo: ${motivoDefeito}`, roleAlvo: 'admin' });
       
       setModalDevolucao({ show: false, itemId: null, nomeItem: '' });
       setMotivoDefeito('');
       setModalFeedback({ show: true, title: 'Devolução Registada', message: 'A devolução por defeito foi comunicada ao almoxarifado.', variant: 'info' });
    } catch {
       setModalFeedback({ show: true, title: 'Erro', message: 'Erro ao processar a devolução da peça.', variant: 'danger' });
    } finally {
       setIsSaving(false);
    }
  };

  const resumo = `
OS #${solicitacao.id} - GLPI: ${solicitacao.numero_glpi}
Status: ${solicitacao.status}
Unidade: ${solicitacao.unidades_organizacionais?.nome || 'N/A'}
Técnico: ${solicitacao.usuarios_solicitacoes_usuario_idTousuarios?.nome_completo || 'N/A'}
Responsável (Unidade): ${solicitacao.usuarios_solicitacoes_responsavel_usuario_idTousuarios?.nome_completo || 'N/A'}
Itens Solicitados:
${solicitacao.solicitacao_itens.map(i => `- ${i.quantidade_solicitada}x ${i.itens?.descricao} (${i.status_entrega})`).join('\n')}
  `.trim();

  const isVistoria = solicitacao.status === 'PRONTA PARA VISTORIA';

  return (
    <>
      <Accordion.Item eventKey={solicitacao.id.toString()} className={`mb-3 border-0 shadow-sm rounded overflow-hidden ${isVistoria ? 'border-start border-warning border-4' : ''}`}>
        <Accordion.Header className={isVistoria ? 'bg-light-warning' : ''}>
          <div className="d-flex justify-content-between align-items-center w-100 me-3">
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fw-bold fs-6 text-dark">OS #{solicitacao.id}</span>
                <span className="text-muted fw-bold">|</span>
                <span className="text-primary fw-bold">GLPI: {solicitacao.numero_glpi}</span>
              </div>
              <div className="small text-muted fw-medium d-flex align-items-center">
                 <BoxSeamFill className="me-1 text-secondary"/> {solicitacao.unidades_organizacionais?.sigla || solicitacao.unidades_organizacionais?.nome} 
                 <span className="mx-2">•</span> 
                 🧑‍🔧 {solicitacao.usuarios_solicitacoes_usuario_idTousuarios?.nome_completo}
              </div>
            </div>
            <div>
              {getStatusBadge(solicitacao.status)}
            </div>
          </div>
        </Accordion.Header>
        <Accordion.Body className="bg-light pt-4 border-top">
          
          {/* BANNER TÉCNICO: Botão de Vistoria */}
          {isTecnico && solicitacao.status === 'EM ATENDIMENTO' && (
             <div className="bg-warning bg-opacity-10 border border-warning rounded p-3 d-flex justify-content-between align-items-center shadow-sm mb-4">
                <div>
                   <strong>Tudo pronto?</strong> Se já concluiu a manutenção, avise a gerência.
                </div>
                <Button variant="warning" size="sm" className="fw-bold shadow-sm" onClick={() => setModalConfirmVistoria(true)} disabled={isSaving}>
                   <EyeFill className="me-2"/> Informar Pronta para Vistoria
                </Button>
             </div>
          )}

          {/* CARD GESTOR: Inserir Número de Chamado do Almoxarifado */}
          {isGestor && (
             <div className="bg-white p-3 rounded border mb-4 shadow-sm">
               <Form.Group>
                  <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
                    Nº do Chamado Almoxarifado (Num/Ano)
                  </Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type="text" 
                      placeholder="Ex: 124/2026" 
                      value={chamadoAlmoxarifado} 
                      onChange={(e) => setChamadoAlmoxarifado(e.target.value)}
                      className="bg-light"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted" style={{fontSize: '0.75rem'}}>
                    A alteração deste campo regista automaticamente a data/hora no histórico da OS.
                  </Form.Text>
               </Form.Group>
             </div>
          )}

          <Row className="mb-4">
            <Col md={6}>
              <h6 className="fw-bold text-secondary text-uppercase small mb-3">Detalhes da Requisição</h6>
              <p className="mb-1 small"><strong className="text-dark">Data de Criação:</strong> {formatarData(solicitacao.data_solicitacao)}</p>
              <p className="mb-1 small"><strong className="text-dark">Responsável pela Máquina:</strong> {solicitacao.usuarios_solicitacoes_responsavel_usuario_idTousuarios?.nome_completo}</p>
              <p className="mb-1 small"><strong className="text-dark">Patrimônio / Tombo:</strong> {solicitacao.patrimonio || 'Não informado'}</p>
              <p className="mb-1 small"><strong className="text-dark">Setor Físico:</strong> {solicitacao.setor_equipamento || 'Não informado'}</p>
              <p className="mb-1 small"><strong className="text-dark">Documento Emitido Em:</strong> {formatarData(solicitacao.documento_emitido_em)}</p>
              {solicitacao.numero_pedido_externo && (
                <p className="mb-1 small"><strong className="text-dark">Chamado Almoxarifado Atual:</strong> <Badge bg="secondary">{solicitacao.numero_pedido_externo}</Badge></p>
              )}
            </Col>
            <Col md={6}>
               {isGestor ? (
                  <>
                    <h6 className="fw-bold text-secondary text-uppercase small mb-3">Gerir Status da OS</h6>
                    <Form.Select 
                      value={statusOS} 
                      onChange={(e) => setStatusOS(e.target.value as StatusSolicitacao)} 
                      className="mb-3 shadow-sm border-secondary fw-medium"
                    >
                      <option value="PENDENTE">⏳ Pendente</option>
                      <option value="EM ATENDIMENTO">🛠️ Em Atendimento</option>
                      <option value="PRONTA PARA VISTORIA">👀 Pronta para Vistoria</option>
                      <option value="CONCLUIDA">✅ Concluída</option>
                      <option value="CANCELADA">❌ Cancelada</option>
                    </Form.Select>
                  </>
               ) : (
                  <div className="p-3 bg-white rounded border border-dashed">
                    <h6 className="fw-bold text-secondary small text-uppercase">Aviso de Gestão</h6>
                    <p className="text-muted small mb-0">O status geral da Ordem de Serviço é controlado exclusivamente pela gerência.</p>
                  </div>
               )}
            </Col>
          </Row>

          <h6 className="fw-bold text-secondary text-uppercase small mb-3">Peças Solicitadas ({solicitacao.solicitacao_itens.length})</h6>
          <div className="table-responsive bg-white rounded border shadow-sm mb-4">
            <Table hover className="align-middle mb-0 text-sm">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 small text-secondary">Peça / Insumo</th>
                  <th className="border-0 small text-secondary text-center">Qtd.</th>
                  <th className="border-0 small text-secondary">Status Gestão</th>
                  {isTecnico && <th className="border-0 small text-secondary text-center">Ações do Técnico</th>}
                </tr>
              </thead>
              <tbody>
                {solicitacao.solicitacao_itens.map((item) => {
                   const itemStatus = entregas[item.id] || item.status_entrega;
                   
                   return (
                    <tr key={item.id}>
                      <td className="fw-medium text-dark">{item.itens?.descricao} <br/><span className="text-muted small">Cód: {item.itens?.codigo_sipac}</span></td>
                      <td className="text-center fw-bold">{item.quantidade_solicitada}</td>
                      
                      <td>
                        {isGestor ? (
                          <Form.Select 
                            size="sm" 
                            value={itemStatus} 
                            onChange={(e) => handleEntregaChange(item.id, e.target.value)}
                            className={itemStatus === 'Entregue' ? 'border-success text-success' : itemStatus === 'Devolvida' ? 'border-danger text-danger' : ''}
                          >
                            <option value="Pendente">Pendente Almoxarifado</option>
                            <option value="Entregue">Disponível para Retirada</option>
                            <option value="Recebida pelo Técnico">Em posse do Técnico</option>
                            <option value="Devolvida">Devolvida (Defeito/Erro)</option>
                          </Form.Select>
                        ) : (
                          getEntregaStatusBadge(itemStatus)
                        )}
                      </td>

                      {isTecnico && (
                        <td className="text-center">
                           <div className="d-flex justify-content-center gap-2">
                             {itemStatus === 'Entregue' && (
                               <Button variant="outline-success" size="sm" title="Confirmar Recebimento Físico" onClick={() => handleReceberPeca(item.id, item.itens?.descricao || 'Peça')}>
                                 <CheckCircleFill /> Recebi
                               </Button>
                             )}
                             
                             {(itemStatus === 'Entregue' || itemStatus === 'Recebida pelo Técnico') && (
                               <Button variant="outline-danger" size="sm" title="Devolver por Defeito" onClick={() => setModalDevolucao({ show: true, itemId: item.id, nomeItem: item.itens?.descricao || 'Peça' })}>
                                 <ArrowReturnLeft /> Devolver
                               </Button>
                             )}
                           </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {solicitacao.justificativa && (
            <div className="mb-4 bg-white p-3 border rounded shadow-sm">
              <h6 className="fw-bold text-secondary text-uppercase small mb-2">Justificativa / Histórico:</h6>
              <p className="small text-dark mb-0" style={{ whiteSpace: 'pre-wrap' }}>{solicitacao.justificativa}</p>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <CopyToClipboard text={resumo} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              <Button variant="outline-secondary" size="sm" className="fw-bold d-flex align-items-center shadow-sm">
                <Clipboard className="me-2" /> {copied ? 'Copiado!' : 'Copiar Resumo'}
              </Button>
            </CopyToClipboard>
            
            {isGestor && (
               <PrimaryButton onClick={handleSaveChanges} isLoading={isSaving} disabled={isSaving} className="px-4 py-2">
                 💾 Guardar Alterações
               </PrimaryButton>
            )}
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* ========================================================= */}
      {/* MODAL DE FEEDBACK (Substitui os alerts nativos)            */}
      {/* ========================================================= */}
      <Modal show={modalFeedback.show} onHide={() => setModalFeedback(prev => ({ ...prev, show: false }))} centered>
        <Modal.Header closeButton className={`bg-${modalFeedback.variant} text-white`}>
          <Modal.Title className="fs-6 fw-bold">{modalFeedback.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-0 text-dark">{modalFeedback.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setModalFeedback(prev => ({ ...prev, show: false }))}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE VISTORIA (Substitui window.confirm)*/}
      {/* ========================================================= */}
      <Modal show={modalConfirmVistoria} onHide={() => setModalConfirmVistoria(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title className="fs-6 fw-bold">⚠️ Confirmar Vistoria</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-0">Deseja marcar esta máquina como <strong>Pronta para Vistoria</strong>? Os gestores serão imediatamente notificados.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setModalConfirmVistoria(false)}>
            Cancelar
          </Button>
          <Button variant="warning" size="sm" onClick={handleProntaParaVistoria} className="fw-bold">
            Sim, Marcar como Pronta
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL DE DEVOLUÇÃO DE PEÇA (Substitui o window.prompt)     */}
      {/* ========================================================= */}
      <Modal show={modalDevolucao.show} onHide={() => setModalDevolucao({ show: false, itemId: null, nomeItem: '' })} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-6 fw-bold">↩️ Devolver Peça com Defeito</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="small text-muted mb-2">Informe o defeito apresentado pela peça: <strong>{modalDevolucao.nomeItem}</strong></p>
          <Form.Group>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Descreva o motivo da devolução..." 
              value={motivoDefeito}
              onChange={(e) => setMotivoDefeito(e.target.value)}
              className="bg-light"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setModalDevolucao({ show: false, itemId: null, nomeItem: '' })}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={confirmarDevolucaoPeca} disabled={!motivoDefeito.trim()}>
            Confirmar Devolução
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SolicitacaoItem;