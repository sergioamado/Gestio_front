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
      setError(err.message || 'Credenciais inválidas ou erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
        <Row className="justify-content-center w-100">
            <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                <Card.Body className="p-4 p-sm-5">
                <div className="text-center mb-4 pb-3 border-bottom">
                    <img
                    src={ufsLogo}
                    alt="Logo UFS"
                    style={{ height: '70px', marginBottom: '1.5rem' }}
                    />
                    <h3 className="cosup-plus-logo fw-bold mb-1">COSUP<span className="text-primary">+</span></h3>
                    <h6 className="text-muted small text-uppercase fw-bold mt-2" style={{ letterSpacing: '1px' }}>Sistema de Gestão</h6>
                </div>
                
                <Form onSubmit={handleSubmit}>
                    {error && (
                      <Alert variant="danger" className="shadow-sm border-0" onClose={() => setError(null)} dismissible>
                        {error}
                      </Alert>
                    )}
                    
                    <Form.Group className="mb-4" controlId="formUsername">
                    <Form.Label className="fw-bold text-secondary small text-uppercase">Usuário</Form.Label>
                    <Form.Control
                        type="text"
                        size="lg"
                        className="bg-light border-0 shadow-none"
                        style={{ fontSize: '1rem' }}
                        placeholder="Digite seu usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-bold text-secondary small text-uppercase">Senha</Form.Label>
                    <Form.Control
                        type="password"
                        size="lg"
                        className="bg-light border-0 shadow-none"
                        style={{ fontSize: '1rem' }}
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    </Form.Group>
                    
                    <div className="d-grid mt-4 pt-2">
                    <PrimaryButton
                        type="submit"
                        isLoading={isSubmitting}
                        size="lg"
                        className="fw-bold shadow-sm"
                        style={{ padding: '0.8rem' }}
                    >
                        {isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}
                    </PrimaryButton>
                    </div>
                </Form>
                </Card.Body>
            </Card>
            <div className="text-center mt-4 text-muted small fw-bold">
              &copy; {new Date().getFullYear()} Coordenadoria de Suporte - UFS
            </div>
            </Col>
        </Row>
    </AuthLayout>
  );
}

export default LoginPage;