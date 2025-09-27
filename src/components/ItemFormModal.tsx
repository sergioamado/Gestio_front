// src/components/ItemFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { createItem, updateItem } from '../services/itemService';
import type { Item, ItemCreateData, ItemUpdateData } from '../types/index';
import { useAuth } from '../hooks/useAuth';

interface ItemFormModalProps {
  show: boolean;
  handleClose: () => void;
  onSuccess: () => void;
  currentItem: Item | null;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ show, handleClose, onSuccess, currentItem }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    descricao: '',
    codigo_sipac: '',
    pregao: '',
    tipo: '',
    unidade_medida: 'UND',
    localizacao: '',
    quantidade: 0,
    preco_unitario: 0,
    unidade_id: user?.unidade_id || 0, 
  });

  useEffect(() => {
    if (currentItem) {
      setFormData(currentItem);
    } else {
      // Reseta o formulário para um novo item
      setFormData({
        descricao: '',
        codigo_sipac: '',
        pregao: '',
        tipo: '',
        unidade_medida: 'UND',
        localizacao: '',
        quantidade: 0,
        preco_unitario: 0,
        unidade_id: user?.unidade_id || 0,
      });
    }
  }, [currentItem, show,  user?.unidade_id ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await updateItem(currentItem.id, formData as ItemUpdateData);
      } else {
        await createItem(formData as ItemCreateData);
      }
      onSuccess();
    } catch (error) {
      console.error('Falha ao salvar o item', error);
      alert('Não foi possível salvar o item. Verifique os dados e tente novamente.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{currentItem ? 'Editar Item' : 'Adicionar Novo Item'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control as="textarea" rows={3} name="descricao" value={formData.descricao} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Código SIPAC</Form.Label>
                <Form.Control type="text" name="codigo_sipac" value={formData.codigo_sipac || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Pregão</Form.Label>
                <Form.Control type="text" name="pregao" value={formData.pregao || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Control type="text" name="tipo" value={formData.tipo || ''} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Localização</Form.Label>
                <Form.Control type="text" name="localizacao" value={formData.localizacao || ''} onChange={handleChange} />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantidade</Form.Label>
                    <Form.Control type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} min={0} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Preço Unitário (R$)</Form.Label>
                    <Form.Control type="number" step="0.01" name="preco_unitario" value={formData.preco_unitario} onChange={handleChange} min={0} required />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ItemFormModal;