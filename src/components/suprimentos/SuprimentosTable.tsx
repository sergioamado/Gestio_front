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
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded">
      <thead className="table-light">
        <tr>
          <th>Data</th>
          <th>GLPI</th>
          <th>Impressora</th>
          <th className="text-center">Unidade de Imagem</th>
          <th className="text-center">Toner Preto</th>
          <th className="text-center">Toner Ciano</th>
          <th className="text-center">Toner Magenta</th>
          <th className="text-center">Toner Amarelo</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((item) => (
          <tr key={item.id}>
            <td className="fw-medium">{formatDate(item.data)}</td>
            <td className="fw-bold text-muted">{item.numero_glpi || 'N/A'}</td>
            <td>
              <Badge className="bg-info bg-opacity-10 text-info border border-info px-2 py-1 rounded-pill shadow-sm" style={{fontSize: '0.80rem'}}>
                {item.impressora?.nome}
              </Badge>
            </td>
            <td className="text-center">{item.unidade_imagem_solicitadas}</td>
            <td className="text-center">{item.toner_preto_solicitados}</td>
            <td className="text-center">{item.toner_ciano_solicitados}</td>
            <td className="text-center">{item.toner_magenta_solicitados}</td>
            <td className="text-center">{item.toner_amarelo_solicitados}</td>
          </tr>
        ))}
        {registros.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center py-4 text-muted fst-italic">
              Nenhum registo de suprimento encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default SuprimentosTable;