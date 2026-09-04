// src/services/servicosService.ts
import api from './api'; // Ajuste o caminho do seu axios se necessário
import type { CatalogoServico, ProducaoServico } from '../types';

export const servicosService = {
  // --- CATÁLOGO ---
  getCatalogo: async (): Promise<CatalogoServico[]> => {
    const response = await api.get('/servicos/catalogo');
    return response.data;
  },
  
  createServico: async (data: Partial<CatalogoServico>) => {
    const response = await api.post('/servicos/catalogo', data);
    return response.data;
  },

  updateServico: async (id: number, data: Partial<CatalogoServico>) => {
    const response = await api.put(`/servicos/catalogo/${id}`, data);
    return response.data;
  },

  // --- PRODUÇÃO ---
  getHistorico: async (): Promise<ProducaoServico[]> => {
    const response = await api.get('/servicos/producao');
    return response.data;
  },

  registrarProducao: async (data: any) => {
    const response = await api.post('/servicos/producao', data);
    return response.data;
  },

  deleteProducao: async (id: number) => {
    await api.delete(`/servicos/producao/${id}`);
  }
};