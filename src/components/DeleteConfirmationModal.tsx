// src/components/DeleteConfirmationModal.tsx
import { Modal, Button } from 'react-bootstrap';
import PrimaryButton from './PrimaryButton';

interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ show, onHide, onConfirm, title, body, isDeleting }: DeleteConfirmationModalProps) {
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
        <PrimaryButton variant="danger" onClick={onConfirm} isLoading={isDeleting}>
          Confirmar Exclusão
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmationModal;