// src/components/dashboard/ChartRenderer.tsx
import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ChartRendererProps {
  tipo: 'bar' | 'line' | 'pie'; // Qual gráfico desenhar
  dados: any[];                 // Array de dados vindos da API
  eixoX: string;                // Nome da chave para a dimensão (ex: 'tecnico')
  metrica: string;              // Nome da chave para a métrica (ex: 'valor_total')
  cor?: string;                 // Cor predominante
}

const CORES_PIZZA = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6610f2'];

export default function ChartRenderer({ tipo, dados, eixoX, metrica, cor = '#0d6efd' }: ChartRendererProps) {
  
  // Se não houver dados ainda, mostra mensagem
  if (!dados || dados.length === 0) {
    return <div className="d-flex h-100 align-items-center justify-content-center text-muted">Sem dados para exibir</div>;
  }

  // Renderizador de Barras
  if (tipo === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={eixoX} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Legend />
          <Bar dataKey={metrica} fill={cor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Renderizador de Linhas
  if (tipo === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={eixoX} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={metrica} stroke={cor} strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Renderizador de Pizza
  if (tipo === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={dados} dataKey={metrica} nameKey={eixoX} cx="50%" cy="50%" outerRadius={80} label>
            {dados.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <div className="text-danger">Tipo de gráfico não suportado: {tipo}</div>;
}