// src/components/manutencao/ManutencaoCard.tsx
import React from 'react';
import { Card, Button, Stack, Badge } from 'react-bootstrap';
import { differenceInDays } from 'date-fns';
import type { ManutencaoEletronica } from '../../types';
import * as manutencaoService from '../../services/manutencaoEletronicaService';
import PrimaryButton from '../PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import type { ManutencaoCardProps } from '../../types/manutencao';

const getUrgencyConfig = (date: string, status: string) => {
  if (status === 'Concluido') {
    return { border: 'border-success', badgeClass: 'bg-success bg-opacity-10 text-success border border-success', text: 'Finalizado', icon: '✅' };
  }
  const days = differenceInDays(new Date(), new Date(date));
  if (days > 30) return { border: 'border-danger', badgeClass: 'bg-danger bg-opacity-10 text-danger border border-danger fw-bold', text: `Crítico (${days}d)`, icon: '🚨' };
  if (days > 15) return { border: 'border-warning', badgeClass: 'bg-warning bg-opacity-10 text-dark border border-warning fw-bold', text: `Atrasado (${days}d)`, icon: '⚠️' };
  return { border: 'border-primary', badgeClass: 'bg-primary bg-opacity-10 text-primary border border-primary fw-bold', text: `No prazo (${days}d)`, icon: '⏳' };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Pendente': return <Badge bg="warning" text="dark" className="px-2 py-1 rounded-pill shadow-sm" style={{fontSize: '0.75rem'}}>⏳ Pendente</Badge>;
    case 'Em_manutencao': return <Badge bg="info" text="dark" className="px-2 py-1 rounded-pill shadow-sm" style={{fontSize: '0.75rem'}}>🛠️ Em Bancada</Badge>;
    case 'Concluido': return <Badge bg="success" className="px-2 py-1 rounded-pill shadow-sm" style={{fontSize: '0.75rem'}}>✅ Concluído</Badge>;
    default: return <Badge bg="secondary" className="px-2 py-1 rounded-pill shadow-sm" style={{fontSize: '0.75rem'}}>{status}</Badge>;
  }
};

function ManutencaoCard({ manutencao, onDetailsClick, onUpdate }: ManutencaoCardProps) {
  const { user } = useAuth();
  const { mostrarCard } = useToast(); 
  const { confirmar } = useConfirm();
  const canManage = user?.role === 'admin' || user?.role === 'tecnico_eletronica';
  const urgency = getUrgencyConfig(manutencao.data_entrada, manutencao.status);

  // Tratamento seguro para relacionamentos do backend
  const glpiValue = (manutencao as any).numero_glpi || (manutencao as any).glpi || 'N/A';
  const nomeTecnico = (manutencao as any).usuarios?.nome_completo || 'Aguardando Atribuição';
  const nomeAbertura = (manutencao as any).aberto_por?.nome_completo || 'Não Informado';

  const handleIniciar = async () => {
    const utilizadorConfirmou = await confirmar({
      titulo: '🚀 Iniciar Manutenção',
      mensagem: `Deseja assumir a responsabilidade e iniciar o reparo do equipamento "${manutencao.equipamento}"?`,
      textoConfirmar: 'Sim, Iniciar',
      textoCancelar: 'Cancelar',
      varianteBotao: 'primary'
    });

    if (utilizadorConfirmou) {
      try {
        await manutencaoService.iniciarManutencao(manutencao.id);
        mostrarCard('Manutenção Iniciada', 'Você agora é o responsável por este equipamento.', 'sucesso'); 
        onUpdate();
      } catch (error) {
        mostrarCard('Erro', 'Não foi possível iniciar a manutenção.', 'erro');
      }
    }
  };

  // 🚀 Fallback Universal para Copiar Resumo (Eletrônica #4)
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const summary = `[Manutenção Eletrônica]\nGLPI: ${glpiValue}\nEquipamento: ${manutencao.equipamento}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(summary);
      mostrarCard('Copiado', 'Resumo copiado com sucesso!', 'info');
    } else {
      // Método seguro para HTTP (IP local)
      const textArea = document.createElement("textarea");
      textArea.value = summary;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        mostrarCard('Copiado', 'Resumo copiado com sucesso!', 'info');
      } catch (err) {
        mostrarCard('Erro', 'O seu navegador bloqueou a cópia automática.', 'erro');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Card className={`floating-card h-100 border-0 shadow-sm border-start border-4 ${urgency.border} bg-white transition-hover`}>
      <Card.Body className="d-flex flex-column p-3">
        
        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
          <div>
            {/* 🚀 Nome do equipamento em maiúsculas (Eletrônica #5) */}
            <Card.Title className="fw-bold text-dark mb-1 lh-sm text-uppercase" style={{fontSize: '0.95rem'}}>
              {manutencao.equipamento}
            </Card.Title>
            <div className="text-muted fw-bold text-uppercase d-flex align-items-center" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
              GLPI: <span className="text-primary ms-1 me-2">{glpiValue}</span>
              <Button variant="link" className="p-0 text-secondary text-decoration-none" onClick={handleCopy} title="Copiar Resumo">
                📋
              </Button>
            </div>
          </div>
          <div className="text-end">{getStatusBadge(manutencao.status)}</div>
        </div>
        
        <div className="mb-3 p-2 rounded bg-light border border-light-subtle">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Entrada</span>
            <span className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>{new Date(manutencao.data_entrada).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center pt-1 border-top border-secondary-subtle">
             <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Decorrido</span>
             <span className={`badge ${urgency.badgeClass} rounded-pill px-2 py-1`} style={{ fontSize: '0.65rem' }}>
                {urgency.icon} {urgency.text}
             </span>
          </div>
        </div>

        {/* 🚀 Exibição de quem abriu e do técnico (Eletrônica #7) */}
        <div className="text-secondary flex-grow-1 bg-white mb-2" style={{fontSize: '0.8rem'}}>
          <div className="d-flex flex-column gap-1 bg-light p-2 rounded border border-light-subtle">
            <div className="text-truncate">
              <span className="me-1">📝</span> 
              <strong className="text-dark">Aberto por:</strong> {nomeAbertura}
            </div>
            <div className="text-truncate">
              <span className="me-1">🛠️</span> 
              <strong className="text-dark">Técnico:</strong> {manutencao.status === 'Pendente' ? (
                <span className="fst-italic text-muted">Aguardando...</span>
              ) : (
                nomeTecnico
              )}
            </div>
          </div>
        </div>

        <Stack direction="horizontal" gap={2} className="mt-auto pt-2 border-top">
          <Button variant="outline-primary" size="sm" className="fw-bold w-100 shadow-sm" onClick={() => onDetailsClick(manutencao)}>
            🔍 Detalhes
          </Button>
          {canManage && manutencao.status === 'Pendente' && (
            <PrimaryButton size="sm" className="w-100 fw-bold shadow-sm" onClick={handleIniciar}>
              🚀 Iniciar
            </PrimaryButton>
          )}
        </Stack>
        
      </Card.Body>
    </Card>
  );
}

export default ManutencaoCard;