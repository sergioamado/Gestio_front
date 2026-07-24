// src/components/manutencao/DetalhesManutencaoModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Form, Alert, Badge } from 'react-bootstrap';
import type { ManutencaoEletronica } from '../../types';
import PrimaryButton from '../PrimaryButton';
import * as manutencaoService from '../../services/manutencaoEletronicaService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

interface DetalhesModalProps {
  show: boolean;
  onHide: () => void;
  manutencao: ManutencaoEletronica;
  onUpdate: () => void;
}

function DetalhesManutencaoModal({ show, onHide, manutencao, onUpdate }: DetalhesModalProps) {
  const { user } = useAuth();
  const { mostrarCard } = useToast();
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

  // Tratamento seguro para os nomes e GLPI
  const glpiValue = (manutencao as any).numero_glpi || (manutencao as any).glpi || 'N/A';
  const nomeTecnico = (manutencao as any).usuarios?.nome_completo || 'Aguardando Atribuição';
  const nomeAbertura = (manutencao as any).aberto_por?.nome_completo || 'Não Informado';

  const canFinalizar = manutencao.status === 'Em_manutencao' && manutencao.tecnico_responsavel_id === user?.id;
  
  // 🚀 Regra de Negócio de Edição (Eletrônica #2)
  const isCriador = (manutencao as any).aberto_por_id === user?.id;
  const isResponsavel = manutencao.tecnico_responsavel_id === user?.id;
  const isAdminOrGerente = user?.role === 'admin' || user?.role === 'gerente';
  
  // O utilizador pode editar se for Admin/Gerente, ou se for o Técnico Responsável, 
  // ou se for quem abriu O CHAMADO E este ainda estiver 'Pendente'.
  const canEdit = isAdminOrGerente || isResponsavel || (isCriador && manutencao.status === 'Pendente');

  const handleFinalizar = async () => {
    if (!laudo) {
      setError('O parecer técnico é obrigatório para finalizar a manutenção.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await manutencaoService.finalizarManutencao(manutencao.id, laudo);
      mostrarCard('Manutenção Finalizada', 'O equipamento foi dado como concluído.', 'sucesso');
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
      setError('O Nome do Equipamento e a Descrição do Problema são obrigatórios.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await manutencaoService.editarManutencao(manutencao.id, editData);
      mostrarCard('Sucesso', 'As informações da manutenção foram atualizadas.', 'sucesso');
      setIsEditing(false);
      onUpdate(); 
    } catch (err) {
      setError('Erro ao salvar as edições.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 🚀 Fallback Universal para Copiar Resumo (Eletrônica #4)
  const handleCopy = () => {
    const summary = `[Resumo Manutenção Eletrônica]\nID: ${manutencao.id}\nGLPI: ${glpiValue}\nEquipamento: ${manutencao.equipamento}\nProblema: ${manutencao.descricao_problema}\nAberto por: ${nomeAbertura}\nTécnico: ${nomeTecnico}\nStatus: ${manutencao.status.replace('_', ' ')}\nParecer: ${manutencao.laudo_tecnico || laudo || 'N/A'}`;
    
    const onCopySuccess = () => {
      setCopiado(true);
      mostrarCard('Copiado', 'Resumo copiado para a área de transferência!', 'info');
      setTimeout(() => setCopiado(false), 2500); 
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(summary)
        .then(onCopySuccess)
        .catch(() => mostrarCard('Erro', 'O navegador bloqueou a cópia.', 'erro'));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = summary;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        onCopySuccess();
      } catch (err) {
        mostrarCard('Erro', 'Erro ao copiar para a área de transferência.', 'erro');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light border-bottom-0 pb-4">
        <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
          {isEditing ? `✏️ Editar Manutenção #${manutencao.id}` : `🔍 Detalhes da Manutenção #${manutencao.id}`}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-0 bg-light">
        {error && <Alert variant="danger" className="shadow-sm border-0">{error}</Alert>}

        {isEditing ? (
          <Form className="bg-white p-4 rounded shadow-sm">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary small text-uppercase">Equipamento</Form.Label>
              <Form.Control 
                type="text" 
                className="bg-light border-0 shadow-none text-uppercase"
                value={editData.equipamento}
                onChange={(e) => setEditData({...editData, equipamento: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary small text-uppercase">Descrição do Problema</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                className="bg-light border-0 shadow-none"
                value={editData.descricao_problema}
                onChange={(e) => setEditData({...editData, descricao_problema: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary small text-uppercase">Parecer Técnico Inicial (Opcional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                className="bg-light border-0 shadow-none"
                value={editData.laudo_tecnico}
                onChange={(e) => setEditData({...editData, laudo_tecnico: e.target.value})}
              />
            </Form.Group>
          </Form>
        ) : (
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="p-3 border-bottom bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0 text-uppercase">{manutencao.equipamento}</h5>
              <Badge bg={manutencao.status === 'Concluido' ? 'success' : manutencao.status === 'Pendente' ? 'warning' : 'info'} text={manutencao.status === 'Pendente' ? 'dark' : 'white'} className="px-3 py-2 rounded-pill shadow-sm">
                {manutencao.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                <span className="text-muted fw-bold">Nº GLPI:</span> 
                <span className="fw-bold text-primary">{glpiValue}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                <span className="text-muted fw-bold">Data de Entrada:</span> 
                <span className="fw-medium">{new Date(manutencao.data_entrada).toLocaleString('pt-BR')}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                <span className="text-muted fw-bold">Aberto por:</span> 
                <span className="fw-medium text-dark">{nomeAbertura}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                <span className="text-muted fw-bold">Técnico Responsável:</span> 
                <span className="fw-bold text-dark">{nomeTecnico}</span>
              </ListGroup.Item>
              
              <ListGroup.Item className="px-4 py-3 bg-light">
                <span className="text-muted fw-bold d-block mb-2">Descrição do Problema:</span>
                <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{manutencao.descricao_problema}</p>
              </ListGroup.Item>

              {manutencao.status === 'Concluido' && (
                <ListGroup.Item className="px-4 py-3 bg-success bg-opacity-10 border-top border-success border-opacity-25">
                  <span className="text-success fw-bold d-block mb-2 d-flex align-items-center">✅ Parecer Técnico Final:</span>
                  <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{manutencao.laudo_tecnico}</p>
                </ListGroup.Item>
              )}
            </ListGroup>

            {canFinalizar && (
              <div className="p-4 border-top bg-light">
                <h6 className="fw-bold text-primary mb-3">🛠️ Finalizar Manutenção</h6>
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary">Parecer Técnico Final *</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    className="border-0 shadow-sm"
                    value={laudo}
                    onChange={(e) => setLaudo(e.target.value)}
                    placeholder="Descreva detalhadamente o serviço realizado, peças trocadas ou configurações alteradas..."
                  />
                </Form.Group>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-0">
        {isEditing ? (
          <>
            <Button variant="outline-secondary" className="fw-bold border-0" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <PrimaryButton onClick={handleSalvarEdicao} isLoading={isSubmitting} className="shadow-sm">
              💾 Salvar Alterações
            </PrimaryButton>
          </>
        ) : (
          <>
            <Button variant="outline-secondary" className="fw-bold border-0 me-auto" onClick={handleCopy}>
              {copiado ? '✅ Copiado!' : '📋 Copiar Resumo'}
            </Button>
            
            {canEdit && (
              <Button variant="outline-primary" className="fw-bold shadow-sm" onClick={() => setIsEditing(true)}>
                ✏️ Editar Chamado
              </Button>
            )}
            
            <Button variant="secondary" className="fw-bold shadow-sm" onClick={onHide}>Fechar</Button>
            
            {canFinalizar && (
              <PrimaryButton onClick={handleFinalizar} isLoading={isSubmitting} variant="success" className="shadow-sm">
                ✅ Finalizar e Concluir
              </PrimaryButton>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DetalhesManutencaoModal;