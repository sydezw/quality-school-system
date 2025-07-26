export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: 'Secretária' | 'Gerente' | 'Admin';
  created_at: string;
  updated_at: string;
}

export interface PendingUser {
  id: string;
  nome: string;
  email: string;
  cargo: 'Secretária' | 'Gerente' | 'Admin';
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  nome: string;
  email: string;
  senha: string;
  cargo: 'Secretária' | 'Gerente' | 'Admin';
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}