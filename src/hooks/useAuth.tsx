
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
    console.log('useAuth - checkSession iniciado');
    try {
      const sessionData = localStorage.getItem('ts_school_session');
      console.log('useAuth - sessionData:', sessionData);
      if (sessionData) {
        const { userId } = JSON.parse(sessionData);
        console.log('useAuth - userId encontrado:', userId);
        await loadUser(userId);
      } else {
        console.log('useAuth - Nenhuma sessão encontrada');
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem('ts_school_session');
    } finally {
      console.log('useAuth - Finalizando loading');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadUser = async (userId: string) => {
    console.log('useAuth - loadUser iniciado para userId:', userId);
    try {
      // Recuperar dados do usuário do localStorage para evitar problemas de RLS
      const sessionData = localStorage.getItem('ts_school_user_data');
      console.log('useAuth - user_data do localStorage:', sessionData);
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        console.log('useAuth - userData carregado:', userData);
        setState(prev => ({
          ...prev,
          user: userData,
          error: null
        }));
        return;
      }

      // Se não há dados no localStorage, limpar sessão
      console.log('useAuth - Nenhum dado de usuário encontrado, limpando sessão');
      localStorage.removeItem('ts_school_session');
      setState(prev => ({ ...prev, user: null, error: null }));
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      localStorage.removeItem('ts_school_session');
      localStorage.removeItem('ts_school_user_data');
      setState(prev => ({ ...prev, error: 'Erro ao carregar usuário', user: null }));
    }
  };

  const signIn = async ({ email, password }: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔍 Tentando login com:', { email, password });
      
      // Primeiro, vamos verificar se o usuário existe na tabela usuarios
      const { data: userCheck, error: checkError } = await supabase
        .from('usuarios')
        .select('id, nome, email, senha, cargo, created_at, updated_at')
        .eq('email', email);

      console.log('👤 Usuários encontrados:', userCheck);
      console.log('❌ Erro na busca:', checkError);

      let user = null;
      
      if (!checkError && userCheck && userCheck.length > 0) {
        user = userCheck[0];
        console.log('🔐 Comparando senhas (usuário):', { 
          senhaDigitada: password, 
          senhaBanco: user.senha,
          senhaLimpa: user.senha?.trim(),
          saoIguais: password === user.senha?.trim()
        });

        if (user.senha?.trim() !== password.trim()) {
          user = null; // Senha incorreta, vamos tentar na tabela professores
        }
      }

      // Se não encontrou na tabela usuarios ou senha incorreta, tenta na tabela professores
      if (!user) {
        const { data: professorCheck, error: profCheckError } = await supabase
          .from('professores')
          .select('id, nome, email, senha, cargo, created_at, updated_at')
          .eq('email', email)
          .eq('status', 'ativo')
          .eq('excluido', false);

        console.log('👨‍🏫 Professores encontrados:', professorCheck);
        console.log('❌ Erro na busca professor:', profCheckError);

        if (!profCheckError && professorCheck && professorCheck.length > 0) {
          const professor = professorCheck[0];
          console.log('🔐 Comparando senhas (professor):', { 
            senhaDigitada: password, 
            senhaBanco: professor.senha,
            senhaLimpa: professor.senha?.trim(),
            saoIguais: password === professor.senha?.trim()
          });

          if (professor.senha?.trim() === password.trim()) {
            user = {
              ...professor,
              cargo: professor.cargo || 'Professor'
            };
          }
        }
      }

      if (!user) {
        console.log('❌ Email não encontrado ou senha incorreta');
        setState(prev => ({ ...prev, loading: false, error: 'Email ou senha incorretos' }));
        throw new Error('Email ou senha incorretos');
      }

      console.log('✅ Login bem-sucedido!');

      if (!user) {
        setState(prev => ({ ...prev, loading: false, error: 'Credenciais inválidas' }));
        throw new Error('Credenciais inválidas');
      }

      // Salvar sessão e dados do usuário
      const userData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      
      localStorage.setItem('ts_school_session', JSON.stringify({ userId: user.id }));
      localStorage.setItem('ts_school_user_data', JSON.stringify(userData));
      
      setState(prev => ({
        ...prev,
        user: userData,
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
    try {
      // Limpar dados do localStorage
      localStorage.removeItem('ts_school_session');
      localStorage.removeItem('ts_school_user_data');
      
      // Atualizar estado
      setState({
        user: null,
        loading: false,
        error: null
      });
      
      // Redirecionar para página de autenticação
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, garantir que o usuário seja deslogado
      localStorage.removeItem('ts_school_session');
      localStorage.removeItem('ts_school_user_data');
      window.location.href = '/auth';
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      const { error } = await supabase
        .from('usuarios_pendentes')
        .insert(userData);

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
