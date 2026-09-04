// src/components/itens/ItemForm.tsx
import { Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../PrimaryButton';
import type { Item, ItemCreateData, Unidade } from '../../types';
import { useAuth } from '../../hooks/useAuth';

// PROPRIEDADES DO COMPONENTE
interface ItemFormProps {
  item?: Item | null; // Se vier preenchido, é Edição. Se for null, é Criação.
  unidades: Unidade[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function ItemForm({ item, unidades, onSubmit, isLoading }: ItemFormProps) {
  const { user } = useAuth();
  
  
  // CONFIGURAÇÃO DO FORMULÁRIO (React Hook Form)
  
  const { register, handleSubmit, formState: { errors } } = useForm<ItemCreateData>({
    defaultValues: {
      descricao: item?.descricao || '',
      codigo_sipac: item?.codigo_sipac || '',
      pregao: item?.pregao || '',
      tipo: item?.tipo || '',
      unidade_medida: item?.unidade_medida || 'UND',
      localizacao: item?.localizacao || '', // Localização Geral (Almoxarifado)
      preco_unitario: item?.preco_unitario || 0.0,
      unidade_id: item?.unidade_id || (user?.role !== 'admin' ? (user?.unidade_id ?? undefined) : undefined),
      
      // NOVOS CAMPOS DE ESTOQUE (Mapeando os valores do banco)
      // Se for um item antigo que só tinha "quantidade", usamos como fallback para "quantidade_estoque"
      quantidade_estoque: item?.quantidade_estoque ?? item?.quantidade ?? 0, 
      quantidade_teste: item?.quantidade_teste || 0,
      quantidade_defeito: item?.quantidade_defeito || 0,
      localizacao_teste: item?.localizacao_teste || '',
    },
  });

  return (
    // Quando o formulário for submetido, o handleSubmit valida tudo e chama a função onSubmit
    <Form onSubmit={handleSubmit(onSubmit)}>
      
      
      {/* DADOS BÁSICOS DO ITEM                                                        */}
      
      
      {/* SELEÇÃO DE UNIDADE (Apenas Admin pode escolher a unidade dona da peça) */}
      {user?.role === 'admin' && (
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold text-secondary small">Unidade Organizacional</Form.Label>
          <Form.Select {...register("unidade_id", { valueAsNumber: true, required: "A unidade é obrigatória" })} isInvalid={!!errors.unidade_id}>
            <option value="">Selecione uma unidade...</option>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.unidade_id?.message}</Form.Control.Feedback>
        </Form.Group>
      )}

      {/* NOME / ESPECIFICAÇÃO DA PEÇA */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold text-secondary small">Especificação da Peça</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          {...register("descricao", { required: "A especificação é obrigatória" })} 
          isInvalid={!!errors.descricao} 
          placeholder="Ex: Memória RAM 8GB DDR4..."
        />
        <Form.Control.Feedback type="invalid">{errors.descricao?.message}</Form.Control.Feedback>
      </Form.Group>

      {/* CÓDIGO E PREGÃO */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Código SIPAC</Form.Label>
            <Form.Control type="text" {...register("codigo_sipac")} placeholder="Ex: 123456" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Pregão</Form.Label>
            <Form.Control type="text" {...register("pregao")} placeholder="Ex: 12/2023" />
          </Form.Group>
        </Col>
      </Row>

      {/* TIPO E LOCALIZAÇÃO GERAL (Armazém Principal) */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Tipo (Categoria)</Form.Label>
            <Form.Control type="text" {...register("tipo")} placeholder="Ex: Informática" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Localização Principal (Almoxarifado)</Form.Label>
            <Form.Control type="text" {...register("localizacao")} placeholder="Ex: Prateleira A" />
          </Form.Group>
        </Col>
      </Row>

      {/* UNIDADE DE MEDIDA E PREÇO (Alargados para 6 colunas cada, pois removemos a Qtd antiga daqui) */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Unid. Medida</Form.Label>
            <Form.Control type="text" {...register("unidade_medida")} placeholder="Ex: UND, CAIXA" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">Preço Unitário (R$)</Form.Label>
            <Form.Control type="number" step="0.01" {...register("preco_unitario", { valueAsNumber: true, min: 0 })} />
          </Form.Group>
        </Col>
      </Row>


      {/* PAINEL TRIPLO: GESTÃO E DISTRIBUIÇÃO DE ESTOQUE                           */}
      
      <h6 className="fw-bold text-primary mt-4 mb-3 border-bottom pb-2">📦 Gestão e Distribuição de Estoque</h6>

      <Row>
        {/* 1. QUANTIDADE DE CONSUMO (Verde) */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-success">Novo / Consumo</Form.Label>
            <Form.Control
              type="number"
              min="0"
              className="border-success bg-success bg-opacity-10 fw-bold"
              // valueAsNumber garante que o React Hook Form envie um Int ao invés de String para o Prisma
              {...register("quantidade_estoque", { valueAsNumber: true, min: 0 })}
            />
            <Form.Text className="text-muted" style={{fontSize: '0.7rem'}}>Peças fechadas prontas p/ uso.</Form.Text>
          </Form.Group>
        </Col>

        {/* 2. QUANTIDADE DE TESTE (Azul) */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-primary">Para Testes</Form.Label>
            <Form.Control
              type="number"
              min="0"
              className="border-primary bg-primary bg-opacity-10 fw-bold"
              {...register("quantidade_teste", { valueAsNumber: true, min: 0 })}
            />
            <Form.Text className="text-muted" style={{fontSize: '0.7rem'}}>Peças de diagnóstico.</Form.Text>
          </Form.Group>
        </Col>

        {/* 3. QUANTIDADE COM DEFEITO (Vermelho) */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-danger">Com Defeito</Form.Label>
            <Form.Control
              type="number"
              min="0"
              className="border-danger bg-danger bg-opacity-10 fw-bold text-danger"
              {...register("quantidade_defeito", { valueAsNumber: true, min: 0 })}
            />
            <Form.Text className="text-muted" style={{fontSize: '0.7rem'}}>Aguardando conserto/descarte.</Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        {/* LOCALIZAÇÃO EXCLUSIVA PARA PEÇAS DE TESTE (Destacada com fundo azul claro) */}
        <Col md={12}>
          <Form.Group className="mb-4 bg-primary bg-opacity-10 p-3 rounded border border-primary border-opacity-25">
            <Form.Label className="small fw-bold text-primary mb-1">
              🧪 Localização das Peças de Teste
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Armário de Manutenção Eletrônica - Gaveta 3"
              className="border-primary border-opacity-50"
              {...register("localizacao_teste")}
            />
            <Form.Text className="text-muted" style={{fontSize: '0.75rem'}}>
              Onde o técnico deve procurar e devolver esta peça quando precisar testar equipamentos.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>


      {/* BOTÃO DE SUBMISSÃO                                                           */}
      
      <div className="d-grid mt-2">
        <PrimaryButton type="submit" isLoading={isLoading}>
          {item ? 'Salvar Alterações de Estoque' : 'Cadastrar Novo Item'}
        </PrimaryButton>
      </div>
    </Form>
  );
}

export default ItemForm;