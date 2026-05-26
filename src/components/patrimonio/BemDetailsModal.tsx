// src/components/patrimonio/BemDetailsModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Form, Alert, Tabs, Tab, Row, Col, Spinner, Badge } from 'react-bootstrap';
import * as patrimonioService from '../../services/patrimonioService';
import * as usuarioService from '../../services/usuarioService';
import * as unidadeService from '../../services/unidadeService';
import PrimaryButton from '../PrimaryButton';
import api from '../../services/api';

// IMPORTAÇÃO CORRIGIDA: Adicionado User e Unidade que estavam faltando
import type { BemPatrimonial, User, Unidade, BemDetailsModalProps } from '../../types';

function BemDetailsModal({ show, onHide, bem, onUpdate }: BemDetailsModalProps) {
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [tecnicoId, setTecnicoId] = useState('');
  const [unidadeDestinoId, setUnidadeDestinoId] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: string; texto: string } | null>(null);

  useEffect(() => {
    if (show) {
      setMensagem(null);
      setFoto(null);
      setLoadingDados(true);
      Promise.all([
        usuarioService.getTecnicos(),
        unidadeService.getAllUnidades()
      ]).then(([tecData, unidData]) => {
        setTecnicos(tecData);
        setUnidades(unidData);
      }).finally(() => setLoadingDados(false));
    }
  }, [show]);

  if (!bem) return null;

  const handleUploadFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foto) return;

    // Proteção no Frontend: Impede o envio se for maior que 5MB
    if (foto.size > 5 * 1024 * 1024) {
      setMensagem({ tipo: 'warning', texto: 'A foto é muito grande! Escolha uma imagem de até 5MB.' });
      return;
    }

    setLoadingAcao(true);
    try {
      // Cria o pacote Multipart/form-data
      const formData = new FormData();
      formData.append('foto', foto);

      // Dispara direto pela API usando o FormData
      await api.post(`/patrimonio/${bem.id}/foto`, formData);

      setMensagem({ tipo: 'success', texto: 'Foto atualizada com sucesso!' });
      
      // Limpa a seleção e atualiza a tela
      setFoto(null);
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao fazer upload da foto. Verifique a conexão.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleMovimentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadeDestinoId) return;
    setLoadingAcao(true);
    try {
      await patrimonioService.registrarMovimentacao({
        bem_ids: [bem.id],
        destino_unidade_id: Number(unidadeDestinoId),
        observacao
      });
      setMensagem({ tipo: 'success', texto: 'Bem transferido com sucesso!' });
      onUpdate();
      setTimeout(onHide, 1500);
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao registrar movimentação.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleAtribuir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tecnicoId) return;
    setLoadingAcao(true);
    try {
      await patrimonioService.atribuirBem({
        bem_id: bem.id,
        tecnico_id: Number(tecnicoId),
        observacoes: observacao
      });
      setMensagem({ tipo: 'success', texto: 'Bem atribuído ao técnico com sucesso!' });
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao atribuir bem.' });
    } finally {
      setLoadingAcao(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light border-bottom-0">
        <Modal.Title className="fw-bold text-dark fs-5">
          📦 Detalhes do Bem: <span className="text-primary">{bem.tombamento}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-2">
        <Row className="mb-4">
          <Col md={8}>
            <h5 className="fw-bold text-dark">{bem.descricao}</h5>
            <div className="text-muted small mb-3">
              <strong>Marca/Modelo:</strong> {bem.marca || 'Não informado'} <br/>
              <strong>Localização Atual:</strong> {bem.localizacao_fisica} <br/>
              <strong>Status:</strong> {bem.status_atual}
            </div>
            
            {/* ESTRUTURA HTML CORRIGIDA: Removido o <td> e colocado uma div organizada */}
            <div className="mt-2">
              <strong className="d-block small text-secondary text-uppercase mb-1">Posse Atual:</strong>
              {bem.tecnico_responsavel ? (
                <Badge bg="info" text="dark" className="shadow-sm py-2 px-3 fs-6">
                  👤 Em posse de: {bem.tecnico_responsavel}
                </Badge>
              ) : (
                <Badge bg="secondary" className="shadow-sm py-2 px-3 fs-6">
                  🏢 No Setor / Inventário Geral
                </Badge>
              )}
            </div>
          </Col>
          <Col md={4} className="text-center">
            {bem.foto_url ? (
               <img src={`http://localhost:3001/${bem.foto_url}`} alt="Foto do Bem" className="img-thumbnail shadow-sm" style={{ maxHeight: '120px' }} />
            ) : (
               <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted" style={{ height: '120px' }}>
                 Sem Foto
               </div>
            )}
          </Col>
        </Row>

        {mensagem && <Alert variant={mensagem.tipo} className="border-0 shadow-sm">{mensagem.texto}</Alert>}

        {loadingDados ? (
           <div className="text-center my-4"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Tabs defaultActiveKey="foto" className="mb-3 custom-tabs">
            {/* ABA: UPLOAD DE FOTO */}
            <Tab eventKey="foto" title="📷 Atualizar Foto">
              <Form onSubmit={handleUploadFoto} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Selecione uma imagem (JPG, PNG)</Form.Label>
                  <Form.Control type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e: any) => setFoto(e.target.files[0])} required />
                </Form.Group>
                <div className="text-end">
                  <PrimaryButton type="submit" isLoading={loadingAcao} disabled={!foto}>Salvar Foto</PrimaryButton>
                </div>
              </Form>
            </Tab>

            {/* ABA: TRANSFERIR (MOVIMENTAÇÃO) */}
            <Tab eventKey="movimentar" title="🔄 Transferir Unidade">
              <Form onSubmit={handleMovimentar} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Unidade de Destino</Form.Label>
                  <Form.Select value={unidadeDestinoId} onChange={(e) => setUnidadeDestinoId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Motivo / Observação</Form.Label>
                  <Form.Control as="textarea" rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                </Form.Group>
                <div className="text-end">
                  <PrimaryButton type="submit" variant="warning" isLoading={loadingAcao} disabled={!unidadeDestinoId}>Transferir Bem</PrimaryButton>
                </div>
              </Form>
            </Tab>

            {/* ABA 3: ATRIBUIR A TÉCNICO */}
            <Tab eventKey="atribuir" title="👤 Atribuir a Técnico">
              <Form onSubmit={handleAtribuir} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Técnico Responsável</Form.Label>
                  <Form.Select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_completo}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Observação do Termo</Form.Label>
                  <Form.Control as="textarea" rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                </Form.Group>
                <div className="text-end">
                  <PrimaryButton type="submit" isLoading={loadingAcao} disabled={!tecnicoId}>Atribuir Cautela</PrimaryButton>
                </div>
              </Form>
            </Tab>
          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default BemDetailsModal;