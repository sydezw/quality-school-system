
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/authcontext';
import { useIsMobile } from '../../hooks/use-mobile';
import { cn } from '../../lib/utils';

const Header = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className={cn(
      "backdrop-blur-md border-b border-gray-200/50",
      isMobile 
        ? "bg-white/95 px-4 py-3" 
        : "bg-white/80 px-0 py-4"
    )}>
      <div className={cn(
        "flex items-center justify-between w-full",
        !isMobile && "pl-20" // Espaço para a sidebar (64px + padding)
      )}>
        {/* Logo - Posicionado após a sidebar no desktop */}
        {!isMobile ? (
          <div className="flex items-center flex-1">
            <Link 
              to="/dashboard" 
              className={cn(
                "font-bold text-brand-dark hover:text-brand-primary transition-colors text-2xl",
                "ml-4" // Pequeno espaçamento da sidebar
                // Comentário: Para ajustar fonte, modifique as classes text-2xl, font-bold
                // Exemplo: text-3xl para maior, font-semibold para menos peso
              )}
            >
              TS School
            </Link>
          </div>
        ) : (
          <div></div>
        )}
        
        {/* User Info & Actions */}
        <div className={cn(
          "flex items-center",
          isMobile ? "gap-2" : "gap-4",
          !isMobile && "pr-6" // Padding direito no desktop
        )}>
          {user && (
            <>
              {/* User Info - Hidden on very small screens */}
              {!isMobile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">Olá {user.nome}</span>
                    <span className="text-xs text-gray-500">{user.cargo}</span>
                  </div>
                </div>
              )}
              
              {/* Mobile User Info - Compact */}
              {isMobile && (
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                      Olá {user.nome}
                    </span>
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {user.cargo}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size={isMobile ? "sm" : "sm"}
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-2 border-gray-200 hover:bg-gray-50 transition-all duration-200",
                  isMobile 
                    ? "px-2 py-1.5 text-xs" 
                    : "px-3 py-2 text-sm"
                )}
              >
                <LogOut className={cn(
                  isMobile ? "h-3 w-3" : "h-4 w-4"
                )} />
                {!isMobile && "Sair"}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
