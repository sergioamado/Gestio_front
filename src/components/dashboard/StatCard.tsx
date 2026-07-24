// src/components/dashboard/StatCard.tsx
import { Card } from 'react-bootstrap';

interface StatCardProps {
  title: string;
  value: string | number;
  variant: 'unidades' | 'usuarios' | 'itens' | 'pendentes';
}

function StatCard({ title, value, variant }: StatCardProps) {
  return (
    <Card className={`text-center floating-card stat-card stat-card-${variant}`}>
      <Card.Body>
        <Card.Title as="h6">{title}</Card.Title>
        <Card.Text as="h3">{value}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default StatCard;