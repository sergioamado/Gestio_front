import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { WrenchAdjustable, PrinterFill, MotherboardFill, TicketDetailed, Trash } from 'react-bootstrap-icons';
import type { ProducaoServico } from '../../types';

interface ProducaoTableProps {
  historico: ProducaoServico[];
  isGestor: boolean;
  onDelete: (item: ProducaoServico) => void;
}

export default function ProducaoTable({ historico, isGestor, onDelete }: ProducaoTableProps) {
  const renderVinculo = (prod: ProducaoServico) => {
    if (prod.numero_glpi) return <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary px-2 py-1"><TicketDetailed className="me-1"/> GLPI #{prod.numero_glpi}</Badge>;
    if (prod.solicitacao_peca_id) return <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary px-2 py-1"><WrenchAdjustable className="me-1"/> OS Peças #{prod.solicitacao_peca_id}</Badge>;
    if (prod.atendimento_impr_id) return <Badge bg="info" className="bg-opacity-10 text-info border border-info px-2 py-1"><PrinterFill className="me-1"/> Impressora #{prod.atendimento_impr_id}</Badge>;
    if (prod.manutencao_eletr_id) return <Badge bg="dark" className="bg-opacity-10 text-dark border border-dark px-2 py-1"><MotherboardFill className="me-1"/> Eletrônica #{prod.manutencao_eletr_id}</Badge>;
    return <span className="text-muted small">Sem vínculo</span>;
  };

  if (historico.length === 0) {
    return (
      <div className="text-center p-5 text-muted bg-light">
         <span className="fs-1 d-block mb-3">📝</span>
         <h6 className="fw-bold text-dark">Nenhuma produção registada.</h6>
         <p className="mb-0 small">Finalize um chamado e lance aqui o serviço prestado.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th className="ps-4">Data</th>
            {isGestor && <th>Técnico</th>}
            <th>Serviço Realizado</th>
            <th>Ref. Chamado</th>
            <th className="text-end">Mão de Obra</th>
            <th className="text-end">Custo Peças</th>
            <th className="text-end fw-bold text-primary">Custo Total</th>
            <th className="text-center pe-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {historico.map((prod) => (
            <tr key={prod.id}>
              <td className="ps-4 text-muted small fw-medium">
                {new Date(prod.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              {isGestor && <td className="fw-bold text-dark small">{prod.tecnico?.nome_completo || 'Desconhecido'}</td>}
              <td>
                <div className="fw-bold text-dark small">{prod.servico?.nome_servico || 'Serviço Excluído'}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{prod.servico?.categoria}</div>
              </td>
              <td>{renderVinculo(prod)}</td>
              <td className="text-end text-muted small">R$ {Number(prod.valor_servico_aplicado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="text-end text-muted small">R$ {Number(prod.valor_pecas_aplicado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="text-end fw-bold text-success">R$ {Number(prod.valor_total_produzido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="text-center pe-4">
                <Button variant="outline-danger" size="sm" onClick={() => onDelete(prod)} className="border-0">
                  <Trash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}