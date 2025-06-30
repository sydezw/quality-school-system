export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: 'Admin' | 'Secretária' | 'Professor' | 'Coordenador';
  created_at: string;
  updated_at: string;
}

export interface PendingUser {
  id: string;
  nome: string;
  email: string;
  cargo: 'Admin' | 'Secretária' | 'Professor' | 'Coordenador';
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
  cargo: 'Admin' | 'Secretária' | 'Professor' | 'Coordenador';
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}