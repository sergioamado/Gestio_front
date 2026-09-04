// src/pages/CatalogoServicosPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Modal, Form, Spinner, Alert, Button } from 'react-bootstrap';
import { PlusCircle, PencilSquare, TagFill } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { servicosService } from '../../services/servicosService';
import MainLayout from '../../layouts/MainLayout'; // 
import PrimaryButton from '../../components/PrimaryButton';
import type { CatalogoServico } from '../../types';

function CatalogoServicosPage() {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<CatalogoServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Controles do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoServico | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Partial<CatalogoServico>>();

  // Bloqueio visual extra por segurança
  const canManage = user?.role === 'admin' || user?.role === 'gerente';

  useEffect(() => {
    carregarCatalogo();
  }, []);

  const carregarCatalogo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicosService.getCatalogo();
      setServicos(data);
    } catch (error) {
      console.error("Erro ao carregar catálogo:", error);
      setError("Falha ao carregar o catálogo de serviços.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item?: CatalogoServico) => {
    if (item) {
      setEditingItem(item);
      setValue('nome_servico', item.nome_servico);
      setValue('categoria', item.categoria);
      setValue('valor_estimado', Number(item.valor_estimado));
      setValue('ativo', item.ativo);
    } else {
      setEditingItem(null);
      reset({ ativo: true, valor_estimado: 0 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      data.valor_estimado = Number(data.valor_estimado);
      
      if (editingItem) {
        await servicosService.updateServico(editingItem.id, data);
      } else {
        await servicosService.createServico(data);
      }
      await carregarCatalogo();
      handleCloseModal();
    } catch (error) {
      setError("Erro ao salvar serviço. Verifique os dados.");
    }
  };

  if (!canManage) {
    return (
      <MainLayout pageTitle="Acesso Negado">
         <Alert variant="danger" className="shadow-sm border-0 m-4">
            Acesso restrito a Gestores e Administradores.
         </Alert>
      </MainLayout>
    );
  }

  return (
    // 🚀 MainLayout GARANTE que a sidebar e o cabeçalho existam
    <MainLayout pageTitle="🏷️ Catálogo de Serviços Base">
      
      {error && (
        <Alert variant="danger" className="shadow-sm border-0" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Painel de Cabeçalho Flutuante */}
      <Card className="floating-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">
              <TagFill className="me-2 text-primary" />
              Tabela de Preços e Serviços
            </h5>
            <small className="text-muted">
              Gerencie os valores de referência para os serviços prestados pelos técnicos.
            </small>
          </div>
          
          <PrimaryButton onClick={() => handleOpenModal()} className="px-4 shadow-sm fw-bold">
            <PlusCircle className="me-2" /> Novo Serviço
          </PrimaryButton>
        </Card.Body>
      </Card>

      {/* Tabela de Serviços */}
      <Card className="floating-card border-0 shadow-sm">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted fw-medium">Carregando catálogo...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Serviço (Especificação)</th>
                    <th>Categoria</th>
                    <th>Valor Estimado (R$)</th>
                    <th className="text-center">Status</th>
                    <th className="text-center pe-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-5 text-muted bg-light">
                         <span className="fs-1 d-block mb-3">📭</span>
                         <h6 className="fw-bold text-dark">Nenhum serviço cadastrado.</h6>
                         <p className="mb-0 small">Comece criando os serviços base do setor.</p>
                      </td>
                    </tr>
                  ) : (
                    servicos.map((svc) => (
                      <tr key={svc.id}>
                        <td className="fw-bold text-dark ps-4 py-3">{svc.nome_servico}</td>
                        <td>
                          <Badge bg="secondary" className="bg-opacity-10 text-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">
                            {svc.categoria}
                          </Badge>
                        </td>
                        <td className="fw-bold text-success">
                          R$ {Number(svc.valor_estimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-center">
                          <Badge bg={svc.ativo ? 'success' : 'danger'} className="rounded-pill px-3">
                            {svc.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="text-center pe-4">
                          <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(svc)} className="fw-bold shadow-sm">
                            <PencilSquare className="me-1" /> Editar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" className="shadow-lg">
        <Modal.Header closeButton className="bg-light border-bottom-0 pt-4 px-4">
          <Modal.Title className="fw-bold text-dark fs-5">
            {editingItem ? '✏️ Editar Serviço' : '🏷️ Novo Serviço'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body className="px-4 py-4">
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary">Nome do Serviço</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ex: Formatação de Computador com Backup"
                {...register("nome_servico", { required: true })} 
                isInvalid={!!errors.nome_servico}
                className="shadow-sm"
              />
            </Form.Group>

            <Row>
              <Col md={7}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-secondary">Categoria</Form.Label>
                  <Form.Select {...register("categoria", { required: true })} isInvalid={!!errors.categoria} className="shadow-sm">
                    <option value="">Selecione...</option>
                    <option value="Manutenção Eletrônica">Manutenção Eletrônica</option>
                    <option value="Infraestrutura / Redes">Infraestrutura / Redes</option>
                    <option value="Suporte de Software">Suporte de Software</option>
                    <option value="Impressoras">Impressoras</option>
                    <option value="Outros">Outros</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-secondary">Valor Estimado (R$)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01" 
                    min="0"
                    {...register("valor_estimado", { required: true, min: 0 })} 
                    isInvalid={!!errors.valor_estimado}
                    className="shadow-sm border-success text-success fw-bold"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="bg-light p-3 rounded border border-light">
              <Form.Check 
                type="switch"
                id="ativo-switch"
                label={<span className="fw-bold text-dark">Serviço Ativo</span>}
                {...register("ativo")}
              />
              <Form.Text className="text-muted small ms-5">
                Se inativo, os técnicos não poderão selecionar este serviço.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light border-top-0 pb-4 px-4">
            <Button variant="secondary" onClick={handleCloseModal} className="fw-bold px-4">Cancelar</Button>
            <PrimaryButton type="submit" isLoading={isSubmitting} className="fw-bold px-4">
              {editingItem ? 'Salvar Alterações' : 'Cadastrar Serviço'}
            </PrimaryButton>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainLayout>
  );
}

export default CatalogoServicosPage;