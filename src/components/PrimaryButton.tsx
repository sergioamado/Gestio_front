// src/components/PrimaryButton.tsx
import { Button, Spinner } from 'react-bootstrap';
import type { ButtonProps } from 'react-bootstrap';

interface PrimaryButtonProps extends ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

function PrimaryButton({
  isLoading = false,
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button variant="primary" disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="ms-2">Carregando...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default PrimaryButton;