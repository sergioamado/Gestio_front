// src/components/suprimentos/CorrecaoEstoqueModal.tsx
import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface CorrecaoEstoqueModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: { cor: string; novaQuantidade: number; justificativa: string }) => Promise<void>;
  isSubmitting: boolean;
}

export default function CorrecaoEstoqueModal({ show, onHide, onSubmit, isSubmitting }: CorrecaoEstoqueModalProps) {
  const [corCorrecao, setCorCorrecao] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState<number | ''>('');
  const [justificativaCorrecao, setJustificativaCorrecao] = useState('');

  const handleSubmit = async () => {
    if (!corCorrecao || novaQuantidade === '' || !justificativaCorrecao.trim()) return;
    
    await onSubmit({
      cor: corCorrecao,
      novaQuantidade: Number(novaQuantidade),
      justificativa: justificativaCorrecao
    });

    // Limpa os campos após sucesso
    setCorCorrecao('');
    setNovaQuantidade('');
    setJustificativaCorrecao('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title className="fs-6 fw-bold">✏️ Ajuste Manual de Estoque</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-secondary">Suprimento / Cor</Form.Label>
          <Form.Select value={corCorrecao} onChange={(e) => setCorCorrecao(e.target.value)}>
            <option value="">Selecione o suprimento...</option>
            {/* 🚀 Valores exatos que o Backend espera! */}
            <option value="unidade_imagem">Unidade de Imagem</option>
            <option value="preto">Toner Preto</option>
            <option value="ciano">Toner Ciano</option>
            <option value="magenta">Toner Magenta</option>
            <option value="amarelo">Toner Amarelo</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-secondary">Nova Quantidade Real Total</Form.Label>
          <Form.Control 
            type="number" 
            min="0"
            placeholder="Ex: 4"
            value={novaQuantidade}
            onChange={(e) => setNovaQuantidade(e.target.value ? Number(e.target.value) : '')}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="small fw-bold text-secondary">Justificativa da Alteração</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3}
            placeholder="Ex: Contagem física refeita."
            value={justificativaCorrecao}
            onChange={(e) => setJustificativaCorrecao(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={onHide}>Cancelar</Button>
        <Button 
          variant="warning" 
          size="sm" 
          className="fw-bold" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !corCorrecao || novaQuantidade === '' || !justificativaCorrecao.trim()}
        >
          {isSubmitting ? 'Salvando...' : 'Confirmar Ajuste'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}