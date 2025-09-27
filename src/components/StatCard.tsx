// src/components/StatCard.tsx
import React from 'react';
import { Card } from 'react-bootstrap';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string; // Emoji
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Card.Title as="h5">{title}</Card.Title>
            <Card.Text as="h3">{value}</Card.Text>
          </div>
          <div className="fs-1">{icon}</div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;