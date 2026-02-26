// src/components/atendimentos/AtendimentoDetailsModal.tsx
import { Modal, ListGroup, Badge } from 'react-bootstrap';
import type { AtendimentoImpressora } from '../../types';
import { statusMap } from './AtendimentosTable';

interface AtendimentoDetailsModalProps {
  show: boolean;
  onHide: () => void;
  atendimento: AtendimentoImpressora | null;
}

const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Não informado';
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(dateString));
};

function AtendimentoDetailsModal({ show, onHide, atendimento }: AtendimentoDetailsModalProps) {
  if (!atendimento) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Atendimento (GLPI: {atendimento.numero_glpi})</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4><Badge bg={statusMap[atendimento.status]?.variant || 'secondary'}>{statusMap[atendimento.status]?.text}</Badge></h4>
        <hr />
        <ListGroup variant="flush">
          <ListGroup.Item><strong>Impressora:</strong> {atendimento.impressora?.nome} ({atendimento.impressora?.modelo})</ListGroup.Item>
          <ListGroup.Item><strong>Setor:</strong> {atendimento.impressora?.localizacao}</ListGroup.Item>
          <ListGroup.Item><strong>Técnico Responsável (COSUP):</strong> {atendimento.tecnico_responsavel?.nome_completo}</ListGroup.Item>
          <ListGroup.Item><strong>Data de Abertura:</strong> {formatDate(atendimento.data)}</ListGroup.Item>
          <ListGroup.Item><strong>Parecer Técnico:</strong> {atendimento.parecer_tecnico || 'Não informado'}</ListGroup.Item>
          <ListGroup.Item><strong>Parecer Final da Assistência:</strong> {atendimento.parecer_final_assistencia || 'Não informado'}</ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}

export default AtendimentoDetailsModal;