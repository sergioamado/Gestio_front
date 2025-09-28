// src/components/dashboard/StatCard.tsx
import { Card } from 'react-bootstrap';

interface StatCardProps {
  title: string;
  value: string | number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    // Aplicando a classe para o efeito flutuante
    <Card className="text-center floating-card">
      <Card.Body>
        <Card.Title as="h6" className="text-muted">{title}</Card.Title>
        <Card.Text as="h3">{value}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default StatCard;