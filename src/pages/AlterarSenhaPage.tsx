// src/pages/AlterarSenhaPage.tsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import ChangeOwnPasswordForm from '../components/auth/ChangeOwnPasswordForm';
import AdminResetPasswordForm from '../components/auth/AdminResetPasswordForm';
import SuccessModal from '../components/SuccessModal';
import { getAllUsers } from '../services/usuarioService';
import type { User } from '../types';

function AlterarSenhaPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Busca a lista de utilizadores se o utilizador for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      getAllUsers()
        .then(setUsers)
        .catch(() => setError("Não foi possível carregar a lista de utilizadores."))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  if (loading) {
    return (
      <MainLayout pageTitle="🔑 Alterar Senha">
        <Spinner animation="border" />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="🔑 Alterar Senha">
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col lg={user?.role === 'admin' ? 6 : 12} className="mb-4">
          <Card className="floating-card">
            <Card.Header as="h5">Alterar Minha Senha</Card.Header>
            <Card.Body>
              <ChangeOwnPasswordForm onSuccess={handleSuccess} />
            </Card.Body>
          </Card>
        </Col>
        
        {/* Formulário do admin só aparece se o utilizador for admin */}
        {user?.role === 'admin' && (
          <Col lg={6} className="mb-4">
            <Card className="floating-card">
              <Card.Header as="h5">Redefinir Senha de um Utilizador</Card.Header>
              <Card.Body>
                <AdminResetPasswordForm users={users} onSuccess={handleSuccess} />
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title="Operação Bem-Sucedida!"
        body={successMessage}
      />
    </MainLayout>
  );
}

export default AlterarSenhaPage;