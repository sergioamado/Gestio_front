// src/contexts/ToastContext.tsx
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface ToastMessage {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'alerta' | 'info';
  duracao: number;
}

interface ToastContextType {
  /** Card de notificação do sistema. `duracaoMs` padrão: 5 s. */
  mostrarCard: (titulo: string, mensagem: string, tipo?: 'sucesso' | 'erro' | 'alerta' | 'info', duracaoMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de um ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Contador em vez de Date.now(): vários toasts no mesmo milissegundo teriam a mesma key.
  const nextId = useRef(0);

  // Memoizado: componentes que têm mostrarCard nas deps de useEffect (NotificationRadar,
  // BemDetailsModal...) não devem re-executar o efeito a cada toast exibido.
  const mostrarCard = useCallback((titulo: string, mensagem: string, tipo: 'sucesso' | 'erro' | 'alerta' | 'info' = 'info', duracaoMs = 5000) => {
    const id = ++nextId.current;
    // No máximo 3 cards ao mesmo tempo (no celular eles cobririam a tela): descarta os mais antigos.
    setToasts((prev) => [...prev, { id, titulo, mensagem, tipo, duracao: duracaoMs }].slice(-3));
  }, []);

  const removerToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value = useMemo(() => ({ mostrarCard }), [mostrarCard]);

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
    <ToastContext.Provider value={value}>
      {children}
      {/* Container fixo no canto inferior direito */}
      <ToastContainer position="bottom-end" className="p-2 p-sm-4 toast-container-cosup" style={{ zIndex: 9999, position: 'fixed' }}>
        {toasts.map((t) => {
          const config = getCores(t.tipo);
          return (
            <Toast 
              key={t.id} 
              onClose={() => removerToast(t.id)} 
              delay={t.duracao} 
              autohide 
              className="border-0 shadow-lg mb-3"
            >
              <Toast.Header className={`bg-${config.bg} text-white border-0`}>
                <span className="me-2 fs-5">{config.icon}</span>
                <strong className="me-auto fs-6">{t.titulo}</strong>
              </Toast.Header>
              <Toast.Body className="bg-white text-dark fw-medium fs-6 p-3" style={{ whiteSpace: 'pre-line' }}>
                {t.mensagem}
              </Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
};