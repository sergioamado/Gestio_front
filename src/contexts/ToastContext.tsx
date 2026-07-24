// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface ToastMessage {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'alerta' | 'info';
}

interface ToastContextType {
  mostrarCard: (titulo: string, mensagem: string, tipo?: 'sucesso' | 'erro' | 'alerta' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de um ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const mostrarCard = (titulo: string, mensagem: string, tipo: 'sucesso' | 'erro' | 'alerta' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, titulo, mensagem, tipo }]);
  };

  const removerToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Define as cores baseadas no tipo
  const getCores = (tipo: string) => {
    switch (tipo) {
      case 'sucesso': return { bg: 'success', icon: '✅' };
      case 'erro': return { bg: 'danger', icon: '❌' };
      case 'alerta': return { bg: 'warning', icon: '⚠️' };
      default: return { bg: 'primary', icon: 'ℹ️' };
    }
  };

  return (
    <ToastContext.Provider value={{ mostrarCard }}>
      {children}
      {/* Container fixo no canto inferior direito */}
      <ToastContainer position="bottom-end" className="p-4" style={{ zIndex: 9999, position: 'fixed' }}>
        {toasts.map((t) => {
          const config = getCores(t.tipo);
          return (
            <Toast 
              key={t.id} 
              onClose={() => removerToast(t.id)} 
              delay={5000} 
              autohide 
              className="border-0 shadow-lg mb-3"
            >
              <Toast.Header className={`bg-${config.bg} text-white border-0`}>
                <span className="me-2 fs-5">{config.icon}</span>
                <strong className="me-auto fs-6">{t.titulo}</strong>
              </Toast.Header>
              <Toast.Body className="bg-white text-dark fw-medium fs-6 p-3">
                {t.mensagem}
              </Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
};