// src/components/itens/ItemForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { Item, ItemCreateData, Unidade } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface ItemFormProps {
  item?: Item | null;
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function ItemForm({ item, unidades, onSubmit, isLoading }: ItemFormProps) {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<ItemCreateData>({
    defaultValues: {
      descricao: item?.descricao || '',
      codigo_sipac: item?.codigo_sipac || '',
      pregao: item?.pregao || '',
      tipo: item?.tipo || '',
      unidade_medida: item?.unidade_medida || 'UND',
      localizacao: item?.localizacao || '',
      quantidade: item?.quantidade || 0,
      preco_unitario: item?.preco_unitario || 0.0,
      unidade_id: item?.unidade_id || (user?.role !== 'admin' ? (user?.unidade_id ?? undefined) : undefined),
    },
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {user?.role === 'admin' && (
        <Form.Group className="mb-3">
          <Form.Label>Unidade Organizacional</Form.Label>
          <Form.Select {...register("unidade_id", { valueAsNumber: true, required: "A unidade é obrigatória" })} isInvalid={!!errors.unidade_id}>
            <option value="">Selecione uma unidade...</option>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.unidade_id?.message}</Form.Control.Feedback>
        </Form.Group>
      )}

      {/* CORRIGIDO: Nome do campo e mensagem de erro atualizados */}
      <Form.Group className="mb-3">
        <Form.Label>Especificação</Form.Label>
        <Form.Control as="textarea" rows={3} {...register("descricao", { required: "A especificação é obrigatória" })} isInvalid={!!errors.descricao} />
        <Form.Control.Feedback type="invalid">{errors.descricao?.message}</Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Código SIPAC</Form.Label><Form.Control type="text" {...register("codigo_sipac")} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Pregão</Form.Label><Form.Control type="text" {...register("pregao")} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Tipo</Form.Label><Form.Control type="text" {...register("tipo")} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Localização</Form.Label><Form.Control type="text" {...register("localizacao")} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={4}><Form.Group className="mb-3"><Form.Label>Unid. Medida</Form.Label><Form.Control type="text" {...register("unidade_medida")} /></Form.Group></Col>
        <Col md={4}><Form.Group className="mb-3"><Form.Label>Quantidade</Form.Label><Form.Control type="number" step="1" {...register("quantidade", { valueAsNumber: true, min: 0 })} /></Form.Group></Col>
        <Col md={4}><Form.Group className="mb-3"><Form.Label>Preço Unitário</Form.Label><Form.Control type="number" step="0.01" {...register("preco_unitario", { valueAsNumber: true, min: 0 })} /></Form.Group></Col>
      </Row>

      <div className="d-grid mt-3">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {item ? 'Salvar Alterações' : 'Cadastrar Item'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default ItemForm;