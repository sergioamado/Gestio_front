// src/components/solicitacoes/SolicitacaoItem.tsx
import { useState, useMemo } from 'react';
import { Accordion, Row, Col, Form, Badge, Stack, Card, Button, Spinner } from 'react-bootstrap';
import { Clipboard, TrashFill, ExclamationTriangleFill } from 'react-bootstrap-icons';
import type { SolicitacaoDetalhada, StatusSolicitacao } from '../../types';
import StatusBadge from './StatusBadge';
import PrimaryButton from '../PrimaryButton';
import * as solicitacaoService from '../../services/solicitacaoService';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';

interface SolicitacaoItemProps {
  solicitacao: SolicitacaoDetalhada;
  onUpdate: () => void;
}

function SolicitacaoItem({ solicitacao, onUpdate }: SolicitacaoItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  
  const [statusGeral, setStatusGeral] = useState<StatusSolicitacao>(solicitacao.status);
  
  // 🚀 INICIALIZAÇÃO DOS NOSSOS MOTORES DE UI
  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();

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

  // 🚀 NOVA LÓGICA DE MUDANÇA DE STATUS: Mais direta e sem estado extra
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatusSolicitacao;
    
    const confirmou = await confirmar({
      titulo: '🔄 Confirmar Alteração',
      mensagem: `Tem certeza que deseja mudar o status desta Ordem de Serviço para "${newStatus}"?`,
      textoConfirmar: 'Sim, Alterar',
      textoCancelar: 'Cancelar',
      varianteBotao: 'primary'
    });

    if (confirmou) {
      setStatusGeral(newStatus);
      await handleSaveChanges(newStatus);
    }
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
      mostrarCard('Sucesso!', 'As alterações na OS foram salvas.', 'sucesso');
      onUpdate();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      mostrarCard('Erro', 'Falha ao salvar as alterações. Tente novamente.', 'erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarItemUnico = async (itemId: number) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Cancelar Pedido da Peça',
      mensagem: 'Deseja realmente cancelar O PEDIDO desta peça específica?',
      textoConfirmar: 'Sim, Cancelar',
      textoCancelar: 'Não',
      varianteBotao: 'danger'
    });

    if (!confirmou) return;

    setLoadingItemId(itemId);
    try {
      await solicitacaoService.cancelarItemSolicitacao(itemId);
      mostrarCard('Peça Cancelada', 'O item foi cancelado com sucesso.', 'sucesso');
      onUpdate();
    } catch (error) {
      mostrarCard('Erro', 'Falha ao cancelar o item.', 'erro');
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleSinalizarDefeito = async (itemId: number) => {
    const confirmou = await confirmar({
      titulo: '⚠️ Sinalizar Defeito',
      mensagem: 'Deseja isolar esta peça como DEFEITUOSA no estoque?',
      textoConfirmar: 'Sim, Reportar',
      textoCancelar: 'Cancelar',
      varianteBotao: 'warning'
    });

    if (!confirmou) return;

    setLoadingItemId(itemId);
    try {
      await solicitacaoService.sinalizarDefeitoItem(itemId);
      mostrarCard('Defeito Registado', 'A peça foi marcada como defeituosa.', 'alerta');
      onUpdate();
    } catch (error) {
      mostrarCard('Erro', 'Falha ao reportar o defeito da peça.', 'erro');
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleCopy = () => {
    const summary = `[Requisição Material]\nGLPI: ${solicitacao.numero_glpi || ''}\nPATRIMONIO: ${solicitacao.patrimonio || ''}\nSETOR: ${solicitacao.setor_equipamento || ''}`;
    navigator.clipboard.writeText(summary);
    mostrarCard('Copiado', 'Resumo copiado para a área de transferência.', 'info');
  };

  const nomeTecnico = (solicitacao as any).tecnico_responsavel || solicitacao.responsavel?.nome_completo || 'Técnico Não Identificado';

  const dataHoraSolicitacao = new Date(solicitacao.data_solicitacao).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
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
                        {itemStatus[item.id] && (item.status_entrega as string) !== 'Defeito' && (
                          <Button 
                            variant="outline-danger" size="sm" title="Reportar Defeito e Devolver"
                            onClick={() => handleSinalizarDefeito(item.id)}
                            disabled={loadingItemId === item.id}
                          >
                            {loadingItemId === item.id ? <Spinner size="sm" animation="border" /> : <ExclamationTriangleFill />}
                          </Button>
                        )}

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
  );
}

export default SolicitacaoItem;