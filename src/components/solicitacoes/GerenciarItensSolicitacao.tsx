import { useState } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { TrashFill, ExclamationTriangleFill, CheckCircleFill, XCircleFill, Tools } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useToast } from '../../contexts/ToastContext';

export interface SolicitacaoItemDetalhe {
  id: number;
  item_id: number;
  nome_peca: string;
  quantidade: number;
  status: 'PENDENTE' | 'APROVADO' | 'CANCELADO' | 'DEFEITO';
}

interface GerenciarItensProps {
  solicitacaoId: number;
  itensIniciais: SolicitacaoItemDetalhe[];
  statusGeralSolicitacao: string;
  onUpdate: () => void;
}

function GerenciarItensSolicitacao({ solicitacaoId, itensIniciais, statusGeralSolicitacao, onUpdate }: GerenciarItensProps) {
  const [itens, setItens] = useState<SolicitacaoItemDetalhe[]>(itensIniciais);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isCancelingAll, setIsCancelingAll] = useState(false);

  const navigate = useNavigate();
  const { confirmar } = useConfirm();
  const { mostrarCard } = useToast();

  // VARIÁVEL INTELIGENTE: Verifica se a OS está trancada
  const isOsFechada = statusGeralSolicitacao === 'CONCLUIDA' || statusGeralSolicitacao === 'CANCELADA';

  const handleCancelarItem = async (itemId: number) => {
    const confirmou = await confirmar({
      titulo: '🗑️ Cancelar Peça',
      mensagem: 'Tem certeza que deseja cancelar o pedido desta peça específica?',
      textoConfirmar: 'Sim, Cancelar',
      textoCancelar: 'Não',
      varianteBotao: 'danger'
    });

    if (!confirmou) return;
    
    setLoadingId(itemId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulando API
      setItens(itens.map(i => i.id === itemId ? { ...i, status: 'CANCELADO' } : i));
      mostrarCard('Peça Cancelada', 'Item cancelado com sucesso.', 'sucesso');
      onUpdate();
    } catch (err) {
      mostrarCard('Erro', 'Erro ao cancelar o item.', 'erro');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSinalizarDefeito = async (itemId: number) => {
    const confirmou = await confirmar({
      titulo: '⚠️ Sinalizar Defeito',
      mensagem: 'Deseja sinalizar esta peça como DEFEITUOSA? Ela voltará para o estoque isolado e ficará indisponível para uso.',
      textoConfirmar: 'Sim, Reportar Defeito',
      textoCancelar: 'Cancelar',
      varianteBotao: 'warning'
    });

    if (!confirmou) return;

    setLoadingId(itemId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando API
      setItens(itens.map(i => i.id === itemId ? { ...i, status: 'DEFEITO' } : i));
      mostrarCard('Defeito Registado', 'Peça isolada com defeito no sistema.', 'alerta');
      onUpdate();
    } catch (err) {
      mostrarCard('Erro', 'Erro ao sinalizar defeito.', 'erro');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelarTudo = async () => {
    const confirmou = await confirmar({
      titulo: '🗑️ Cancelar Toda a Solicitação',
      mensagem: 'Deseja cancelar TODOS os itens pendentes desta solicitação?',
      textoConfirmar: 'Sim, Cancelar Tudo',
      textoCancelar: 'Não',
      varianteBotao: 'danger'
    });

    if (!confirmou) return;

    setIsCancelingAll(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulando API
      setItens(itens.map(i => i.status === 'PENDENTE' ? { ...i, status: 'CANCELADO' } : i));
      mostrarCard('Solicitação Cancelada', 'Todos os itens pendentes foram cancelados.', 'sucesso');
      onUpdate();
    } catch (err) {
      mostrarCard('Erro', 'Erro ao cancelar a solicitação.', 'erro');
    } finally {
      setIsCancelingAll(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <Badge bg="warning" text="dark" className="px-2 py-1 rounded-pill shadow-sm">⏳ Pendente</Badge>;
      case 'APROVADO': return <Badge bg="success" className="px-2 py-1 rounded-pill shadow-sm"><CheckCircleFill className="me-1"/> Aprovado</Badge>;
      case 'CANCELADO': return <Badge bg="secondary" className="px-2 py-1 rounded-pill shadow-sm"><XCircleFill className="me-1"/> Cancelado</Badge>;
      case 'DEFEITO': return <Badge bg="danger" className="px-2 py-1 rounded-pill shadow-sm"><ExclamationTriangleFill className="me-1"/> Com Defeito</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const hasPendentes = itens.some(i => i.status === 'PENDENTE');

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-dark text-uppercase mb-0" style={{ letterSpacing: '0.5px' }}>
          Lista de Peças Solicitadas
        </h6>
        
        <div className="d-flex gap-2">
          {/* BOTÃO DE ATALHO PARA PRODUÇÃO (Aparece apenas quando a OS for Concluída) */}
          {statusGeralSolicitacao === 'CONCLUIDA' && (
            <Button 
              variant="success" 
              size="sm" 
              className="fw-bold rounded-pill px-3 shadow-sm d-flex align-items-center"
              onClick={() => navigate('/producao', { 
                state: { vinculo_id: solicitacaoId, tipo_vinculo: 'pecas' } 
              })}
            >
              <Tools className="me-2"/> Lançar Produção Desta OS
            </Button>
          )}

          {hasPendentes && !isOsFechada && (
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="fw-bold rounded-pill px-3 shadow-sm"
              onClick={handleCancelarTudo}
              disabled={isCancelingAll}
            >
              {isCancelingAll ? <Spinner size="sm" animation="border" /> : <><TrashFill className="me-1"/> Cancelar Solicitação</>}
            </Button>
          )}
        </div>
      </div>

      <div className="table-responsive rounded border shadow-sm">
        <Table hover className="align-middle mb-0 bg-white">
          <thead className="bg-light text-secondary">
            <tr>
              <th className="border-0 ps-3">Peça / Material</th>
              <th className="border-0 text-center">Qtd</th>
              <th className="border-0 text-center">Status do Item</th>
              <th className="border-0 text-end pe-3">Ações Lineares</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className={item.status === 'CANCELADO' ? 'opacity-50' : ''}>
                <td className="ps-3 fw-medium text-dark">{item.nome_peca}</td>
                <td className="text-center fw-bold text-primary">{item.quantidade}</td>
                <td className="text-center">{getStatusBadge(item.status)}</td>
                <td className="text-end pe-3">
                  <div className="d-flex justify-content-end gap-2">
                    
                    {item.status === 'APROVADO' && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        title={isOsFechada ? "OS Fechada. Não é possível alterar." : "Sinalizar que a peça apresentou defeito"}
                        onClick={() => handleSinalizarDefeito(item.id)}
                        disabled={loadingId === item.id || isOsFechada} // BLINDA O BOTÃO SE A OS ESTIVER FECHADA
                      >
                        {loadingId === item.id ? <Spinner size="sm" animation="border" /> : <ExclamationTriangleFill />}
                      </Button>
                    )}

                    {item.status === 'PENDENTE' && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        title={isOsFechada ? "OS Fechada. Não é possível alterar." : "Cancelar apenas este item"}
                        onClick={() => handleCancelarItem(item.id)}
                        disabled={loadingId === item.id || isOsFechada} // BLINDA O BOTÃO
                      >
                        {loadingId === item.id ? <Spinner size="sm" animation="border" /> : <TrashFill />}
                      </Button>
                    )}

                    {item.status === 'CANCELADO' && <span className="text-muted small fst-italic">Sem ações</span>}
                    {item.status === 'DEFEITO' && <span className="text-danger small fw-bold">Isolada</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default GerenciarItensSolicitacao;