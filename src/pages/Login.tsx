// src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
// Importe aqui a logo, se desejar
// import logo from '../assets/logo_ufs.png'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // O redirecionamento agora é feito dentro do próprio AuthContext
    } catch (err) {
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Falha no login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body className="p-4">
          {/* <img src={logo} alt="Logo" style={{ display: 'block', margin: '0 auto 20px auto', width: '150px' }} /> */}
          <h2 className="text-center mb-4">Gestio</h2>
          <p className="text-center text-muted mb-4">Acesse sua conta</p>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group id="username">
              <Form.Label>Usuário</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: fulano.silva"
              />
            </Form.Group>
            
            <Form.Group id="password" className="mt-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </Form.Group>
            
            <Button disabled={loading} className="w-100 mt-4" type="submit">
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;