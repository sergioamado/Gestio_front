// src/components/manutencao/ManutencaoCard.tsx
import { Card, Button, Stack } from 'react-bootstrap';
import { differenceInDays } from 'date-fns';
import type { ManutencaoEletronica } from '../../types';
import StatusBadge from '../solicitacoes/StatusBadge';
import * as manutencaoService from '../../services/manutencaoEletronicaService';
import PrimaryButton from '../PrimaryButton';
import { useAuth } from '../../hooks/useAuth';

interface ManutencaoCardProps {
  manutencao: ManutencaoEletronica;
  onDetailsClick: (manutencao: ManutencaoEletronica) => void;
  onUpdate: () => void;
}

const getDaysClass = (date: string) => {
  const days = differenceInDays(new Date(), new Date(date));
  if (days > 30) return 'card-manutencao-vencido-grave';
  if (days > 20) return 'card-manutencao-vencido';
  if (days > 10) return 'card-manutencao-alerta';
  return 'card-manutencao-normal';
};

function ManutencaoCard({ manutencao, onDetailsClick, onUpdate }: ManutencaoCardProps) {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'tecnico_eletronica';

  const handleIniciar = async () => {
    if (window.confirm(`Tem a certeza que deseja iniciar a manutenção do equipamento "${manutencao.equipamento}"?`)) {
      await manutencaoService.iniciarManutencao(manutencao.id);
      onUpdate();
    }
  };

  return (
    <Card className={`floating-card h-100 ${getDaysClass(manutencao.data_entrada)}`}>
      <Card.Body className="d-flex flex-column">
        <Stack direction="horizontal" className="mb-2">
          <Card.Title className="mb-0">{manutencao.equipamento}</Card.Title>
          <div className="ms-auto"><StatusBadge status={manutencao.status.replace('_', ' ')} /></div>
        </Stack>
        <Card.Text className="text-muted small">GLPI: {manutencao.glpi || 'N/A'} | Entrada: {new Date(manutencao.data_entrada).toLocaleDateString('pt-BR')}</Card.Text>
        <Card.Text>
          {manutencao.status === 'Pendente' 
            ? <span className="text-muted">Aguardando atribuição...</span>
            : `Em manutenção por: ${manutencao.tecnico_responsavel?.nome_completo || 'N/A'}`
          }
        </Card.Text>
        <Stack direction="horizontal" gap={2} className="mt-auto">
          <Button variant="outline-secondary" size="sm" onClick={() => onDetailsClick(manutencao)}>Ver Detalhes</Button>
          {canManage && manutencao.status === 'Pendente' && (
            <PrimaryButton size="sm" onClick={handleIniciar}>Iniciar Manutenção</PrimaryButton>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export default ManutencaoCard;