export type Role = 'admin' | 'gerente' | 'tecnico' | 'tecnico_impressora' | 'tecnico_eletronica';

export interface User {
  id: number;
  username: string;
  nome_completo: string;
  role: Role;
  telefone?: string | null;
  email?: string | null;   
  unidade_id: number | null;
  unidades_organizacionais?: {
    nome: string;
  };
}

export type UserCreateData = Omit<User, 'id' | 'unidades_organizacionais'> & { password?: string };
export type UserUpdateData = Omit<User, 'id' | 'username' | 'unidades_organizacionais' | 'password'>;