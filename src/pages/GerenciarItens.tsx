// src/pages/GerenciarItens.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { getAllItems, deleteItem } from '../services/itemService';
import type { Item } from '../services/itemService';
import ItemFormModal from '../components/ItemFormModal';

const GerenciarItens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para controlar o modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchItens = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllItems();
      setItens(data);
    } catch (err) {
      setError('Falha ao carregar itens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  const handleOpenModal = (item: Item | null) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchItens(); // Recarrega a lista de itens após salvar
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
      try {
        await deleteItem(id);
        fetchItens(); // Recarrega a lista após excluir
      } catch (err) {
        alert('Não foi possível excluir o item. Ele pode estar em uso em uma solicitação.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <>
      <h1>Gerenciar Itens do Almoxarifado</h1>
      <p>Adicione, edite ou remova itens do estoque.</p>
      <hr />
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Button className="mb-3" onClick={() => handleOpenModal(null)}>
        Adicionar Novo Item
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Código SIPAC</th>
            <th>Qtd.</th>
            <th>Preço Unit.</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map(item => (
            <tr key={item.id}>
              <td>{item.descricao}</td>
              <td>{item.codigo_sipac || 'N/A'}</td>
              <td>{item.quantidade}</td>
              <td>{`R$ ${item.preco_unitario.toFixed(2).replace('.', ',')}`}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(item)}>
                  Editar
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ItemFormModal 
        show={showModal}
        handleClose={handleCloseModal}
        onSuccess={handleSuccess}
        currentItem={selectedItem}
      />
    </>
  );
};

export default GerenciarItens;