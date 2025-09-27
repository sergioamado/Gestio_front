// src/pages/AlterarSenha.tsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { changeOwnPassword } from '../services/authService';
import { getAllUsuarios, resetPasswordByAdmin } from '../services/usuarioService';
import type { Usuario } from '../types';

// Componente para Técnicos e Gerentes
const UserChangeOwnPassword = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('A nova senha e a confirmação não são iguais.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await changeOwnPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess('Senha alterada com sucesso!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Limpa o formulário
    } catch (err: unknown) { // Tipo 'unknown' é mais seguro que 'any'
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Falha ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header as="h5">Alterar Minha Senha</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Senha Atual</Form.Label>
            <Form.Control type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nova Senha</Form.Label>
            <Form.Control type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required minLength={6} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirmar Nova Senha</Form.Label>
            <Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </Form.Group>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Salvar Nova Senha'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// Componente para Administradores
const AdminPasswordReset = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllUsuarios().then(setUsuarios);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsername) {
        setError('Por favor, selecione um usuário.');
        return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await resetPasswordByAdmin(selectedUsername, newPassword);
      setSuccess(`Senha do usuário '${selectedUsername}' alterada com sucesso!`);
      setNewPassword(''); // Limpa o campo de senha
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-ignore
        setError((err as any).response?.data?.message || 'Falha ao alterar a senha.');
      } else {
        setError('Falha ao alterar a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header as="h5">Redefinir Senha de Usuário</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Selecione o Usuário</Form.Label>
            <Form.Select value={selectedUsername} onChange={e => setSelectedUsername(e.target.value)} required>
                <option value="">-- Escolha um usuário --</option>
                {usuarios.map(u => <option key={u.id} value={u.username}>{u.nome_completo} ({u.username})</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nova Senha Provisória</Form.Label>
            <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </Form.Group>
           <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Redefinir Senha'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// Componente principal que decide qual formulário renderizar
const AlterarSenha = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Segurança da Conta</h1>
      <hr />
      <Container className="mt-4" style={{ maxWidth: '800px' }}>
          {user?.role === 'admin' ? <AdminPasswordReset /> : <UserChangeOwnPassword />}
      </Container>
    </>
  );
};

export default AlterarSenha;