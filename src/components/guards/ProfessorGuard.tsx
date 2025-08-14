import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProfessorGuardProps {
  children: React.ReactNode;
}

export interface PermissionsContextType {
  canAccessDashboard: boolean;
  canAccessStudents: boolean;
  canAccessFinancial: boolean;
  canAccessPlans: boolean;
  canAccessMaterials: boolean;
  canAccessRooms: boolean;
  canAccessTeachers: boolean;
  canAccessDocuments: boolean;
  canAccessAgenda: boolean;
  canAccessResponsibles: boolean;
  canAccessLessons: boolean;
  canAccessClasses: boolean;
  canAccessContracts: boolean;
  canAccessReports: boolean;
  canAccessBirthdays: boolean;
  canAccessApproveLogins: boolean;
  canAccessTeacherClasses: boolean; // Específico para professores
  isProfessor: boolean;
  isAdmin: boolean;
}

export const PermissionsContext = React.createContext<PermissionsContextType | null>(null);

export function usePermissions() {
  const context = React.useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export function ProfessorGuard({ children }: ProfessorGuardProps) {
  const { user, loading } = useAuth();

  // Mover todos os hooks para o topo para seguir as regras dos hooks
  const isProfessor = useMemo(() => {
    return user?.cargo === 'Professor';
  }, [user?.cargo]);

  const isAdmin = useMemo(() => {
    return user?.cargo === 'Admin';
  }, [user?.cargo]);

  const permissions = useMemo((): PermissionsContextType => {
    return {
      canAccessDashboard: !isProfessor,
      canAccessStudents: !isProfessor,
      canAccessFinancial: !isProfessor,
      canAccessPlans: !isProfessor,
      canAccessMaterials: !isProfessor,
      canAccessRooms: !isProfessor,
      canAccessTeachers: !isProfessor,
      canAccessDocuments: !isProfessor,
      canAccessAgenda: !isProfessor,
      canAccessResponsibles: !isProfessor,
      canAccessLessons: true, // Todos podem acessar aulas
      canAccessClasses: !isProfessor,
      canAccessContracts: !isProfessor,
      canAccessReports: !isProfessor,
      canAccessBirthdays: !isProfessor,
      canAccessApproveLogins: !isProfessor,
      canAccessTeacherClasses: isProfessor, // Apenas professores podem acessar "Minhas Turmas"
      isProfessor,
      isAdmin
    };
  }, [isProfessor, isAdmin]);

  // Aguardar carregamento completo do contexto
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Verificar se o usuário está autenticado
  if (!user) {
    return null; // Será tratado pelo ProtectedRoute
  }

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}