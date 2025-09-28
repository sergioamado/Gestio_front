// src/components/ModalForm.tsx
import { Modal } from 'react-bootstrap';

interface ModalFormProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
}

function ModalForm({ show, onHide, title, children }: ModalFormProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
    </Modal>
  );
}

export default ModalForm;