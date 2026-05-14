// src/components/notificacoes/NotificacoesOffcanvas.tsx
import { Offcanvas, ListGroup, Badge, Button, Spinner } from 'react-bootstrap';
import { CheckAll, BoxSeam, Tools, BellFill, ShieldExclamation } from 'react-bootstrap-icons';
import type { Notificacao } from '../../services/notificacaoService';
import * as notificacaoService from '../../services/notificacaoService';

interface OffcanvasProps {
  show: boolean;
  onHide: () => void;
  notificacoes: Notificacao[];
  onUpdate: () => void;
  loading: boolean;
}

function NotificacoesOffcanvas({ show, onHide, notificacoes, onUpdate, loading }: OffcanvasProps) {
  
  const handleMarcarLida = async (id: number) => {
    await notificacaoService.marcarComoLida(id);
    onUpdate();
  };

  const handleMarcarTodasLidas = async () => {
    await notificacaoService.marcarTodasComoLidas();
    onUpdate();
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'OS': return <Tools className="text-primary" />;
      case 'ESTOQUE': return <BoxSeam className="text-warning" />;
      case 'ALERTA': return <ShieldExclamation className="text-danger" />;
      default: return <BellFill className="text-info" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="border-0 shadow">
      <Offcanvas.Header closeButton className="bg-light border-bottom">
        <Offcanvas.Title className="fw-bold text-dark fs-5 d-flex align-items-center">
          <BellFill className="me-2 text-primary" /> Central de Alertas
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="p-0 bg-white">
        {/* Barra de ações rápida */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
           <span className="small fw-bold text-muted text-uppercase">Recentes</span>
           <Button variant="link" size="sm" className="text-decoration-none p-0 fw-medium" onClick={handleMarcarTodasLidas}>
             <CheckAll size={18} className="me-1" /> Marcar todas lidas
           </Button>
        </div>

        {loading ? (
          <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
        ) : notificacoes.length === 0 ? (
          <div className="text-center p-5 text-muted">
             <BellFill size={40} className="opacity-25 mb-3" />
             <p className="fw-medium mb-0">Você não tem novas notificações.</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notificacoes.map(notif => (
              <ListGroup.Item 
                key={notif.id} 
                className={`p-3 border-bottom ${notif.lida ? 'bg-white opacity-75' : 'bg-light'}`}
                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                onClick={() => handleMarcarLida(notif.id)}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className={`mt-1 bg-white p-2 rounded-circle shadow-sm border`}>
                    {getIcone(notif.tipo)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className={`fw-bold ${notif.lida ? 'text-muted' : 'text-dark'}`}>{notif.titulo}</span>
                      {!notif.lida && <Badge bg="primary" pill style={{ width: '8px', height: '8px', padding: 0 }}></Badge>}
                    </div>
                    <p className="mb-1 small text-secondary lh-sm">{notif.mensagem}</p>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(notif.data_criacao)}</small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default NotificacoesOffcanvas;