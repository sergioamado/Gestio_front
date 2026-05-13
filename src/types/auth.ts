import type { User } from './usuario';

export interface AdminResetPasswordFormProps {
  users: User[];
  onSuccess: (message: string) => void;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}