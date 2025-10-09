// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Alert, Stack } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import PrimaryButton from '../components/PrimaryButton';
import ufsLogo from '../assets/ufs-logo.svg';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
        <Row className="justify-content-center w-100">
            <Col md={8} lg={6} xl={4}>
            <Card className="floating-card">
                <Card.Body className="p-4 p-sm-5">
                  <Stack gap={4}>
                    <div className="text-center">
                      <img
                        src={ufsLogo}
                        alt="Logo UFS"
                        style={{ height: '60px', marginBottom: '0.5rem' }}
                      />
                      <h2 className="fw-bold mb-1">Gestio</h2>
                      <p className="text-muted">Sistema de Gestão de Almoxarifado</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="formUsername">
                          <Form.Label>Utilizador</Form.Label>
                          <Form.Control
                              type="text"
                              placeholder="Digite o seu utilizador"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              required
                              disabled={isSubmitting}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPassword">
                          <Form.Label>Senha</Form.Label>
                          <Form.Control
                              type="password"
                              placeholder="Digite a sua senha"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              disabled={isSubmitting}
                          />
                        </Form.Group>
                        <div className="d-grid">
                          <PrimaryButton
                              type="submit"
                              isLoading={isSubmitting}
                              size="lg"
                          >
                              Entrar
                          </PrimaryButton>
                        </div>
                    </Form>
                  </Stack>
                </Card.Body>
            </Card>
            </Col>
        </Row>
    </AuthLayout>
  );
}

export default LoginPage;