// src/services/relatorioAnaliticoService.ts
import api from './api';
import type { ItemRelatorioAnalitico, RelatorioAnalitico, VerificacaoRelatorioAnalitico } from '../types/relatorioAnalitico';

const BASE = '/relatorios-analiticos';

export const listar = async (params?: { status?: string; ano?: string; busca?: string }): Promise<RelatorioAnalitico[]> =>
  (await api.get(BASE, { params })).data;

export const criar = async (itens: ItemRelatorioAnalitico[]): Promise<RelatorioAnalitico> =>
  (await api.post(BASE, { itens })).data;

export const atualizar = async (id: number, itens: ItemRelatorioAnalitico[]): Promise<RelatorioAnalitico> =>
  (await api.put(`${BASE}/${id}`, { itens })).data;

export const excluir = async (id: number): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};

export const cargoSugerido = async (): Promise<string> => (await api.get(`${BASE}/cargo-sugerido`)).data.cargo;

export const assinar = async (id: number, cargo: string): Promise<RelatorioAnalitico> =>
  (await api.post(`${BASE}/${id}/assinar`, { cargo })).data;

export const devolver = async (id: number, motivo: string): Promise<RelatorioAnalitico> =>
  (await api.post(`${BASE}/${id}/devolver`, { motivo })).data;

export const anular = async (id: number, motivo: string): Promise<RelatorioAnalitico> =>
  (await api.post(`${BASE}/${id}/anular`, { motivo })).data;

export const duplicar = async (id: number): Promise<RelatorioAnalitico> => (await api.post(`${BASE}/${id}/duplicar`)).data;

export const verificar = async (codigo: string): Promise<VerificacaoRelatorioAnalitico> =>
  (await api.get(`${BASE}/verificar/${encodeURIComponent(codigo.trim())}`)).data;
