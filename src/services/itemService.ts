// src/services/itemService.ts
import api from './api';
import type { Item, ItemCreateData, ItemUpdateData } from '../types/index';

export const getAllItems = async (): Promise<Item[]> => {
  const response = await api.get('/itens');
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