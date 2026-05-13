// src/components/patrimonio/BemDetailsModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Tabs, Tab, Row, Col, Spinner } from 'react-bootstrap';
import * as patrimonioService from '../../services/patrimonioService';
import * as usuarioService from '../../services/usuarioService';
import * as unidadeService from '../../services/unidadeService';
import type { BemPatrimonial, User, Unidade } from '../../types';
import PrimaryButton from '../PrimaryButton';

interface BemDetailsModalProps {
  show: boolean;
  onHide: () => void;
  bem: BemPatrimonial | null;
  onUpdate: () => void; // Recarrega a lista após uma alteração
}

function BemDetailsModal({ show, onHide, bem, onUpdate }: BemDetailsModalProps) {
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);

  // Estados para as ações
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
    setLoadingAcao(true);
    try {
      await patrimonioService.uploadFoto(bem.id, foto);
      setMensagem({ tipo: 'success', texto: 'Foto atualizada com sucesso!' });
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao fazer upload da foto.' });
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
            <div className="text-muted small">
              <strong>Marca/Modelo:</strong> {bem.marca || 'Não informado'} <br/>
              <strong>Localização Atual:</strong> {bem.localizacao_fisica} <br/>
              <strong>Status:</strong> {bem.status_atual}
            </div>
          </Col>
          <Col md={4} className="text-center">
            {bem.foto_url ? (
               <img src={bem.foto_url} alt="Foto do Bem" className="img-thumbnail shadow-sm" style={{ maxHeight: '100px' }} />
            ) : (
               <div className="bg-light border rounded d-flex align-items-center justify-content-center text-muted" style={{ height: '100px' }}>
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
            {/* ABA 1: UPLOAD DE FOTO */}
            <Tab eventKey="foto" title="📷 Atualizar Foto">
              <Form onSubmit={handleUploadFoto} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Selecione uma imagem (JPG, PNG)</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e: any) => setFoto(e.target.files[0])} required />
                </Form.Group>
                <div className="text-end">
                  <PrimaryButton type="submit" isLoading={loadingAcao} disabled={!foto}>Salvar Foto</PrimaryButton>
                </div>
              </Form>
            </Tab>

            {/* ABA 2: TRANSFERIR (MOVIMENTAÇÃO) */}
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