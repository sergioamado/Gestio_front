// src/components/SolicitacaoDetalhesModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner, Alert, ListGroup, Form } from 'react-bootstrap';
import { getSolicitacaoById, updateSolicitacaoStatus, updateSolicitacaoItemStatus } from '../services/solicitacaoService';
import type { SolicitacaoDetalhada } from '../types/index';

interface Props {
  show: boolean;
  handleClose: () => void;
  solicitacaoId: number | null;
  onUpdate: () => void; // Para recarregar a lista principal
}

const SolicitacaoDetalhesModal: React.FC<Props> = ({ show, handleClose, solicitacaoId, onUpdate }) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (solicitacaoId) {
      setLoading(true);
      getSolicitacaoById(solicitacaoId)
        .then(setSolicitacao)
        .catch(() => setError('Falha ao carregar detalhes.'))
        .finally(() => setLoading(false));
    }
  }, [solicitacaoId, show]);
  
  const handleStatusChange = async (novoStatus: string) => {
    if (!solicitacao) return;
    await updateSolicitacaoStatus(solicitacao.id, novoStatus);
    onUpdate();
    handleClose();
  };
  
  const handleItemStatusToggle = async (itemId: number, statusAtual: 'Pendente' | 'Entregue') => {
    const novoStatus = statusAtual === 'Pendente' ? 'Entregue' : 'Pendente';
    await updateSolicitacaoItemStatus(itemId, novoStatus);
    // Recarrega os detalhes dentro do modal para refletir a mudança
    getSolicitacaoById(solicitacaoId!).then(setSolicitacao);
    onUpdate();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Solicitação #{solicitacaoId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {solicitacao && (
          <>
            <h5>Itens Solicitados</h5>
            <ListGroup>
              {solicitacao.solicitacao_itens.map(item => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    {item.itens.descricao} - <strong>Qtd: {item.quantidade_solicitada}</strong>
                  </div>
                  <Form.Check 
                    type="switch"
                    id={`item-${item.id}`}
                    label={item.status_entrega}
                    checked={item.status_entrega === 'Entregue'}
                    onChange={() => handleItemStatusToggle(item.id, item.status_entrega)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
            <hr />
            <h5>Alterar Status Geral</h5>
            <div className="d-flex gap-2">
                <Button size="sm" variant="primary" onClick={() => handleStatusChange('Em atendimento')}>Em Atendimento</Button>
                <Button size="sm" variant="success" onClick={() => handleStatusChange('Concluída')}>Concluída</Button>
                <Button size="sm" variant="danger" onClick={() => handleStatusChange('Cancelada')}>Cancelada</Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SolicitacaoDetalhesModal;