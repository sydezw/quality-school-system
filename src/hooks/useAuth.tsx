
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Verificar se o usuário existe na tabela usuarios
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single();

      if (userError || !usuario) {
        return { error: { message: 'Email ou senha incorretos' } };
      }

      // Criar uma sessão simulada para o usuário autenticado
      const mockUser: User = {
        id: usuario.id.toString(),
        aud: 'authenticated',
        role: 'authenticated',
        email: usuario.email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          nome: usuario.nome,
          cargo: usuario.cargo
        },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mockUser
      };

      // Atualizar o estado manualmente
      setUser(mockUser);
      setSession(mockSession);
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    try {
      // Limpar o estado local primeiro
      setUser(null);
      setSession(null);
      
      // Tentar fazer signOut do Supabase (pode falhar se não houver sessão real)
      await supabase.auth.signOut();
    } catch (error) {
      // Ignorar erros do signOut já que estamos usando autenticação customizada
      console.log('SignOut completed');
    } finally {
      // Redirecionar para login
      window.location.href = '/login';
    }
  };

  return (
      <AuthContext.Provider value={{
        user,
        session,
        loading,
        signIn,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
