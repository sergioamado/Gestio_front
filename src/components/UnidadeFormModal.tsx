// src/components/UnidadeFormModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createUnidade, updateUnidade } from '../services/unidadeService';
import type { Unidade, UnidadeCreateData, UnidadeUpdateData } from '../types/index';

interface UnidadeFormModalProps {
  show: boolean;
  handleClose: () => void;
  onSuccess: () => void;
  currentUnidade: Unidade | null;
}

const UnidadeFormModal: React.FC<UnidadeFormModalProps> = ({ show, handleClose, onSuccess, currentUnidade }) => {
  // Usar useCallback para garantir que a referência da função/objeto seja estável
  const getInitialFormData = useCallback(() => ({ nome: '', sigla: '', campus: '' }), []);
  
  const [formData, setFormData] = useState<Omit<Unidade, 'id'>>(getInitialFormData());

  useEffect(() => {
    if (show) { // Reseta o formulário sempre que o modal abre
        if (currentUnidade) {
            setFormData({
                nome: currentUnidade.nome,
                sigla: currentUnidade.sigla,
                campus: currentUnidade.campus,
            });
        } else {
            setFormData(getInitialFormData());
        }
    }
  }, [currentUnidade, show, getInitialFormData]); // Adicionada a dependência que faltava

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUnidade) {
        await updateUnidade(currentUnidade.id, formData as UnidadeUpdateData);
      } else {
        await createUnidade(formData as UnidadeCreateData);
      }
      onSuccess();
    } catch (error) {
      console.error('Falha ao salvar unidade', error);
      alert('Não foi possível salvar a unidade. Verifique se o nome ou a sigla já existem.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{currentUnidade ? 'Editar Unidade' : 'Adicionar Nova Unidade'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nome da Unidade</Form.Label>
            <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sigla</Form.Label>
            <Form.Control type="text" name="sigla" value={formData.sigla || ''} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Campus</Form.Label>
            <Form.Control type="text" name="campus" value={formData.campus || ''} onChange={handleChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UnidadeFormModal;