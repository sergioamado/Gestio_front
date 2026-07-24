// src/components/patrimonio/BemForm.tsx
import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { UpcScan, PcDisplay, Tags, GeoAlt, Activity, Building } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';
import type { BemPatrimonial, Unidade } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface BemFormProps {
  bem?: BemPatrimonial | null;
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function BemForm({ bem, unidades, onSubmit, isLoading }: BemFormProps) {
  const { mostrarCard } = useToast();
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
    
    // 🚀 Validação extra usando o nosso Toast antes de enviar para o Pai
    if (formData.tombamento.length < 3) {
      mostrarCard('Aviso', 'O número de tombamento parece ser demasiado curto.', 'alerta');
      return;
    }

    if (!formData.unidade_id) {
      mostrarCard('Aviso', 'Por favor, selecione uma unidade organizacional.', 'alerta');
      return;
    }

    onSubmit({
      ...formData,
      unidade_id: Number(formData.unidade_id)
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="px-2">
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <UpcScan className="me-1 mb-1" /> Tombamento *
            </Form.Label>
            <Form.Control 
              name="tombamento" 
              value={formData.tombamento} 
              onChange={handleChange} 
              required 
              disabled={!!bem} 
              placeholder="Ex: 0000123456" 
              className="bg-light border-0 shadow-none py-2"
            />
          </Form.Group>
        </Col>
        
        <Col md={8}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <PcDisplay className="me-1 mb-1" /> Descrição do Bem *
            </Form.Label>
            <Form.Control 
              name="descricao" 
              value={formData.descricao} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Computador Desktop Intel Core i5..." 
              className="bg-light border-0 shadow-none py-2"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Tags className="me-1 mb-1" /> Marca
            </Form.Label>
            <Form.Control 
              name="marca" 
              value={formData.marca} 
              onChange={handleChange} 
              placeholder="Ex: Dell, HP, Samsung" 
              className="bg-light border-0 shadow-none py-2"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <GeoAlt className="me-1 mb-1" /> Localização Física *
            </Form.Label>
            <Form.Control 
              name="localizacao_fisica" 
              value={formData.localizacao_fisica} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Laboratório 01" 
              className="bg-light border-0 shadow-none py-2"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Activity className="me-1 mb-1" /> Status
            </Form.Label>
            <Form.Select 
              name="status_atual" 
              value={formData.status_atual} 
              onChange={handleChange} 
              required
              className="bg-light border-0 shadow-none py-2 fw-medium"
            >
              <option value="Ativo">✅ Ativo</option>
              <option value="Inservivel">❌ Inservível</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">
              <Building className="me-1 mb-1" /> Unidade *
            </Form.Label>
            <Form.Select 
              name="unidade_id" 
              value={formData.unidade_id} 
              onChange={handleChange} 
              required
              className="bg-light border-0 shadow-none py-2 fw-medium"
            >
              <option value="">Selecione...</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end border-top pt-4 mt-2">
        <PrimaryButton type="submit" isLoading={isLoading} className="px-4 fw-bold shadow-sm">
          {bem ? '💾 Guardar Alterações' : '🚀 Cadastrar Equipamento'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default BemForm;