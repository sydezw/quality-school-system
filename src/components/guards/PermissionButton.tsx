import { ReactNode } from 'react';
import { usePermissions, UserPermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PermissionButtonProps {
  children: ReactNode;
  permission?: keyof UserPermissions;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
}

export const PermissionButton = ({ 
  children, 
  permission, 
  onClick,
  disabled = false,
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: PermissionButtonProps) => {
  const { hasPermission, isOwner, loading } = usePermissions();

  // Se está carregando, desabilita o botão
  if (loading) {
    return (
      <Button
        disabled={true}
        className={cn(className)}
        variant={variant}
        size={size}
        type={type}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // Se não há permissão específica requerida, permite uso
  if (!permission) {
    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(className)}
        variant={variant}
        size={size}
        type={type}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // Se é owner, permite uso total
  if (isOwner()) {
    return (
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(className)}
        variant={variant}
        size={size}
        type={type}
        {...props}
      >
        {children}
      </Button>
    );
  }

  // Verifica se tem a permissão específica
  const hasRequiredPermission = hasPermission(permission);
  
  return (
    <Button
      onClick={hasRequiredPermission ? onClick : undefined}
      disabled={disabled || !hasRequiredPermission}
      className={cn(
        className,
        !hasRequiredPermission && 'opacity-50 cursor-not-allowed'
      )}
      variant={variant}
      size={size}
      type={type}
      title={!hasRequiredPermission ? 'Você não tem permissão para esta ação' : undefined}
      {...props}
    >
      {children}
    </Button>
  );
};