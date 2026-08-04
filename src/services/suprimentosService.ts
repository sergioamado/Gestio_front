// src/services/suprimentosService.ts
import api from './api';
import type { ControleSuprimentos, ControleSuprimentosCreateData, EstoqueSuprimentos } from '../types';

// Retorna o histórico de requisições feitas
export const getControleSuprimentos = async (): Promise<ControleSuprimentos[]> => {
  const response = await api.get('/gestao-impressoras/suprimentos');
  return response.data;
};

// Cria uma nova requisição, abatendo do estoque
export const createControleSuprimentos = async (data: ControleSuprimentosCreateData): Promise<ControleSuprimentos> => {
  const response = await api.post('/gestao-impressoras/suprimentos', data);
  return response.data;
};

// Retorna o estoque atual de todos os suprimentos
export const getEstoqueSuprimentos = async (): Promise<EstoqueSuprimentos> => {
    const response = await api.get('/gestao-impressoras/estoque');
    return response.data;
};

// Adiciona quantidades ao estoque (apenas admin)
export const addEstoqueSuprimentos = async (data: Partial<EstoqueSuprimentos>): Promise<EstoqueSuprimentos> => {
    const response = await api.put('/gestao-impressoras/estoque', data);
    return response.data;
};

export const getHistoricoEntradas = async () => {
  const response = await api.get('/gestao-impressoras/suprimentos/historico');
  return response.data;
};

export const corrigirEstoque = async (data: { cor: string, novaQuantidade: number, justificativa: string }) => {
  const response = await api.post('/gestao-impressoras/suprimentos/corrigir', data);
  return response.data;
};

export const reportarErroEstoque = async (data: { mensagem: string }) => {
  const response = await api.post('/gestao-impressoras/suprimentos/reportar-erro', data);
  return response.data;
};