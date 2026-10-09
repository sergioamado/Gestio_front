// src/components/dashboard/WidgetContainer.tsx
import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import ChartRenderer from './ChartRenderer';
import { analiseService } from '../../services/analiseService';
import type { WidgetContainerProps } from '../../types';


export default function WidgetContainer({ widget, refreshTrigger }: WidgetContainerProps) {
  const [dados, setDados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Colocamos a função aqui dentro para o React não reclamar de dependências perdidas
    const carregarDados = async () => {
      // Pequeno truque: não ativamos o isLoading se for apenas um refresh em tempo real
      // Assim o gráfico atualiza sem ficar a piscar a bolinha de carregamento!
      if (dados.length === 0) setIsLoading(true); 
      setError(null);
      
      try {
        const resposta = await analiseService.executarConsulta({
          dataset: widget.dataset,
          dimensoes: widget.configuracao.dimensoes,
          metricas: widget.configuracao.metricas,
        });
        setDados(resposta);
      } catch (err) {
        setError("Erro ao carregar dados analíticos.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [widget, refreshTrigger]); //  Escuta o gatilho!

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
        <h6 className="fw-bold text-dark mb-0">{widget.titulo}</h6>
      </Card.Header>
      <Card.Body style={{ minHeight: '300px' }} className="d-flex flex-column justify-content-center">
        {isLoading ? (
          <div className="text-center"><Spinner animation="border" variant="primary" /></div>
        ) : error ? (
          <Alert variant="danger" className="small">{error}</Alert>
        ) : (
          <ChartRenderer 
            tipo={widget.tipo} 
            dados={dados} 
            eixoX={widget.configuracao.dimensoes[0]} 
            metrica={widget.configuracao.metricas[0]} 
          />
        )}
      </Card.Body>
    </Card>
  );
}