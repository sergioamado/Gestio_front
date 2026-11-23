// src/config.ts
// Fonte única das URLs do backend. Defina VITE_API_URL no .env (ver .env.example).
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://10.110.1.69:3001/api';

// Raiz do servidor (sem o sufixo /api): usada pelo socket e por arquivos estáticos (fotos).
export const SERVER_URL: string = API_URL.replace(/\/api\/?$/, '');

export const fileUrl = (path?: string | null): string | undefined =>
  path ? `${SERVER_URL}/${path.replace(/^\/+/, '')}` : undefined;
