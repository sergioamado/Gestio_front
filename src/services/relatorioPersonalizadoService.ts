// src/services/relatorioPersonalizadoService.ts
import api from './api';
import type { ConfigRelatorio, FonteRelatorio, ModeloRelatorio, ResultadoRelatorio } from '../types/relatorioPersonalizado';

const BASE = '/relatorios/personalizado';

export const getFontes = async (): Promise<{ fontes: FonteRelatorio[]; unidades: { id: number; nome: string }[] }> =>
  (await api.get(`${BASE}/fontes`)).data;

export const gerar = async (config: ConfigRelatorio): Promise<ResultadoRelatorio> =>
  (await api.post(`${BASE}/gerar`, config)).data;

export const getModelos = async (): Promise<ModeloRelatorio[]> => (await api.get(`${BASE}/modelos`)).data;

type DadosModelo = Pick<ModeloRelatorio, 'nome' | 'descricao' | 'compartilhado' | 'configuracao'>;

export const criarModelo = async (dados: DadosModelo): Promise<ModeloRelatorio> =>
  (await api.post(`${BASE}/modelos`, dados)).data;

export const atualizarModelo = async (id: number, dados: DadosModelo): Promise<ModeloRelatorio> =>
  (await api.put(`${BASE}/modelos/${id}`, dados)).data;

export const excluirModelo = async (id: number): Promise<void> => {
  await api.delete(`${BASE}/modelos/${id}`);
};
