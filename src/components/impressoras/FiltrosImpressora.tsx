// src/components/impressoras/FiltrosImpressora.tsx
import { Card, Row, Col, Form, Button, Stack } from 'react-bootstrap';
import PrimaryButton from '../PrimaryButton';
import type { ImpressoraFiltros, Unidade } from '../../types';

interface FiltrosImpressoraProps {
  filtros: ImpressoraFiltros;
  unidades: Unidade[];
  isAdmin: boolean;
  onFiltroChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFiltrar: () => void;
  onLimparFiltros: () => void;
  isLoading: boolean;
}

export default function FiltrosImpressora({ 
  filtros, 
  unidades, 
  isAdmin, 
  onFiltroChange, 
  onFiltrar, 
  onLimparFiltros, 
  isLoading 
}: FiltrosImpressoraProps) {
  return (
    <Card className="floating-card border-0 shadow-sm mb-4 bg-white border-start border-primary border-4">
      <Card.Header className="bg-white border-bottom-0 pt-4 pb-2">
        <h5 className="fw-bold text-dark mb-0">🔍 Filtros de Pesquisa</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">IP</Form.Label>
              <Form.Control type="text" name="ip" className="bg-light border-0 shadow-none fw-medium" placeholder="Ex: 192.168.1.10" value={filtros.ip || ''} onChange={onFiltroChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">Nº de Série</Form.Label>
              <Form.Control type="text" name="numero_serie" className="bg-light border-0 shadow-none fw-medium text-uppercase" placeholder="Ex: BR12345" value={filtros.numero_serie || ''} onChange={onFiltroChange} />
            </Form.Group>
          </Col>
          
          {isAdmin && (
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary small text-uppercase">Unidade Org.</Form.Label>
                <Form.Select name="unidade_id_filtro" className="bg-light border-0 shadow-none fw-medium" value={filtros.unidade_id_filtro || ''} onChange={onFiltroChange}>
                  <option value="">Todas as Unidades</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          )}

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small text-uppercase">Políticas Aplicadas</Form.Label>
              <Form.Select name="politicas_aplicadas" className="bg-light border-0 shadow-none fw-medium" value={filtros.politicas_aplicadas || ''} onChange={onFiltroChange}>
                <option value="">Todas</option>
                <option value="true">Sim (Aplicadas)</option>
                <option value="false">Não (Pendentes)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Stack direction="horizontal" gap={2} className="mt-4 justify-content-end border-top pt-3">
          <Button variant="light" className="border shadow-sm text-secondary fw-bold" onClick={onLimparFiltros}>Limpar Filtros</Button>
          <PrimaryButton onClick={onFiltrar} isLoading={isLoading}>🔍 Filtrar</PrimaryButton>
        </Stack>
      </Card.Body>
    </Card>
  );
}