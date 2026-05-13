// src/components/dashboard/TecnicoDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, ListGroup, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface EstatisticasTecnico {
  minhas_os_ativas: number;
  aguardando_peca: number;
  concluidas_mes: number;
}

function TecnicoDashboard() {
  const [stats, setStats] = useState<EstatisticasTecnico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMinhasTarefas = async () => {
      try {
        setLoading(true);
        // O endpoint de estatísticas já deve filtrar pelo ID do técnico logado no backend
        const response = await api.get('/estatisticas');
        setStats(response.data); 
      } catch (err: any) {
        console.error("Erro ao carregar tarefas do técnico", err);
        setError("Não foi possível carregar os seus dados em tempo real.");
        // Mock de dados para visualização enquanto o endpoint é finalizado
        setStats({ minhas_os_ativas: 12, aguardando_peca: 3, concluidas_mes: 28 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMinhasTarefas();
  }, []);

  if (loading) {
    return (
        <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted fw-medium">Carregando sua mesa de trabalho...</div>
        </div>
    );
  }

  return (
    <div>
      {error && (
          <Alert variant="warning" className="shadow-sm border-0 mb-4" dismissible onClose={() => setError(null)}>
              ⚠️ {error} - Exibindo dados simulados de teste.
          </Alert>
      )}

      <Row className="g-4 mb-4">
        {/* Minha Fila: Trabalho imediato */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-danger" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Minhas OS Ativas</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.minhas_os_ativas || 0}</h2>
              </div>
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-danger">🚨</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Pendências de Material: Itens permanentes não devolvidos ou peças aguardando */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-primary" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Aguardando Peça</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.aguardando_peca || 0}</h2>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-primary">📦</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Produtividade: Resumo de conclusões */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-success" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Concluídas (Mês)</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.concluidas_mes || 0}</h2>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-success">🏆</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={7} lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <Card.Title className="fw-bold text-dark mb-0">Sua Agenda de Hoje</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
                   <div className="d-flex align-items-center">
                     <div className="bg-light p-2 rounded me-3 text-center" style={{ minWidth: '55px' }}>
                        <span className="d-block fw-bold text-primary">#12930</span>
                     </div>
                     <div>
                       <div className="fw-bold text-dark">Troca de Cilindro (Impressora)</div>
                       <small className="text-muted">📍 Local: Biblioteca Central</small>
                     </div>
                   </div>
                   <button 
                      className="btn btn-sm btn-primary fw-bold px-3 rounded-pill"
                      onClick={() => navigate('/atendimentos')}
                   >
                       Iniciar
                   </button>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
                   <div className="d-flex align-items-center">
                     <div className="bg-light p-2 rounded me-3 text-center" style={{ minWidth: '55px' }}>
                        <span className="d-block fw-bold text-primary">#12945</span>
                     </div>
                     <div>
                       <div className="fw-bold text-dark">Reparo de Nobreak</div>
                       <small className="text-muted">📍 Local: STI / Eletrônica</small>
                     </div>
                   </div>
                   <button 
                      className="btn btn-sm btn-primary fw-bold px-3 rounded-pill"
                      onClick={() => navigate('/fila-manutencao-eletronica')}
                   >
                       Iniciar
                   </button>
                </ListGroup.Item>
                
                {/* Exemplo de item concluído */}
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center">
                   <div className="d-flex align-items-center opacity-75">
                     <div className="bg-light p-2 rounded me-3 text-center" style={{ minWidth: '55px' }}>
                        <span className="d-block fw-bold text-success">#12901</span>
                     </div>
                     <div>
                       <div className="fw-bold text-decoration-line-through text-muted">Manutenção Preventiva Lab 01</div>
                       <small className="text-muted">📍 Local: DCOMP</small>
                     </div>
                   </div>
                   <Badge bg="success" className="px-3 py-2 rounded-pill">Finalizado</Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} lg={4}>
          <Card className="border-0 shadow-sm bg-light h-100">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold text-dark mb-4 fs-5">⚡ Atalhos Rápidos</Card.Title>
              <div className="d-flex flex-column gap-3">
                <button 
                  className="btn btn-white shadow-sm text-start py-3 fw-medium border text-dark w-100"
                  onClick={() => navigate('/nova-solicitacao')}
                >
                  🛠️ Solicitar Peça ao Estoque
                </button>
                <button 
                  className="btn btn-white shadow-sm text-start py-3 fw-medium border text-dark w-100"
                  onClick={() => navigate('/suprimentos')}
                >
                  🖨️ Registrar Troca de Toner
                </button>
                <button 
                  className="btn btn-white shadow-sm text-start py-3 fw-medium border text-dark w-100"
                  onClick={() => navigate('/fila-manutencao-eletronica')}
                >
                  🔌 Fila de Eletrônica
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default TecnicoDashboard;