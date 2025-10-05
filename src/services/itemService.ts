// src/services/itemService.ts
import api from './api';
import type { Item, ItemCreateData, ItemUpdateData } from '../types/index';

export const getAllItems = async (unidadeId?: number | null): Promise<Item[]> => {
  const params = unidadeId ? { unidadeId } : {};
  const response = await api.get('/itens', { params });
  return response.data;
};

export const createItem = async (itemData: ItemCreateData): Promise<Item> => {
  const response = await api.post('/itens', itemData);
  return response.data;
};

export const updateItem = async (id: number, itemData: ItemUpdateData): Promise<Item> => {
  const response = await api.put(`/itens/${id}`, itemData);
  return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/itens/${id}`);
};