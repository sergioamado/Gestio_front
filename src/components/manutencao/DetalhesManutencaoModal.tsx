// src/components/manutencao/DetalhesManutencaoModal.tsx
import { useState } from 'react';
import { Modal, Button, ListGroup, Form, Alert } from 'react-bootstrap';
import  type { ManutencaoEletronica } from '../../types';
import PrimaryButton from '../PrimaryButton';
import * as manutencaoService from '../../services/manutencaoEletronicaService';
import { useAuth } from '../../hooks/useAuth';

interface DetalhesModalProps {
  show: boolean;
  onHide: () => void;
  manutencao: ManutencaoEletronica;
  onUpdate: () => void;
}

function DetalhesManutencaoModal({ show, onHide, manutencao, onUpdate }: DetalhesModalProps) {
  const { user } = useAuth();
  const [laudo, setLaudo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canFinalizar = manutencao.status === 'Em_manutencao' && manutencao.tecnico_responsavel_id === user?.id;

  const handleFinalizar = async () => {
    if (!laudo) {
      setError('O parecer técnico é obrigatório para finalizar.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await manutencaoService.finalizarManutencao(manutencao.id, laudo);
      onUpdate();
      onHide();
    } catch (err) {
      setError('Ocorreu um erro ao finalizar a manutenção.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCopy = () => {
    const summary = `[Resumo Manutenção Eletrônica]\nID: ${manutencao.id}\nGLPI: ${manutencao.glpi || 'N/A'}\nEquipamento: ${manutencao.equipamento}\nProblema: ${manutencao.descricao_problema}\nTécnico: ${manutencao.tecnico_responsavel?.nome_completo || 'N/A'}\nStatus: ${manutencao.status}\nParecer: ${manutencao.laudo_tecnico || laudo || ''}`;
    navigator.clipboard.writeText(summary);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Manutenção #{manutencao.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{manutencao.equipamento}</h4>
        <ListGroup variant="flush">
          <ListGroup.Item><strong>GLPI:</strong> {manutencao.glpi || 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>Data de Entrada:</strong> {new Date(manutencao.data_entrada).toLocaleString('pt-BR')}</ListGroup.Item>
          <ListGroup.Item><strong>Técnico Responsável:</strong> {manutencao.tecnico_responsavel?.nome_completo || 'Aguardando'}</ListGroup.Item>
          <ListGroup.Item><strong>Status:</strong> {manutencao.status.replace('_', ' ')}</ListGroup.Item>
          <ListGroup.Item>
            <strong>Descrição do Problema:</strong>
            <p className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{manutencao.descricao_problema}</p>
          </ListGroup.Item>

          {manutencao.status === 'Concluido' && (
            <ListGroup.Item>
              <strong>Parecer Técnico:</strong>
              <p className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{manutencao.laudo_tecnico}</p>
            </ListGroup.Item>
          )}
        </ListGroup>

        {canFinalizar && (
          <div className="mt-3">
            <hr />
            <h5>Finalizar Manutenção</h5>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group>
              <Form.Label>Parecer Técnico Final</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={laudo}
                onChange={(e) => setLaudo(e.target.value)}
                placeholder="Descreva o serviço realizado, peças trocadas, etc."
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCopy}>Copiar Resumo</Button>
        <Button variant="secondary" onClick={onHide}>Fechar</Button>
        {canFinalizar && (
          <PrimaryButton onClick={handleFinalizar} isLoading={isSubmitting}>
            Finalizar e Concluir
          </PrimaryButton>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DetalhesManutencaoModal;