// src/layouts/AuthLayout.tsx
import React from 'react';
import { Container } from 'react-bootstrap';
import Footer from '../components/Footer';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-layout">
      <Container as="main" className="auth-content">
        {children}
      </Container>
      {/* Fundo azul: tema escuro do rodapé (texto claro, legível) */}
      <Footer theme="dark" />
    </div>
  );
};

export default AuthLayout;