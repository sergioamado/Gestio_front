// src/contexts/ConfirmContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmOptions {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  varianteBotao?: 'primary' | 'danger' | 'warning' | 'success';
}

interface ConfirmContextType {
  confirmar: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm deve ser usado dentro de um ConfirmProvider');
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const [opcoes, setOpcoes] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  // Função que é chamada pelos componentes (como o ManutencaoCard)
  const confirmar = (options: ConfirmOptions): Promise<boolean> => {
    setOpcoes(options);
    setShow(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = () => {
    setShow(false);
    if (resolver) resolver(false);
  };

  const handleConfirm = () => {
    setShow(false);
    if (resolver) resolver(true); 
  };

  return (
    <ConfirmContext.Provider value={{ confirmar }}>
      {children}
      
      {/* O Nosso Cartão de Confirmação Moderno */}
      <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
        <Modal.Header className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-4 text-dark">
            {opcoes?.titulo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="fs-6 text-secondary px-4 py-3">
          {opcoes?.mensagem}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          <Button variant="light" className="fw-bold px-4 shadow-sm" onClick={handleClose}>
            {opcoes?.textoCancelar || 'Cancelar'}
          </Button>
          <Button variant={opcoes?.varianteBotao || 'primary'} className="fw-bold px-4 shadow-sm" onClick={handleConfirm}>
            {opcoes?.textoConfirmar || 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>

    </ConfirmContext.Provider>
  );
};