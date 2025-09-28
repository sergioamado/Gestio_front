// src/components/usuarios/UsuarioForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { User, UserCreateData } from '../../types/index'; // Ajuste o caminho se necessário
import type { Unidade } from '../../types/index'; // Ajuste o caminho se necessário

interface UsuarioFormProps {
  usuario?: User | null;
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function UsuarioForm({ usuario, unidades, onSubmit, isLoading }: UsuarioFormProps) {
  const isEditMode = !!usuario;
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<UserCreateData>({
    defaultValues: {
      username: usuario?.username || '',
      nome_completo: usuario?.nome_completo || '',
      telefone: usuario?.telefone || '',
      email: usuario?.email || '',
      role: usuario?.role || 'tecnico',
      unidade_id: usuario?.unidade_id || null,
      password: '',
    },
  });

  const selectedRole = watch('role');

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>Usuário (Login)</Form.Label>
            <Form.Control type="text" {...register("username", { required: "O nome de usuário é obrigatório" })} isInvalid={!!errors.username} disabled={isEditMode} />
            <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>Nome Completo</Form.Label>
            <Form.Control type="text" {...register("nome_completo", { required: "O nome completo é obrigatório" })} isInvalid={!!errors.nome_completo} />
            <Form.Control.Feedback type="invalid">{errors.nome_completo?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3">
            <Form.Group>
                <Form.Label>Telefone</Form.Label>
                <Form.Control type="text" {...register("telefone")} />
            </Form.Group>
        </Col>
        <Col md={6} className="mb-3">
            <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" {...register("email", { pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }})} isInvalid={!!errors.email} />
                <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>Perfil</Form.Label>
            <Form.Select {...register("role", { required: "O perfil é obrigatório" })} isInvalid={!!errors.role}>
              <option value="tecnico">Técnico</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Col>
        {selectedRole !== 'admin' && (
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Unidade Organizacional</Form.Label>
              <Controller
                name="unidade_id"
                control={control}
                // Corrigido: Simplificamos a regra, pois já está dentro de um 'if'
                rules={{ required: "A unidade é obrigatória" }}
                render={({ field }) => (
                  // Corrigido: Convertemos 'null' para string vazia para o Form.Select
                  <Form.Select
                    {...field}
                    value={field.value || ''} // <-- A MÁGICA ACONTECE AQUI
                    isInvalid={!!errors.unidade_id}
                  >
                    <option value="">Selecione uma unidade...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                )}
              />
              <Form.Control.Feedback type="invalid">{errors.unidade_id?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
      </Row>
      {!isEditMode && (
        <Form.Group className="mb-3">
          <Form.Label>Senha Provisória</Form.Label>
          <Form.Control type="password" {...register("password", { required: "A senha é obrigatória", minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres' }})} isInvalid={!!errors.password} />
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>
      )}
      <div className="d-grid mt-3">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {isEditMode ? 'Salvar Alterações' : 'Cadastrar Usuário'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default UsuarioForm;