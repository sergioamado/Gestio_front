// src/layouts/AuthLayout.tsx
import React from 'react';
import { Container } from 'react-bootstrap';
import Footer from '../components/Footer'; 

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-layout">
      <Container as="main" className="flex-grow-1 d-flex align-items-center justify-content-center">
        {children}
      </Container>
      <Footer theme="light" />
    </div>
  );
};

export default AuthLayout;