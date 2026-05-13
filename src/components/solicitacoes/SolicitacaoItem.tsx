// src/components/solicitacoes/SolicitacaoItem.tsx
import { useState, useMemo } from 'react';
import { Accordion, Row, Col, Form, Badge, Stack, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Clipboard, TrashFill, ExclamationTriangleFill } from 'react-bootstrap-icons';
import type { SolicitacaoDetalhada, StatusSolicitacao } from '../../types';
import StatusBadge from './StatusBadge';
import PrimaryButton from '../PrimaryButton';
import * as solicitacaoService from '../../services/solicitacaoService';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface SolicitacaoItemProps {
  solicitacao: SolicitacaoDetalhada;
  onUpdate: () => void;
}

function SolicitacaoItem({ solicitacao, onUpdate }: SolicitacaoItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const [mensagemItem, setMensagemItem] = useState<{ tipo: string, texto: string } | null>(null);
  
  const [statusGeral, setStatusGeral] = useState<StatusSolicitacao>(solicitacao.status);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<StatusSolicitacao | null>(null);

  const [itemStatus, setItemStatus] = useState<Record<number, boolean>>(() =>
    solicitacao.solicitacao_itens.reduce((acc, item) => {
      acc[item.id] = item.status_entrega === 'Entregue';
      return acc;
    }, {} as Record<number, boolean>)
  );

  const hasChanges = useMemo(() => {
    if (statusGeral !== solicitacao.status) return true;
    for (const item of solicitacao.solicitacao_itens) {
      if ((item.status_entrega === 'Entregue') !== itemStatus[item.id]) {
        return true;
      }
    }
    return false;
  }, [statusGeral, itemStatus, solicitacao]);

  const handleItemCheckChange = (itemId: number, isChecked: boolean) => {
    setItemStatus(prev => ({ ...prev, [itemId]: isChecked }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatusSolicitacao;
    setPendingStatusChange(newStatus);
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    if (pendingStatusChange) {
      setStatusGeral(pendingStatusChange);
    }
    await handleSaveChanges(pendingStatusChange);
    setShowConfirmModal(false);
    setPendingStatusChange(null);
  };
  
  const handleSaveChanges = async (statusOverride?: StatusSolicitacao | null) => {
    setIsSubmitting(true);
    try {
      const finalStatus = statusOverride || statusGeral;
      if (finalStatus !== solicitacao.status) {
        await solicitacaoService.updateSolicitacaoStatus(solicitacao.id, finalStatus);
      }
      
      for (const item of solicitacao.solicitacao_itens) {
        const isChecked = itemStatus[item.id];
        const originalStatus = item.status_entrega === 'Entregue';
        if (isChecked !== originalStatus) {
          await solicitacaoService.updateSolicitacaoItemStatus(item.id, isChecked ? 'Entregue' : 'Pendente');
        }
      }
      onUpdate();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarItemUnico = async (itemId: number) => {
    if (!window.confirm("Deseja realmente cancelar O PEDIDO desta peça específica?")) return;
    setLoadingItemId(itemId);
    try {
      await solicitacaoService.cancelarItemSolicitacao(itemId);
      setMensagemItem({ tipo: 'success', texto: 'Item cancelado com sucesso.' });
      onUpdate();
    } catch (error) {
      setMensagemItem({ tipo: 'danger', texto: 'Erro ao cancelar o item.' });
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleSinalizarDefeito = async (itemId: number) => {
    if (!window.confirm("Deseja isolar esta peça como DEFEITUOSA no estoque?")) return;
    setLoadingItemId(itemId);
    try {
      await solicitacaoService.sinalizarDefeitoItem(itemId);
      setMensagemItem({ tipo: 'warning', texto: 'Peça marcada como defeituosa.' });
      onUpdate();
    } catch (error) {
      setMensagemItem({ tipo: 'danger', texto: 'Erro ao reportar defeito.' });
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleCopy = () => {
    const summary = `[Requisição Material]\nGLPI: ${solicitacao.numero_glpi || ''}\nPATRIMONIO: ${solicitacao.patrimonio || ''}\nSETOR: ${solicitacao.setor_equipamento || ''}`;
    navigator.clipboard.writeText(summary);
  };

  const nomeTecnico = (solicitacao as any).tecnico_responsavel || solicitacao.responsavel?.nome_completo || 'Técnico Não Identificado';

  const dataHoraSolicitacao = new Date(solicitacao.data_solicitacao).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      <Accordion.Item eventKey={String(solicitacao.id)} className="floating-card mb-3 border-0 shadow-sm overflow-hidden">
        <Accordion.Header className="bg-white">
          <Stack direction="horizontal" gap={3} className="w-100 me-2 align-items-center">
            <Badge bg="primary" className="px-3 py-2 rounded-pill fs-6">#{solicitacao.id}</Badge>
            
            <div className="d-flex flex-column">
              <span className="fw-bold text-dark">{nomeTecnico}</span>
              <span className="text-muted small">🕒 {dataHoraSolicitacao}</span>
            </div>
            
            <div className="ms-auto">
              <StatusBadge status={solicitacao.status} />
            </div>
          </Stack>
        </Accordion.Header>
        
        <Accordion.Body className="bg-light pt-4 px-4">
          
          {solicitacao.justificativa && (
            <div className="mb-4 p-3 bg-white rounded shadow-sm border-start border-warning border-4">
              <h6 className="fw-bold text-dark mb-2">📋 Justificativa Técnica:</h6>
              <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-line' }}>{solicitacao.justificativa}</p>
            </div>
          )}

          <Row className="mb-4 g-3">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e0f2fe' }}>
                <Card.Body className="text-center p-3">
                  <div className="small text-uppercase fw-bold mb-1" style={{ color: '#0284c7' }}>Nº GLPI</div>
                  <div className="fs-5 fw-bold text-dark">{solicitacao.numero_glpi || 'N/A'}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#f3e8ff' }}>
                <Card.Body className="text-center p-3">
                  <div className="small text-uppercase fw-bold mb-1" style={{ color: '#9333ea' }}>Patrimônio</div>
                  <div className="fs-5 fw-bold text-dark">{solicitacao.patrimonio || 'N/A'}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#ffedd5' }}>
                <Card.Body className="text-center p-3">
                  <div className="small text-uppercase fw-bold mb-1" style={{ color: '#ea580c' }}>Setor / Local</div>
                  <div className="fs-5 fw-bold text-dark">{solicitacao.setor_equipamento || 'N/A'}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <h6 className="fw-bold text-secondary text-uppercase mb-3">
            Gestão de Peças Solicitadas ({solicitacao.solicitacao_itens.length})
          </h6>

          {mensagemItem && (
            <Alert variant={mensagemItem.tipo} className="py-2 border-0 shadow-sm" dismissible onClose={() => setMensagemItem(null)}>
              {mensagemItem.texto}
            </Alert>
          )}

          <Card className="border-0 shadow-sm mb-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table mb-0 align-middle table-hover bg-white">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 ps-3">Peça / Material</th>
                    <th className="border-0 text-center">Quantidade</th>
                    <th className="border-0 text-center">Entrega</th>
                    <th className="border-0 text-end pe-3">Ações Individuais</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacao.solicitacao_itens.map(item => (
                    <tr key={item.id} className={(item.status_entrega as string) === 'Cancelado' ? 'opacity-50' : ''}>
                      <td className="ps-3 fw-medium text-dark">{item.itens?.descricao || 'Peça Indefinida'}</td>
                      <td className="text-center fw-bold text-primary">{item.quantidade_solicitada}</td>
                      
                      <td className="text-center">
                        {/* Correção do TypeScript usando "as string" */}
                        {(item.status_entrega as string) === 'Cancelado' ? (
                          <Badge bg="secondary">Cancelado</Badge>
                        ) : (item.status_entrega as string) === 'Defeito' ? (
                          <Badge bg="danger">Com Defeito</Badge>
                        ) : (
                          <Form.Check 
                            type="switch"
                            id={`item-${item.id}`}
                            label={itemStatus[item.id] ? <span className="text-success fw-bold small">Entregue</span> : <span className="text-muted small">Pendente</span>}
                            checked={itemStatus[item.id]}
                            onChange={(e) => handleItemCheckChange(item.id, e.target.checked)}
                            className="d-inline-block text-start"
                          />
                        )}
                      </td>

                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-2">
                          {/* Botão de Defeito */}
                          {itemStatus[item.id] && (item.status_entrega as string) !== 'Defeito' && (
                            <Button 
                              variant="outline-danger" size="sm" title="Reportar Defeito e Devolver"
                              onClick={() => handleSinalizarDefeito(item.id)}
                              disabled={loadingItemId === item.id}
                            >
                              {loadingItemId === item.id ? <Spinner size="sm" animation="border" /> : <ExclamationTriangleFill />}
                            </Button>
                          )}

                          {/* Botão de Cancelar */}
                          {!itemStatus[item.id] && (item.status_entrega as string) !== 'Cancelado' && (
                            <Button 
                              variant="outline-secondary" size="sm" title="Cancelar Pedido da Peça"
                              onClick={() => handleCancelarItemUnico(item.id)}
                              disabled={loadingItemId === item.id}
                            >
                              {loadingItemId === item.id ? <Spinner size="sm" animation="border" /> : <TrashFill />}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="d-flex flex-wrap gap-3 align-items-center bg-white p-3 rounded shadow-sm border-top border-3 border-primary">
            <div className="fw-bold me-2 text-dark">Status da OS:</div>
            <Form.Select 
              style={{ maxWidth: '220px' }} 
              className="fw-bold bg-light border-0"
              value={solicitacao.status.toUpperCase()} 
              onChange={handleStatusChange}
            >
                <option value="PENDENTE">⏳ Pendente</option>
                <option value="EM ATENDIMENTO">🛠️ Em Atendimento</option>
                <option value="CONCLUIDA">✅ Concluída</option>
                <option value="CANCELADA">❌ Cancelada</option>
            </Form.Select>
            
            <PrimaryButton 
              onClick={() => handleSaveChanges()} 
              disabled={!hasChanges || isSubmitting} 
              isLoading={isSubmitting}
            >
              💾 Salvar Alterações Gerais
            </PrimaryButton>
            
            <Button variant="light" onClick={handleCopy} className="ms-auto border shadow-sm fw-medium text-muted">
              <Clipboard className="me-2" /> Copiar Resumo
            </Button>
          </div>
        </Accordion.Body>
      </Accordion.Item>

      <DeleteConfirmationModal
        show={showConfirmModal}
        onHide={() => { setShowConfirmModal(false); setPendingStatusChange(null); }}
        onConfirm={confirmUpdate}
        title="Confirmar Alteração"
        body={`Tem certeza que deseja mudar o status desta Ordem de Serviço para "${pendingStatusChange}"?`}
        isDeleting={isSubmitting}
        confirmButtonText="Sim, Alterar"
        confirmButtonVariant="primary"
      />
    </>
  );
}

export default SolicitacaoItem;