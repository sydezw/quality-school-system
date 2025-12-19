import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Listas estáticas para evitar recriação a cada render
const PROFESSOR_ALLOWED_PATHS = [
  '/teacher-classes',
  '/lessons',
  '/my-students'
];

const PROFESSOR_RESTRICTED_PATHS = [
  '/dashboard',
  '/students',
  '/financial',
  '/plans',
  '/materials',
  '/rooms',
  '/teachers',
  '/documents',
  '/agenda',
  '/responsibles',
  '/classes',
  '/contracts',

  '/reports',
  '/birthdays',
  '/approve-logins'
];

// Rotas restritas para administradores
const ADMIN_RESTRICTED_PATHS = [
  '/teacher-classes' // Administradores não podem acessar "Minhas Turmas"
];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresProfessor?: boolean;
}

export function ProtectedRoute({ children, requiresProfessor = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Aguardar carregamento completo do contexto
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Verificar autenticação
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const isProfessor = user.cargo === 'Professor';
  const isAdmin = user.cargo === 'Admin';
  const currentPath = location.pathname;

  // Se a rota requer professor e o usuário não é professor
  if (requiresProfessor && !isProfessor) {
    return <Navigate to="/dashboard" replace />;
  }

  // Lógica de proteção para administradores
  if (isAdmin) {
    // Bloquear rotas restritas para administradores (como "Minhas Turmas")
    if (ADMIN_RESTRICTED_PATHS.includes(currentPath)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Lógica de proteção para professores
  if (isProfessor) {
    // Bloquear rotas explicitamente restritas
    if (PROFESSOR_RESTRICTED_PATHS.includes(currentPath)) {
      return <Navigate to="/teacher-classes" replace />;
    }

    // Redirecionar da raiz para área do professor
    if (currentPath === '/') {
      return <Navigate to="/teacher-classes" replace />;
    }

    // Bloquear qualquer rota que não esteja na lista de permitidas
    if (!PROFESSOR_ALLOWED_PATHS.includes(currentPath)) {
      return <Navigate to="/teacher-classes" replace />;
    }
  }

  return <>{children}</>;
}
