// src/components/itens/ItensTable.tsx
import { Table, Button, Stack, Badge } from 'react-bootstrap';
import { PencilSquare, Trash3Fill, InfoCircleFill } from 'react-bootstrap-icons';
import type { Item } from '../../types';
import { useConfirm } from '../../contexts/ConfirmContext';

// PROPRIEDADES ESPERADAS PELO COMPONENTE
interface ItensTableProps {
  itens: Item[]; // A lista de itens/peças vinda do banco de dados
  onEdit?: (item: Item) => void; // Ação de editar (opcional, técnico não tem)
  onDelete?: (item: Item) => void; // Ação de excluir (opcional, técnico não tem)
  onDetails: (item: Item) => void; // Ação de ver detalhes
  canManageItems?: boolean; // Booleano mágico que esconde as colunas sensíveis aos técnicos
}

function ItensTable({ itens, onEdit, onDelete, onDetails, canManageItems = false }: ItensTableProps) {
  // Hook customizado que construímos para substituir o "window.confirm" nativo
  const { confirmar } = useConfirm();

  // Função disparada quando clicam no botão vermelho de excluir
  const handleDeleteClick = async (item: Item) => {
    if (!onDelete) return; // Se a função não foi passada (ex: usuário é técnico), trava aqui.
    
    // Abre o nosso Modal Bonito
    const confirmou = await confirmar({
      titulo: '🗑️ Excluir Item',
      mensagem: `Tem a certeza que deseja excluir o item "${item.descricao}" (SIPAC: ${item.codigo_sipac})? Esta ação removerá o item do catálogo base.`,
      textoConfirmar: 'Sim, Excluir',
      textoCancelar: 'Cancelar',
      varianteBotao: 'danger'
    });

    if (confirmou) {
      onDelete(item); // Só chama a API se o usuário disse "Sim"
    }
  };

  return (
    <Table striped hover responsive className="align-middle shadow-sm bg-white rounded">
      
      
      {/* CABEÇALHO DA TABELA                        */}
      
      <thead className="table-light">
        <tr>
          <th>Código SIPAC</th>
          <th>Especificação</th>
          {/* Se for Gestor/Admin, desenha a coluna da Distribuição de Estoque */}
          {canManageItems && <th className="text-center" style={{ minWidth: '180px' }}>Distribuição de Estoque</th>}
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      
      
      {/* CORPO DA TABELA (AS LINHAS)                */}
      
      <tbody>
        {itens.map((item) => (
          <tr key={item.id}>
            {/* 1. Código SIPAC */}
            <td className="fw-medium text-muted">{item.codigo_sipac || 'S/N'}</td>
            
            {/* 2. Nome da Peça */}
            <td style={{ minWidth: '250px' }} className="fw-medium text-uppercase text-dark">
              {item.descricao}
            </td>
            
            {/* 3. PAINEL TRIPLO DE QUANTIDADES (Só visível para Gestor/Admin) */}
            {canManageItems && (
              <td>
                <div className="d-flex flex-column gap-1" style={{ fontSize: '0.85rem' }}>
                  
                  {/* Linha A: Estoque NOVO / CONSUMO (Verde) */}
                  <div className="d-flex justify-content-between align-items-center border-bottom border-light pb-1">
                    <span className="text-secondary fw-bold">📦 Novo/Consumo:</span>
                    {/* Badge Verde se > 0, Cinza se 0 */}
                    <Badge 
                      bg={item.quantidade_estoque > 0 ? 'success' : 'secondary'} 
                      className={`px-2 ${item.quantidade_estoque > 0 ? 'bg-opacity-25 text-success border border-success' : ''}`}
                    >
                      {item.quantidade_estoque || 0}
                    </Badge>
                  </div>
                  
                  {/* Linha B: Estoque de TESTE (Azul) 
                      O title="Tooltip" mostra a localização quando o usuário passa o mouse! */}
                  <div 
                    className="d-flex justify-content-between align-items-center border-bottom border-light pb-1" 
                    title={item.localizacao_teste ? `Local: ${item.localizacao_teste}` : 'Localização da peça de teste não definida'}
                    style={{ cursor: 'help' }} // Muda o rato para um ponto de interrogação
                  >
                    <span className="text-primary fw-bold">🧪 Para Testes:</span>
                    {/* Badge Azul se > 0, Cinza Claro se 0 */}
                    <Badge 
                      bg={item.quantidade_teste > 0 ? 'primary' : 'light'} 
                      text={item.quantidade_teste > 0 ? 'white' : 'dark'} 
                      className={`px-2 border ${item.quantidade_teste > 0 ? 'border-primary' : 'border-secondary'}`}
                    >
                      {item.quantidade_teste || 0}
                    </Badge>
                  </div>
                  
                  {/* Linha C: Estoque com DEFEITO (Vermelho) */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-danger fw-bold">❌ Com Defeito:</span>
                    {/* Badge Vermelho se > 0, Cinza Claro se 0 */}
                    <Badge 
                      bg={item.quantidade_defeito > 0 ? 'danger' : 'light'} 
                      text={item.quantidade_defeito > 0 ? 'white' : 'dark'} 
                      className={`px-2 border ${item.quantidade_defeito > 0 ? 'border-danger' : 'border-secondary'}`}
                    >
                      {item.quantidade_defeito || 0}
                    </Badge>
                  </div>

                </div>
              </td>
            )}
            
            {/* 4. BOTÕES DE AÇÃO */}
            <td className="text-center">
              <Stack direction="horizontal" gap={2} className="justify-content-center">
                {/* Botão de Detalhes (Visível para todos) */}
                <Button variant="outline-info" size="sm" onClick={() => onDetails(item)} className="fw-bold text-dark shadow-sm">
                  <InfoCircleFill className="me-1"/> Detalhes
                </Button>
                
                {/* Botões de Gestão (Visível apenas se canManageItems for TRUE) */}
                {canManageItems && onEdit && onDelete && (
                  <>
                    <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)} className="fw-bold shadow-sm">
                      <PencilSquare className="me-1"/> Editar
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(item)} className="fw-bold shadow-sm">
                      <Trash3Fill className="me-1"/> Excluir
                    </Button>
                  </>
                )}
              </Stack>
            </td>
          </tr>
        ))}

        {/* 5. MENSAGEM DE TABELA VAZIA */}
        {itens.length === 0 && (
          <tr>
            {/* O colSpan estica a mensagem por todas as colunas. 
                Se o gestor estiver a ver, estica 4. Se for o técnico, estica 3. */}
            <td colSpan={canManageItems ? 4 : 3} className="text-center py-5 text-muted fst-italic bg-light">
              <span className="fs-3 d-block mb-2">📦</span>
              Nenhum item cadastrado no sistema.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default ItensTable;