// src/components/manutencao/DetalhesManutencaoModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Form, Alert } from 'react-bootstrap';
import type { ManutencaoEletronica } from '../../types';
import PrimaryButton from '../PrimaryButton';
import * as manutencaoService from '../../services/manutencaoEletronicaService';
import { useAuth } from '../../hooks/useAuth';

interface DetalhesModalProps {
  show: boolean;
  onHide: () => void;
  manutencao: ManutencaoEletronica;
  onUpdate: () => void;
}

function DetalhesManutencaoModal({ show, onHide, manutencao, onUpdate }: DetalhesModalProps) {
  const { user } = useAuth();
  const [laudo, setLaudo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    equipamento: '',
    descricao_problema: '',
    laudo_tecnico: ''
  });

  useEffect(() => {
    if (show && manutencao) {
      setEditData({
        equipamento: manutencao.equipamento,
        descricao_problema: manutencao.descricao_problema,
        laudo_tecnico: manutencao.laudo_tecnico || ''
      });
      setIsEditing(false);
      setError('');
      setCopiado(false);
    }
  }, [show, manutencao]);

  const canFinalizar = manutencao.status === 'Em_manutencao' && manutencao.tecnico_responsavel_id === user?.id;
  const canEdit = user?.role === 'admin' || user?.role === 'gerente' || manutencao.tecnico_responsavel_id === user?.id;

  // 🚀 Correção do nome do técnico vindo do banco
  const nomeTecnico = (manutencao as any).usuarios?.nome_completo || 'Aguardando Atribuição';

  const handleFinalizar = async () => {
    if (!laudo) {
      setError('O parecer técnico é obrigatório para finalizar.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await manutencaoService.finalizarManutencao(manutencao.id, laudo);
      onUpdate();
      onHide();
    } catch (err) {
      setError('Ocorreu um erro ao finalizar a manutenção.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!editData.equipamento || !editData.descricao_problema) {
      setError('Equipamento e Descrição são obrigatórios.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await manutencaoService.editarManutencao(manutencao.id, editData);
      setIsEditing(false);
      onUpdate(); 
    } catch (err) {
      setError('Erro ao salvar as edições.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCopy = async () => {
    const summary = `[Resumo Manutenção Eletrônica]\nID: ${manutencao.id}\nGLPI: ${manutencao.glpi || 'N/A'}\nEquipamento: ${manutencao.equipamento}\nProblema: ${manutencao.descricao_problema}\nTécnico: ${nomeTecnico}\nStatus: ${manutencao.status.replace('_', ' ')}\nParecer: ${manutencao.laudo_tecnico || laudo || ''}`;
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500); 
    } catch (err) {
      setError('Erro ao copiar para a área de transferência do seu dispositivo.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? `✏️ Editar Manutenção #${manutencao.id}` : `Detalhes da Manutenção #${manutencao.id}`}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {isEditing ? (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Equipamento</Form.Label>
              <Form.Control 
                type="text" 
                value={editData.equipamento}
                onChange={(e) => setEditData({...editData, equipamento: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Descrição do Problema</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={editData.descricao_problema}
                onChange={(e) => setEditData({...editData, descricao_problema: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Parecer Técnico (Opcional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={editData.laudo_tecnico}
                onChange={(e) => setEditData({...editData, laudo_tecnico: e.target.value})}
              />
            </Form.Group>
          </Form>
        ) : (
          <>
            <h4>{manutencao.equipamento}</h4>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>GLPI:</strong> {manutencao.glpi || 'N/A'}</ListGroup.Item>
              <ListGroup.Item><strong>Data de Entrada:</strong> {new Date(manutencao.data_entrada).toLocaleString('pt-BR')}</ListGroup.Item>
              <ListGroup.Item><strong>Técnico Responsável:</strong> {nomeTecnico}</ListGroup.Item>
              <ListGroup.Item><strong>Status:</strong> {manutencao.status.replace('_', ' ')}</ListGroup.Item>
              <ListGroup.Item>
                <strong>Descrição do Problema:</strong>
                <p className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{manutencao.descricao_problema}</p>
              </ListGroup.Item>

              {manutencao.status === 'Concluido' && (
                <ListGroup.Item>
                  <strong>Parecer Técnico:</strong>
                  <p className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{manutencao.laudo_tecnico}</p>
                </ListGroup.Item>
              )}
            </ListGroup>

            {canFinalizar && (
              <div className="mt-3">
                <hr />
                <h5>Finalizar Manutenção</h5>
                <Form.Group>
                  <Form.Label>Parecer Técnico Final</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    value={laudo}
                    onChange={(e) => setLaudo(e.target.value)}
                    placeholder="Descreva o serviço realizado, peças trocadas, etc."
                  />
                </Form.Group>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        {isEditing ? (
          <>
            <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <PrimaryButton onClick={handleSalvarEdicao} isLoading={isSubmitting}>
              💾 Salvar Alterações
            </PrimaryButton>
          </>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={handleCopy}>
              {copiado ? '✅ Copiado!' : '📋 Copiar Resumo'}
            </Button>
            
            {canEdit && (
              <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                ✏️ Editar
              </Button>
            )}
            
            <Button variant="secondary" onClick={onHide}>Fechar</Button>
            
            {canFinalizar && (
              <PrimaryButton onClick={handleFinalizar} isLoading={isSubmitting}>
                Finalizar e Concluir
              </PrimaryButton>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DetalhesManutencaoModal;