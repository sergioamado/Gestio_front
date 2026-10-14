// src/components/suprimentos/HistoricoSuprimentosModal.tsx
import React from 'react';
import { Modal, Button, Table, Spinner, Badge } from 'react-bootstrap';

interface HistoricoSuprimentosModalProps {
  show: boolean;
  onHide: () => void;
  historicoEntradas: any[];
  loadingHistorico: boolean;
}

export default function HistoricoSuprimentosModal({ show, onHide, historicoEntradas, loadingHistorico }: HistoricoSuprimentosModalProps) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title className="fs-6 fw-bold">🕒 Histórico de Entradas e Ajustes de Suprimentos</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {loadingHistorico ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" variant="info" />
            <div className="small text-muted mt-2">Buscando histórico...</div>
          </div>
        ) : historicoEntradas.length === 0 ? (
          <div className="text-center text-muted py-4">Nenhum registro de entrada ou ajuste localizado.</div>
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="align-middle mb-0">
              <thead className="bg-light text-secondary small">
                <tr>
                  <th>Data / Hora</th>
                  <th>Operação</th>
                  <th>Cor / Suprimento</th>
                  <th className="text-center">Qtd</th>
                  <th>Responsável</th>
                  <th>Justificativa</th>
                </tr>
              </thead>
              <tbody className="small">
                {historicoEntradas.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td>{new Date(item.data_registro || item.createdAt).toLocaleString('pt-BR')}</td>
                    <td>
                      <Badge bg={item.tipo_operacao === 'CORRECAO' || item.tipo_operacao === 'CORRECAO_GESTOR' ? 'warning' : 'success'} text={item.tipo_operacao?.includes('CORRECAO') ? 'dark' : 'white'}>
                        {item.tipo_operacao || 'ENTRADA'}
                      </Badge>
                    </td>
                    <td className="fw-bold text-capitalize">{item.cor.replace('_', ' ')}</td>
                    <td className={`text-center fw-bold ${item.quantidade >= 0 ? 'text-success' : 'text-danger'}`}>
                      {item.quantidade >= 0 ? `+${item.quantidade}` : item.quantidade}
                    </td>
                    <td>{item.usuarios?.nome_completo || item.usuario?.nome_completo || 'N/A'}</td>
                    <td className="text-muted">{item.justificativa || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>Fechar</Button>
      </Modal.Footer>
    </Modal>
  );
}