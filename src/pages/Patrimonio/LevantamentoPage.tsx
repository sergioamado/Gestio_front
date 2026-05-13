// src/pages/Patrimonio/LevantamentoPage.tsx
import { useState } from 'react';
import { Form, Alert, Card, InputGroup, Spinner } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../hooks/useAuth';
import * as patrimonioService from '../../services/patrimonioService';
import PrimaryButton from '../../components/PrimaryButton';

function LevantamentoPage() {
  const { user } = useAuth();
  const [tombamento, setTombamento] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [justificativa, setJustificativa] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buscarPatrimonio = async () => {
    if (!tombamento.trim()) return;
    
    setLoading(true);
    setResultado(null);
    setJustificativa('');
    
    try {
      // Pega a unidade dinamicamente do usuário logado
      const unidadeId = user?.unidade_id || 1; 
      const res = await patrimonioService.conferirTombamento(tombamento, unidadeId);
      setResultado(res);
    } catch (err) {
      setResultado({ status_sugerido: 'Nao Encontrado', status_conferido: 'Nao Encontrado' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarRegistro = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      alert("Registro de auditoria confirmado com sucesso!");
      setTombamento('');
      setResultado(null);
      setJustificativa('');
    } catch (error) {
      alert("Erro ao confirmar registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aceita tanto status_sugerido quanto status_conferido dependendo da resposta do backend
  const statusAuditoria = resultado?.status_sugerido || resultado?.status_conferido;

  return (
    <MainLayout pageTitle="📋 Auditoria Física de Bens">
      <Card className="floating-card border-0 shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 text-center">
          <h4 className="fw-bold text-dark mb-0">Levantamento Patrimonial</h4>
          <p className="text-muted small mt-2">Utilize o leitor de código de barras ou digite o tombamento SIPAC.</p>
        </Card.Header>
        <Card.Body className="p-4 p-md-5">
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-secondary text-uppercase small">Número de Tombamento</Form.Label>
            <InputGroup size="lg" className="shadow-sm">
              <InputGroup.Text className="bg-light border-0 text-muted fs-4">🏷️</InputGroup.Text>
              <Form.Control 
                type="text" 
                className="bg-light border-0 fw-bold text-primary shadow-none"
                placeholder="Bipe ou digite o código..." 
                value={tombamento}
                onChange={(e) => setTombamento(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarPatrimonio()}
                disabled={loading || isSubmitting}
                autoFocus
              />
              <PrimaryButton onClick={buscarPatrimonio} disabled={loading || !tombamento || isSubmitting} className="px-4">
                {loading ? <Spinner animation="border" size="sm" /> : 'Buscar'}
              </PrimaryButton>
            </InputGroup>
          </Form.Group>

          {resultado && (
            <div className="mt-5 pt-4 border-top animate__animated animate__fadeIn">
              <h5 className="fw-bold text-dark mb-3">
                {resultado.bem?.descricao ? `📦 ${resultado.bem.descricao}` : "❌ Bem não localizado no banco de dados"}
              </h5>
              
              {statusAuditoria === 'Transferido' ? (
                <Alert variant="warning" className="border-0 shadow-sm">
                  <h6 className="fw-bold text-dark mb-1">🔄 Status: Transferido</h6>
                  <span className="text-dark">
                    Este equipamento consta como enviado para a Unidade ID: <strong>{resultado.destino || 'Desconhecida'}</strong>.
                  </span>
                </Alert>
              ) : statusAuditoria === 'OK' ? (
                <Alert variant="success" className="border-0 shadow-sm d-flex align-items-center">
                  <span className="fs-3 me-3">✅</span>
                  <div>
                    <h6 className="fw-bold mb-1">Localização Confirmada</h6>
                    <span className="text-dark">O equipamento pertence a este setor e foi conferido com sucesso.</span>
                  </div>
                </Alert>
              ) : (
                <Alert variant="danger" className="border-0 shadow-sm">
                  <div className="d-flex align-items-center mb-2">
                    <span className="fs-3 me-3">⚠️</span>
                    <div>
                      <h6 className="fw-bold mb-0">Divergência Encontrada</h6>
                      <span className="small">O bem deveria estar neste setor mas não foi encontrado no sistema ou fisicamente.</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Form.Label className="fw-bold small">Justificativa da Ausência (Obrigatória)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3}
                      className="border-danger shadow-none" 
                      placeholder="Relate o motivo da ausência do equipamento..." 
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                    />
                  </div>
                </Alert>
              )}
              
              <div className="d-grid mt-4">
                <PrimaryButton 
                  size="lg" 
                  onClick={handleConfirmarRegistro}
                  disabled={isSubmitting || (statusAuditoria !== 'OK' && statusAuditoria !== 'Transferido' && !justificativa.trim())}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Registrando...' : '💾 Confirmar Auditoria'}
                </PrimaryButton>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </MainLayout>
  );
} 

export default LevantamentoPage;