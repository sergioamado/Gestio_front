// src/components/patrimonio/BemForm.tsx
import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import PrimaryButton from '../PrimaryButton';
import type { BemPatrimonial, Unidade } from '../../types';

interface BemFormProps {
  bem?: BemPatrimonial | null;
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function BemForm({ bem, unidades, onSubmit, isLoading }: BemFormProps) {
  const [formData, setFormData] = useState({
    tombamento: '',
    descricao: '',
    marca: '',
    localizacao_fisica: '',
    status_atual: 'Ativo',
    unidade_id: ''
  });

  
  useEffect(() => {
    if (bem) {
      setFormData({
        tombamento: bem.tombamento,
        descricao: bem.descricao,
        marca: bem.marca || '',
        localizacao_fisica: bem.localizacao_fisica,
        status_atual: bem.status_atual,
        unidade_id: String(bem.unidade_id)
      });
    }
  }, [bem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      unidade_id: Number(formData.unidade_id)
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Tombamento *</Form.Label>
            <Form.Control name="tombamento" value={formData.tombamento} onChange={handleChange} required disabled={!!bem} placeholder="Ex: 0000123456" />
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Descrição do Bem *</Form.Label>
            <Form.Control name="descricao" value={formData.descricao} onChange={handleChange} required placeholder="Ex: Computador Desktop Intel Core i5..." />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Marca</Form.Label>
            <Form.Control name="marca" value={formData.marca} onChange={handleChange} placeholder="Ex: Dell, HP, Samsung" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Localização Física *</Form.Label>
            <Form.Control name="localizacao_fisica" value={formData.localizacao_fisica} onChange={handleChange} required placeholder="Ex: Laboratório 01" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Status</Form.Label>
            <Form.Select name="status_atual" value={formData.status_atual} onChange={handleChange} required>
              <option value="Ativo">✅ Ativo</option>
              <option value="Inservivel">❌ Inservível</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary">Unidade *</Form.Label>
            <Form.Select name="unidade_id" value={formData.unidade_id} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end border-top pt-3">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {bem ? 'Guardar Alterações' : 'Cadastrar Equipamento'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default BemForm;