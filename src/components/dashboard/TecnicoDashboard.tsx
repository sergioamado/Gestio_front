// src/components/dashboard/TecnicoDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, ListGroup, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface GraficoStatus {
  name: string;
  quantidade: number;
}

interface Estatisticas {
  os_pendentes: number;
  baixo_estoque: number;
  patrimonio_ativo: number;
  grafico_status?: GraficoStatus[];
}

interface TarefaRecente {
  id: number;
  data_solicitacao: string;
  status: string;
  numero_glpi?: string;
}

function TecnicoDashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [agenda, setAgenda] = useState<TarefaRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMinhasTarefas = async () => {
      try {
        setLoading(true);
        // Faz as duas requisições ao mesmo tempo para não travar a tela
        const [resStats, resAgenda] = await Promise.all([
          api.get('/estatisticas'),
          api.get('/solicitacoes/recentes')
        ]);
        
        setStats(resStats.data); 
        setAgenda(resAgenda.data);
      } catch (err: any) {
        console.error("Erro ao carregar tarefas do técnico", err);
        setError("Não foi possível carregar os seus dados em tempo real.");
        
        // Mock de emergência
        setStats({ os_pendentes: 3, baixo_estoque: 2, patrimonio_ativo: 0 });
        setAgenda([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMinhasTarefas();
  }, []);

  // Calcula OS concluídas olhando o gráfico que vem do backend
  const osConcluidas = stats?.grafico_status?.find(s => s.name === 'CONCLUIDA')?.quantidade || 0;

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
              ⚠️ {error} - Exibindo dados de cache.
          </Alert>
      )}

      <Row className="g-4 mb-4">
        {/* Minhas OS Pendentes */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-danger" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>OS na minha Fila</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.os_pendentes || 0}</h2>
              </div>
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-danger">🚨</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Alerta de Estoque (Para o técnico lembrar de pedir) */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-warning" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Estoque Baixo (Unid)</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{stats?.baixo_estoque || 0}</h2>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-warning">📦</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Produtividade */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
            <div className="position-absolute top-0 start-0 h-100 bg-success" style={{ width: '5px' }}></div>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>OS Concluídas</h6>
                <h2 className="fw-bold text-dark mb-0 display-5">{osConcluidas}</h2>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 text-success">🏆</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* AGENDA DINÂMICA (Vem direto do Banco de Dados) */}
        <Col md={7} lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <Card.Title className="fw-bold text-dark mb-0">Sua Agenda Recente</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              {agenda.length > 0 ? (
                <ListGroup variant="flush">
                  {agenda.map(item => (
                    <ListGroup.Item key={item.id} className="px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
                       <div className="d-flex align-items-center">
                         <div className={`bg-light p-2 rounded me-3 text-center ${item.status === 'CONCLUIDA' ? 'opacity-50' : ''}`} style={{ minWidth: '60px' }}>
                            <span className={`d-block fw-bold text-${item.status === 'CONCLUIDA' ? 'success' : 'primary'}`}>
                              #{item.id}
                            </span>
                         </div>
                         <div className={item.status === 'CONCLUIDA' ? 'opacity-50' : ''}>
                           <div className={`fw-bold ${item.status === 'CONCLUIDA' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                             {item.numero_glpi ? `Chamado GLPI: ${item.numero_glpi}` : 'OS Interna S/N'}
                           </div>
                           <small className="text-muted fw-medium">Status Atual: {item.status}</small>
                         </div>
                       </div>
                       
                       {item.status === 'CONCLUIDA' ? (
                          <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">Finalizado</Badge>
                       ) : (
                          <button 
                             className="btn btn-sm btn-primary fw-bold px-3 rounded-pill shadow-sm"
                             onClick={() => navigate('/gerenciar-solicitacoes')}
                          >
                             Ver Detalhes
                          </button>
                       )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-5 bg-light rounded border border-dashed">
                  <span className="fs-1 d-block mb-3">☕</span>
                  <h6 className="fw-bold text-dark">Nenhuma tarefa no momento!</h6>
                  <p className="mb-0 small">As suas OS recentes aparecerão aqui.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ATALHOS LATERAIS */}
        <Col md={5} lg={4}>
          <Card className="border-0 shadow-sm bg-light h-100">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold text-dark mb-4 fs-5">⚡ Atalhos Rápidos</Card.Title>
              <div className="d-flex flex-column gap-3">
                <button 
                  className="btn btn-white shadow-sm text-start py-3 fw-medium border text-dark w-100 bg-white"
                  onClick={() => navigate('/gerenciar-solicitacoes')}
                >
                  📋 Gerenciar Minhas OS
                </button>
                <button 
                  className="btn btn-white shadow-sm text-start py-3 fw-medium border text-dark w-100 bg-white"
                  onClick={() => navigate('/nova-solicitacao')}
                >
                  🛠️ Pedir Peça ao Estoque
                </button>
                <button 
                  className="btn btn-white shadow-sm text-start py-3 fw-medium border text-dark w-100 bg-white"
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