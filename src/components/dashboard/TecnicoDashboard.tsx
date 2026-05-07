// src/components/dashboard/TecnicoDashboard.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, ListGroup } from 'react-bootstrap';

function TecnicoDashboard() {
  const [minhasOS, setMinhasOS] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMinhasTarefas = async () => {
      try {
        const token = localStorage.getItem('token');
        // Usamos o endpoint de estatísticas que já filtra pelo ID do técnico logado
        const response = await fetch('http://localhost:5000/api/estatisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        // Aqui você poderia ter um estado para contar as OS do técnico especificamente
        setMinhasOS(data); 
      } catch (error) {
        console.error("Erro ao carregar tarefas do técnico", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMinhasTarefas();
  }, []);

  return (
    <div>
      <Row className="g-4 mb-4">
        {/* Minha Fila: Trabalho imediato */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-danger border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Minhas OS Ativas</h6>
              <h2 className="fw-bold text-dark mb-0">12</h2> {/* Exemplo estático até vincular contador individual */}
            </Card.Body>
          </Card>
        </Col>

        {/* Pendências de Material: Itens permanentes não devolvidos ou peças aguardando */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-primary border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Aguardando Peça</h6>
              <h2 className="fw-bold text-dark mb-0">3</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Produtividade: Resumo de conclusões */}
        <Col md={4}>
          <Card className="floating-card h-100 border-start border-success border-4">
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Concluídas (Mês)</h6>
              <h2 className="fw-bold text-dark mb-0">28</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={7}>
          <Card className="floating-card">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">Minha Agenda de Hoje</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                   <div>
                     <div className="fw-bold">GLPI #12930 - Troca de Cilindro</div>
                     <small className="text-muted">Local: Biblioteca Central</small>
                   </div>
                   <button className="btn btn-sm btn-outline-primary">Iniciar</button>
                </ListGroup.Item>
                <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                   <div>
                     <div className="fw-bold">GLPI #12945 - Reparo de Nobreak</div>
                     <small className="text-muted">Local: STI / Eletrônica</small>
                   </div>
                   <button className="btn btn-sm btn-outline-primary">Iniciar</button>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="floating-card bg-light border-0">
            <Card.Body>
              <Card.Title className="fw-bold text-primary">Atalhos Técnicos</Card.Title>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-white shadow-sm text-start py-3">🛠️ Solicitar Peça ao Almoxarifado</button>
                <button className="btn btn-white shadow-sm text-start py-3">🖨️ Registrar Troca de Toner</button>
                <button className="btn btn-white shadow-sm text-start py-3">🔌 Abrir Laudo Eletrônico</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default TecnicoDashboard;