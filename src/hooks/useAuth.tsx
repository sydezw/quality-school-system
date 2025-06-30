
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, AuthState, LoginCredentials, SignUpData } from '../types/auth';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = localStorage.getItem('ts_school_session');
      if (sessionData) {
        const { userId } = JSON.parse(sessionData);
        await loadUser(userId);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem('ts_school_session');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadUser = async (userId: string) => {
    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, cargo, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        error: null
      }));
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      localStorage.removeItem('ts_school_session');
      setState(prev => ({ ...prev, error: 'Erro ao carregar usuário', user: null }));
    }
  };

  const signIn = async ({ email, password }: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, cargo, created_at, updated_at')
        .eq('email', email)
        .eq('senha', password)
        .single();

      if (error || !user) {
        setState(prev => ({ ...prev, loading: false, error: 'Credenciais inválidas' }));
        throw new Error('Credenciais inválidas');
      }

      // Salvar sessão
      localStorage.setItem('ts_school_session', JSON.stringify({ userId: user.id }));
      
      setState(prev => ({
        ...prev,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Erro no login:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Erro no login' }));
      throw error instanceof Error ? error : new Error('Erro no login');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('ts_school_session');
    setState({
      user: null,
      loading: false,
      error: null
    });
  };

  const signUp = async (userData: SignUpData) => {
    try {
      const { error } = await supabase
        .from('usuarios_pendentes')
        .insert([userData]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já está cadastrado');
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error instanceof Error ? error : new Error('Erro ao criar conta');
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    signUp
  };
}
