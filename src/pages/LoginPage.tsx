// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Alert } from 'react-bootstrap';
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
    // Passamos o tema 'dark' para o Footer dentro do AuthLayout
    <AuthLayout>
        <Row className="justify-content-center w-100">
            <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0">
                <Card.Body className="p-4 p-sm-5">
                <div className="text-center mb-4">
                    <img
                    src={ufsLogo}
                    alt="Logo UFS"
                    style={{ height: '70px', marginBottom: '1rem' }}
                    />
                    <h3>SGA</h3>
                    <h5 className="text-muted">Sistema de Gestão Almoxarifado</h5>
                    <h6 className="text-muted">Login</h6>
                </div>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Usuário</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Digite seu usuário"
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
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    </Form.Group>
                    <div className="d-grid mt-4">
                    <PrimaryButton
                        type="submit"
                        isLoading={isSubmitting}
                        size="lg"
                    >
                        Entrar
                    </PrimaryButton>
                    </div>
                </Form>
                </Card.Body>
            </Card>
            </Col>
        </Row>
    </AuthLayout>
  );
}

export default LoginPage;