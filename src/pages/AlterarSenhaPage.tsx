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

  // Busca a lista de usuários se o usuário logado for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      getAllUsers()
        .then(setUsers)
        .catch(() => setError("Não foi possível carregar a lista de usuários."))
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
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2 text-muted fw-medium">Verificando permissões...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="🔑 Alterar Senha">
      {error && (
        <Alert variant="danger" className="shadow-sm border-0 mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Row className="g-4">
        <Col lg={user?.role === 'admin' ? 6 : 12}>
          <Card className="floating-card border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-2">
              <h5 className="fw-bold text-dark mb-0">Alterar Minha Senha</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <ChangeOwnPasswordForm onSuccess={handleSuccess} />
            </Card.Body>
          </Card>
        </Col>
        
        {/* Formulário do admin só aparece se o usuário for admin */}
        {user?.role === 'admin' && (
          <Col lg={6}>
            <Card className="floating-card border-0 shadow-sm h-100 border-start border-warning border-4">
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-2">
                <h5 className="fw-bold text-dark mb-0">Redefinir Senha de um Usuário</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <AdminResetPasswordForm users={users} onSuccess={handleSuccess} />
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        title="✅ Operação Bem-Sucedida!"
        body={successMessage}
      />
    </MainLayout>
  );
}

export default AlterarSenhaPage;