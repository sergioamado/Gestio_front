// src/components/DeleteConfirmationModal.tsx
import { Modal, Button } from 'react-bootstrap';
import PrimaryButton from './PrimaryButton';
import { type ButtonVariant } from 'react-bootstrap/esm/types';

interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  isDeleting: boolean; 
  confirmButtonText?: string;
  confirmButtonVariant?: ButtonVariant;
}

function DeleteConfirmationModal({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  body, 
  isDeleting,
  confirmButtonText = 'Confirmar Exclusão', 
  confirmButtonVariant = 'danger', 
}: DeleteConfirmationModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isDeleting}>
          Cancelar
        </Button>
        <PrimaryButton 
          variant={confirmButtonVariant} 
          onClick={onConfirm} 
          isLoading={isDeleting}
        >
          {confirmButtonText}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmationModal;