// src/services/servicosService.ts
import api from './api'; 
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
  //  URL ajustada para apontar direto para '/producao' igual ao backend
getHistorico: async (): Promise<ProducaoServico[]> => {
    const response = await api.get('/producao/producao');
    return response.data;
  },

  registrarProducao: async (data: any) => {
    const response = await api.post('/producao/producao', data);
    return response.data;
  },

  deleteProducao: async (id: number) => {
    await api.delete(`/producao/producao/${id}`);
  }
};