import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermissions, UserPermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface PermissionButtonProps extends Omit<ButtonProps, 'onClick'> {
  permission: keyof UserPermissions;
  onClick?: () => void;
  children: React.ReactNode;
  showLockIcon?: boolean;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  onClick,
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  showLockIcon = true,
  ...props
}) => {
  const { hasPermission, isOwner, loading } = usePermissions();
  const { toast } = useToast();

  const hasAccess = isOwner() || hasPermission(permission);

  const handleClick = () => {
    if (!hasAccess) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para realizar esta ação. Entre em contato com o administrador.",
        variant: "destructive",
      });
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  if (loading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={true}
        {...props}
      >
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </Button>
    );
  }

  return (
    <Button
      variant={hasAccess ? variant : 'outline'}
      size={size}
      className={cn(
        className,
        !hasAccess && 'opacity-60 cursor-not-allowed border-gray-300 text-gray-500 hover:bg-gray-50'
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {!hasAccess && showLockIcon && (
        <Lock className="h-4 w-4 mr-2" />
      )}
      {children}
    </Button>
  );
};

export default PermissionButton;