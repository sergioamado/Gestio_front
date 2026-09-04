// src/services/analiseService.ts
import api from './api';

export const analiseService = {
  // Busca o catálogo de datasets disponíveis
  getCatalogo: async () => {
    const response = await api.get('/analise/catalog');
    return response.data;
  },

  // Envia o JSON com as dimensões/métricas e recebe os dados prontos
  executarConsulta: async (configuracao: any) => {
    const response = await api.post('/analise/query', configuracao);
    return response.data;
  },

  // Salva o layout do dashboard
  salvarDashboard: async (dashboardData: any) => {
    const response = await api.post('/analise/dashboards', dashboardData);
    return response.data;
  },

  // Busca os dashboards salvos
  getDashboards: async () => {
    const response = await api.get('/analise/dashboards');
    return response.data;
  }
};