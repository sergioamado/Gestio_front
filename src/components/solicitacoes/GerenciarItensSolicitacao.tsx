// src/components/solicitacoes/GerenciarItensSolicitacao.tsx
import { useState } from 'react';
import { Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { TrashFill, ExclamationTriangleFill, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import PrimaryButton from '../PrimaryButton';

// Tipagem baseada na nova estrutura granular
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
  onUpdate: () => void; // Função para recarregar os dados da página
}

function GerenciarItensSolicitacao({ solicitacaoId, itensIniciais, statusGeralSolicitacao, onUpdate }: GerenciarItensProps) {
  const [itens, setItens] = useState<SolicitacaoItemDetalhe[]>(itensIniciais);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isCancelingAll, setIsCancelingAll] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: string, texto: string } | null>(null);

  // 1. Cancelar um item individualmente
  const handleCancelarItem = async (itemId: number) => {
    if (!window.confirm("Tem certeza que deseja cancelar o pedido desta peça específica?")) return;
    
    setLoadingId(itemId);
    try {
      // Simulação da chamada à API: await api.put(`/solicitacoes/${solicitacaoId}/itens/${itemId}/cancelar`);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setItens(itens.map(i => i.id === itemId ? { ...i, status: 'CANCELADO' } : i));
      setMensagem({ tipo: 'success', texto: 'Item cancelado com sucesso.' });
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao cancelar o item.' });
    } finally {
      setLoadingId(null);
    }
  };

  // 2. Sinalizar peça com defeito
  const handleSinalizarDefeito = async (itemId: number) => {
    if (!window.confirm("Deseja sinalizar esta peça como DEFEITUOSA? Ela voltará para o estoque isolado e ficará indisponível para uso.")) return;

    setLoadingId(itemId);
    try {
      // Simulação: await api.post(`/solicitacoes/${solicitacaoId}/itens/${itemId}/defeito`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItens(itens.map(i => i.id === itemId ? { ...i, status: 'DEFEITO' } : i));
      setMensagem({ tipo: 'warning', texto: 'Peça isolada com defeito no sistema.' });
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao sinalizar defeito.' });
    } finally {
      setLoadingId(null);
    }
  };

  // 3. Cancelar a solicitação inteira (todos os itens pendentes)
  const handleCancelarTudo = async () => {
    if (!window.confirm("Deseja cancelar TODOS os itens pendentes desta solicitação?")) return;

    setIsCancelingAll(true);
    try {
      // Simulação: await api.put(`/solicitacoes/${solicitacaoId}/cancelar-tudo`);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setItens(itens.map(i => i.status === 'PENDENTE' ? { ...i, status: 'CANCELADO' } : i));
      setMensagem({ tipo: 'success', texto: 'Todos os itens pendentes foram cancelados.' });
      onUpdate();
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao cancelar a solicitação.' });
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
        {hasPendentes && statusGeralSolicitacao !== 'FINALIZADA' && (
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="fw-bold rounded-pill px-3 shadow-sm"
            onClick={handleCancelarTudo}
            disabled={isCancelingAll}
          >
            {isCancelingAll ? <Spinner size="sm" animation="border" /> : <><TrashFill className="me-1"/> Cancelar Toda a Solicitação</>}
          </Button>
        )}
      </div>

      {mensagem && (
        <Alert variant={mensagem.tipo} className="border-0 shadow-sm py-2" dismissible onClose={() => setMensagem(null)}>
          {mensagem.texto}
        </Alert>
      )}

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
                    
                    {/* Ação: Sinalizar Defeito (Aparece apenas se a peça foi aprovada/entregue) */}
                    {item.status === 'APROVADO' && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        title="Sinalizar que a peça apresentou defeito"
                        onClick={() => handleSinalizarDefeito(item.id)}
                        disabled={loadingId === item.id}
                      >
                        {loadingId === item.id ? <Spinner size="sm" animation="border" /> : <ExclamationTriangleFill />}
                      </Button>
                    )}

                    {/* Ação: Cancelar Item Específico (Aparece se estiver pendente) */}
                    {item.status === 'PENDENTE' && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        title="Cancelar apenas este item"
                        onClick={() => handleCancelarItem(item.id)}
                        disabled={loadingId === item.id}
                      >
                        {loadingId === item.id ? <Spinner size="sm" animation="border" /> : <TrashFill />}
                      </Button>
                    )}

                    {/* Feedback visual se o item não tiver ações disponíveis */}
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