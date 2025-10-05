// src/components/auth/ChangeOwnPasswordForm.tsx
import { Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import PrimaryButton from '../PrimaryButton';
import { changeOwnPassword } from '../../services/authService';

interface ChangeOwnPasswordFormProps {
  onSuccess: (message: string) => void;
}

function ChangeOwnPasswordForm({ onSuccess }: ChangeOwnPasswordFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const newPassword = watch("newPassword");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const response = await changeOwnPassword(data.currentPassword, data.newPassword);
      onSuccess(response.message);
      reset(); // Limpa o formulário
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Ocorreu um erro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {apiError && <Alert variant="danger">{apiError}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Senha Atual</Form.Label>
        <Form.Control type="password" {...register("currentPassword", { required: "A senha atual é obrigatória" })} isInvalid={!!errors.currentPassword} />
        <Form.Control.Feedback type="invalid">{errors.currentPassword?.message as string}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nova Senha</Form.Label>
        <Form.Control type="password" {...register("newPassword", { required: "A nova senha é obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" }})} isInvalid={!!errors.newPassword} />
        <Form.Control.Feedback type="invalid">{errors.newPassword?.message as string}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Confirme a Nova Senha</Form.Label>
        <Form.Control type="password" {...register("confirmPassword", { required: "A confirmação é obrigatória", validate: value => value === newPassword || "As senhas não coincidem" })} isInvalid={!!errors.confirmPassword} />
        <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message as string}</Form.Control.Feedback>
      </Form.Group>
      <div className="d-grid">
        <PrimaryButton type="submit" isLoading={isSubmitting}>Alterar Senha</PrimaryButton>
      </div>
    </Form>
  );
}

export default ChangeOwnPasswordForm;