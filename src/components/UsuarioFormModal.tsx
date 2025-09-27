// src/components/UsuarioFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import {createUsuario, updateUsuario } from '../services/usuarioService';
import type { Usuario, UsuarioCreateData, UsuarioUpdateData } from '../types/index';

interface UsuarioFormModalProps {
  show: boolean;
  handleClose: () => void;
  onSuccess: () => void;
  currentUser: Usuario | null;
  // Para preencher o select de unidades, precisaremos passá-las como prop
  // unidades: { id: number; nome: string }[]; 
}

const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({ show, handleClose, onSuccess, currentUser }) => {
  const initialFormData = {
    username: '',
    nome_completo: '',
    role: 'tecnico' as const, // Valor padrão
    unidade_id: null,
    password: '',
    telefone: '',
    email: '',
  };

  const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
      if (currentUser) {
      setFormData({ ...currentUser, password: '' });
    } else {
       setFormData({
          username: '',
          nome_completo: '',
          role: 'tecnico' as const,
          unidade_id: null,
          password: '',
          telefone: '',
          email: '',
        });
      }
    }, [currentUser, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Na edição, não enviamos username ou senha
        const { ...updateData } = formData;
        delete updateData.username;
        delete updateData.password;
        await updateUsuario(currentUser.id, updateData as UsuarioUpdateData);
      } else {
        await createUsuario(formData as UsuarioCreateData);
      }
      onSuccess();
    } catch (error) {
      console.error('Falha ao salvar usuário', error);
      alert('Não foi possível salvar o usuário. Verifique se o username já existe.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{currentUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nome Completo</Form.Label>
                <Form.Control type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nome de Usuário (para login)</Form.Label>
                <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!currentUser} />
              </Form.Group>
               {/* Campo de Senha só aparece e é obrigatório na criação */}
              {!currentUser && (
                <Form.Group className="mb-3">
                  <Form.Label>Senha Provisória</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
                </Form.Group>
              )}
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Perfil</Form.Label>
                <Form.Select name="role" value={formData.role} onChange={handleChange}>
                  <option value="tecnico">Técnico</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              {/* O campo de Unidade só aparece para gerentes e técnicos */}
              {formData.role !== 'admin' && (
                <Form.Group className="mb-3">
                  <Form.Label>Unidade Organizacional</Form.Label>
                  <Form.Control type="number" name="unidade_id" value={formData.unidade_id || ''} onChange={handleChange} placeholder="ID da Unidade" required />
                  {/* Idealmente, isso seria um <Form.Select> preenchido com as unidades */}
                </Form.Group>
              )}
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

export default UsuarioFormModal;