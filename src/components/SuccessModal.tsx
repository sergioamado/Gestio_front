// src/components/SuccessModal.tsx
import { Modal } from 'react-bootstrap';
import PrimaryButton from './PrimaryButton';

interface SuccessModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  body: string;
}

function SuccessModal({ show, onHide, title, body }: SuccessModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="mb-3">✅</div>
        <p>{body}</p>
      </Modal.Body>
      <Modal.Footer>
        <PrimaryButton onClick={onHide}>
          Fechar
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}

export default SuccessModal;