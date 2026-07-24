// src/components/solicitacoes/StatusBadge.tsx
import React from 'react';
import { Badge } from 'react-bootstrap';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status?.toUpperCase() || '';

  if (s === 'PENDENTE') {
    return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">⏳ Pendente</Badge>;
  }
  if (s === 'EM ATENDIMENTO' || s === 'EM_ATENDIMENTO') {
    return <Badge bg="info" className="px-3 py-2 rounded-pill shadow-sm text-white">🛠️ Em Atendimento</Badge>;
  }
  if (s === 'CONCLUIDA' || s === 'CONCLUÍDA') {
    return <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">✅ Concluída</Badge>;
  }
  if (s === 'CANCELADA') {
    return <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm">❌ Cancelada</Badge>;
  }

  return <Badge bg="secondary" className="px-3 py-2 rounded-pill shadow-sm">{status}</Badge>;
};

export default StatusBadge;