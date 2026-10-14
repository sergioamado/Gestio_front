// src/components/suprimentos/ReportarErroModal.tsx
import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface ReportarErroModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (mensagemCompleta: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReportarErroModal({ show, onHide, onSubmit, isSubmitting }: ReportarErroModalProps) {
  const [corReporte, setCorReporte] = useState('');
  const [mensagemReporte, setMensagemReporte] = useState('');

  const handleSubmit = async () => {
    if (!mensagemReporte.trim()) return;
    
    const payload = corReporte ? `[Suprimento: ${corReporte}] ${mensagemReporte}` : mensagemReporte;
    await onSubmit(payload);

    setMensagemReporte('');
    setCorReporte('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title className="fs-6 fw-bold">⚠️ Reportar Inconsistência de Estoque</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <p className="small text-muted mb-3">
          Informe a divergência entre a quantidade física no armário e o saldo do sistema. O gestor receberá este aviso.
        </p>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-secondary">Suprimento / Cor (Opcional)</Form.Label>
          <Form.Select value={corReporte} onChange={(e) => setCorReporte(e.target.value)}>
            <option value="">Selecione se aplicável...</option>
            {/* 🚀 Unidade de Imagem inserida aqui também! */}
            <option value="Unidade de Imagem">Unidade de Imagem</option>
            <option value="Preto">Toner Preto</option>
            <option value="Ciano">Toner Ciano</option>
            <option value="Magenta">Toner Magenta</option>
            <option value="Amarelo">Toner Amarelo</option>
            <option value="Kit Manutenção">Kit Manutenção</option>
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label className="small fw-bold text-secondary">Descrição da Divergência</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Ex: No sistema constam 5 unidades, porém restam apenas 2."
            value={mensagemReporte}
            onChange={(e) => setMensagemReporte(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" size="sm" onClick={handleSubmit} disabled={isSubmitting || !mensagemReporte.trim()}>
          {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}