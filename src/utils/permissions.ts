// src/utils/permissions.ts
// Fonte única de "quem pode acessar o quê" no front (rotas + menu lateral).
// Atenção: isto só controla a interface. O backend precisa validar o papel em cada rota.
import type { Role, User } from '../types';

export const GESTORES: Role[] = ['admin', 'gerente'];
export const MODULO_IMPRESSORAS: Role[] = ['admin', 'gerente', 'tecnico_impressora'];
export const MODULO_ELETRONICA: Role[] = ['admin', 'gerente', 'tecnico_eletronica', 'tecnico'];
export const MODULO_PATRIMONIO: Role[] = GESTORES;
export const MODULO_ADMINISTRACAO: Role[] = GESTORES;
// Abrir OS: só técnicos (gerente gere, admin só visualiza).
export const ABRIR_SOLICITACAO: Role[] = ['tecnico', 'tecnico_impressora', 'tecnico_eletronica'];

export const hasRole = (user: User | null | undefined, roles: readonly Role[]): boolean =>
  !!user && roles.includes(user.role);
