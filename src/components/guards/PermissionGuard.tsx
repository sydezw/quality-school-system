import { ReactNode } from 'react';
import { usePermissions, UserPermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: keyof UserPermissions;
  fallback?: ReactNode;
}

export const PermissionGuard = ({ 
  children, 
  permission, 
  fallback 
}: PermissionGuardProps) => {
  const { hasPermission, isOwner, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não há permissão específica requerida, permite acesso
  if (!permission) {
    return <>{children}</>;
  }

  // Se é owner, permite acesso total
  if (isOwner()) {
    return <>{children}</>;
  }

  // Verifica se tem a permissão específica
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  // Se tem fallback customizado, usa ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Fallback padrão - mensagem de acesso negado
  return (
    <div className="p-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Você não tem permissão para acessar esta funcionalidade. Entre em contato com o administrador se precisar de acesso.
        </AlertDescription>
      </Alert>
    </div>
  );
};