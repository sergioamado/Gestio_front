// src/pages/Patrimonio/LevantamentoPage.tsx
import { useState } from 'react';
import { Form, Alert, Card, Button } from 'react-bootstrap';
import * as patrimonioService from '../../services/patrimonioService';

function LevantamentoPage() {
  const [tombamento, setTombamento] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [justificativa, setJustificativa] = useState('');

  const buscarPatrimonio = async () => {
    try {
      const res = await patrimonioService.conferirTombamento(tombamento, 1);
      setResultado(res);
      setJustificativa('');
    } catch (err) {
      setResultado({ status_sugerido: 'Nao Encontrado' });
    }
  };

  return (
    <Card className="floating-card">
      <Card.Header><h5>Auditoria Física de Bens</h5></Card.Header>
      <Card.Body>
        <Form.Group className="mb-4">
          <Form.Label>Número de Tombamento (SIPAC)</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Bipe ou digite o código..." 
            value={tombamento}
            onChange={(e) => setTombamento(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarPatrimonio()}
          />
        </Form.Group>

        {resultado && (
          <div className="mt-3">
            <h6>{resultado.bem?.descricao || "Bem não localizado"}</h6>
            
            {resultado.status_sugerido === 'Transferido' ? (
              <Alert variant="info">
                <strong>Status: Transferido.</strong> Este bem foi enviado para a unidade ID: {resultado.destino}.
              </Alert>
            ) : resultado.status_sugerido === 'OK' ? (
              <Alert variant="success">Bem localizado no setor.</Alert>
            ) : (
              <Alert variant="danger">
                <strong>Não Encontrado!</strong> O bem consta no PDF mas não está presente.
                <Form.Control 
                  as="textarea" 
                  className="mt-2" 
                  placeholder="Insira a justificativa obrigatória..." 
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
              </Alert>
            )}
            <Button variant="primary" className="mt-2">Confirmar Registro</Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
} 

export default LevantamentoPage;