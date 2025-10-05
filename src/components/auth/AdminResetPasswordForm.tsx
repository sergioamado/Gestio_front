// src/components/auth/AdminResetPasswordForm.tsx
import { Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import PrimaryButton from '../PrimaryButton';
import { resetPasswordByAdminUsers  } from '../../services/usuarioService';
import type { AdminResetPasswordFormProps } from '../../types';



function AdminResetPasswordForm({ users, onSuccess }: AdminResetPasswordFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const response = await resetPasswordByAdminUsers(data.username, data.newPassword);
      onSuccess(response.message);
      reset();
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
        <Form.Label>Selecione o Utilizador</Form.Label>
        <Form.Select {...register("username", { required: "É necessário selecionar um utilizador" })} isInvalid={!!errors.username}>
          <option value="">Selecione...</option>
          {users.map(user => <option key={user.id} value={user.username}>{user.nome_completo} ({user.username})</option>)}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errors.username?.message as string}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nova Senha</Form.Label>
        <Form.Control type="password" {...register("newPassword", { required: "A nova senha é obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } })} isInvalid={!!errors.newPassword} />
        <Form.Control.Feedback type="invalid">{errors.newPassword?.message as string}</Form.Control.Feedback>
      </Form.Group>
      <div className="d-grid">
        <PrimaryButton type="submit" isLoading={isSubmitting}>Redefinir Senha</PrimaryButton>
      </div>
    </Form>
  );
}

export default AdminResetPasswordForm;