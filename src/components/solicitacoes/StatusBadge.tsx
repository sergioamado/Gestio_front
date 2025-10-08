// src/components/solicitacoes/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Pendente':
        return 'status-pendente';
      case 'Em atendimento':
        return 'status-atendimento';
      case 'Concluída':
        return 'status-concluida';
      case 'Cancelada':
        return 'status-cancelada';
      default:
        return 'bg-secondary';
    }
  };

  return <span className={`status-badge ${getStatusClass()}`}>{status}</span>;
};

export default StatusBadge;