// src/components/Layout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Container, Row, Col, Nav,  Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  return (
    <div className="d-flex flex-column p-3 text-white bg-dark" style={{ height: '100vh' }}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">Gestio</span>
      </a>
      <hr />
      <Nav variant="pills" className="flex-column mb-auto">
        <Nav.Item>
          <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/itens" className="text-white">Gerenciar Itens</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/solicitacoes" className="text-white">Gerenciar Solicitações</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/usuarios" className="text-white">Gerenciar Usuários</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/unidades" className="text-white">Gerenciar Unidades</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/" className="text-white">Relatorios</Nav.Link>
        </Nav.Item>
      </Nav>
      <hr />
      <div>
        <strong>{user?.nome_completo}</strong>
        <br />
        <small>{user?.role.toUpperCase()}</small>
        <Nav.Link as={Link} to="/alterar-senha" className="text-white-50 small d-block mt-1">Alterar Senha</Nav.Link>
        <Button variant="outline-light" size="sm" className="w-100 mt-2" onClick={logout}>Sair</Button>
      </div>
    </div>
  );
};


const Layout = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-0">
          <Sidebar />
        </Col>
        <Col md={10} style={{ maxHeight: '100vh', overflowY: 'auto' }}>
          <main className="p-4">
            <Outlet /> {/* O conteúdo da página (Dashboard, etc.) será renderizado aqui */}
          </main>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;