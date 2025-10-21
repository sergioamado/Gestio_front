// src/components/suprimentos/SuprimentosTable.tsx
import { Table, Badge } from 'react-bootstrap';
import type { ControleSuprimentos } from '../../types';

interface SuprimentosTableProps {
  registros: ControleSuprimentos[];
}

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(dateString));
};

function SuprimentosTable({ registros }: SuprimentosTableProps) {
  return (
    <Table striped hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Data</th>
          <th>GLPI</th>
          <th>Impressora</th>
          <th>Unidade de Imagem</th>
          <th>Toner Preto</th>
          <th>Toner Ciano</th>
          <th>Toner Magenta</th>
          <th>Toner Amarelo</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((item) => (
          <tr key={item.id}>
            <td>{formatDate(item.data)}</td>
            <td>{item.numero_glpi || 'N/A'}</td>
            <td><Badge bg="info">{item.impressora?.nome}</Badge></td>
            <td>{item.unidade_imagem_solicitadas}</td>
            <td>{item.toner_preto_solicitados}</td>
            <td>{item.toner_ciano_solicitados}</td>
            <td>{item.toner_magenta_solicitados}</td>
            <td>{item.toner_amarelo_solicitados}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default SuprimentosTable;