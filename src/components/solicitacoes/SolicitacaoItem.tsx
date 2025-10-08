// src/components/solicitacoes/SolicitacaoItem.tsx
import { useState, useMemo } from 'react';
import { Accordion, Row, Col, Form, Badge, Stack, ListGroup, Card, Button } from 'react-bootstrap';
import { Clipboard } from 'react-bootstrap-icons';
import type { SolicitacaoDetalhada, StatusSolicitacao } from '../../types';
import StatusBadge from './StatusBadge';
import PrimaryButton from '../PrimaryButton';
import * as solicitacaoService from '../../services/solicitacaoService';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface SolicitacaoItemProps {
  solicitacao: SolicitacaoDetalhada;
  onUpdate: () => void; // Função para recarregar a lista principal
}

function SolicitacaoItem({ solicitacao, onUpdate }: SolicitacaoItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusGeral, setStatusGeral] = useState<StatusSolicitacao>(solicitacao.status);

  const [itemStatus, setItemStatus] = useState<Record<number, boolean>>(() =>
    solicitacao.solicitacao_itens.reduce((acc, item) => {
      acc[item.id] = item.status_entrega === 'Entregue';
      return acc;
    }, {} as Record<number, boolean>)
  );
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<StatusSolicitacao | null>(null);


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

  const handleCopy = () => {
    const summary = `[Requisição Material]\nGLPI: ${solicitacao.numero_glpi || ''}\nPATRIMONIO: ${solicitacao.patrimonio || ''}\nSETOR: ${solicitacao.setor_equipamento || ''}`;
    navigator.clipboard.writeText(summary);
  };

  return (
    <>
      {/* CORRIGIDO: Adicionada a classe para o zebrado */}
      <Accordion.Item eventKey={String(solicitacao.id)} className="floating-card mb-3 accordion-item-striped">
        <Accordion.Header>
          <Stack direction="horizontal" gap={3} className="w-100 me-2">
            <Badge bg="dark" pill>#{solicitacao.id}</Badge>
            <span className="fw-bold">{solicitacao.responsavel?.nome_completo || 'N/A'}</span>
            <span className="text-muted d-none d-md-block">{new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR')}</span>
            <div className="ms-auto">
              <StatusBadge status={solicitacao.status} />
            </div>
          </Stack>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="mb-3 g-3">
            <Col md={4}><Card body className="text-center info-card info-card-glpi"><strong>GLPI</strong><br/>{solicitacao.numero_glpi || 'N/A'}</Card></Col>
            <Col md={4}><Card body className="text-center info-card info-card-patrimonio"><strong>Patrimônio</strong><br/>{solicitacao.patrimonio || 'N/A'}</Card></Col>
            <Col md={4}><Card body className="text-center info-card info-card-setor"><strong>Setor</strong><br/>{solicitacao.setor_equipamento || 'N/A'}</Card></Col>
          </Row>
          
          <h6>Itens Solicitados</h6>
          <ListGroup variant="flush" className="mb-4">
            {solicitacao.solicitacao_itens.map(item => (
              <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center ps-0">
                <span>{item.itens.descricao} (Qtd: {item.quantidade_solicitada})</span>
                <Form.Check 
                  type="switch"
                  id={`item-${item.id}`}
                  label="Entregue"
                  checked={itemStatus[item.id]}
                  onChange={(e) => handleItemCheckChange(item.id, e.target.checked)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>

          <h6>Ações</h6>
          <div className="actions-toolbar">
            <Form.Select style={{ maxWidth: '200px' }} value={solicitacao.status} onChange={handleStatusChange}>
                <option value="Pendente">Pendente</option>
                <option value="Em atendimento">Em atendimento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
            </Form.Select>
            <PrimaryButton onClick={() => handleSaveChanges()} disabled={!hasChanges || isSubmitting} isLoading={isSubmitting}>
              Salvar Itens
            </PrimaryButton>
            <Button variant="outline-secondary" onClick={handleCopy} className="ms-auto">
              <Clipboard className="me-2" /> Copiar
            </Button>
          </div>
        </Accordion.Body>
      </Accordion.Item>

      <DeleteConfirmationModal
        show={showConfirmModal}
        onHide={() => { setShowConfirmModal(false); setPendingStatusChange(null); }}
        onConfirm={confirmUpdate}
        title="Confirmar Alteração de Status"
        body={`Tem certeza que deseja alterar o status da solicitação #${solicitacao.id} para "${pendingStatusChange}"?`}
        isDeleting={isSubmitting}
      />
    </>
  );
}

export default SolicitacaoItem;