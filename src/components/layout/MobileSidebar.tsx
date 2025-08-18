import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions } from '@/components/guards/ProfessorGuard';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookCopy, 
  DollarSign, 
  BarChart3,
  Calendar,
  FileText,
  Package,
  FileSignature,
  UserCheck,
  CreditCard,
  BookOpen,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAdmin, isProfessor } = usePermissions();

  // Menu items baseado no componente Sidebar existente
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin'] },
    { path: '/students', label: 'Alunos', icon: Users, roles: ['admin'] },
    { path: '/classes', label: 'Turmas', icon: GraduationCap, roles: ['admin'] },
    { path: '/lessons', label: 'Aulas', icon: BookOpen, roles: ['admin'] },
    { path: '/materials', label: 'Materiais', icon: BookCopy, roles: ['admin'] },
    { path: '/plans', label: 'Planos', icon: Package, roles: ['admin'] },
    { path: '/financial', label: 'Financeiro', icon: DollarSign, roles: ['admin'] },
    { path: '/reports', label: 'Relatórios', icon: BarChart3, roles: ['admin'] },
    { path: '/agenda', label: 'Agenda', icon: Calendar, roles: ['admin'] },
    { path: '/contracts', label: 'Contratos', icon: FileSignature, roles: ['admin'] },
    { path: '/responsibles', label: 'Responsáveis', icon: UserCheck, roles: ['admin'] },
    { path: '/birthdays', label: 'Aniversários', icon: Users, roles: ['admin'] },
    { path: '/approve-logins', label: 'Gestão de Usuários', icon: UserCheck, roles: ['admin'] },
    // Para professores - apenas as duas abas combinadas
    { path: '/teacher-classes', label: 'Minhas Turmas', icon: GraduationCap, roles: ['professor'] },
    { path: '/lessons', label: 'Aulas', icon: BookOpen, roles: ['professor'] },
  ];

  // Filtrar itens baseado nas permissões
  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin) return item.roles.includes('admin');
    if (isProfessor) return item.roles.includes('professor');
    return false;
  });

  const handleNavigation = (path: string) => {
    if (isProfessor && !isAdmin && path === '/classes') {
      return '/teacher-classes';
    }
    return path;
  };

  // Fechar sidebar ao clicar fora (apenas no mobile)
  useEffect(() => {
    if (!isMobile) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile, onClose]);

  if (!isMobile) return null;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-brand-red to-red-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-brand-red font-bold text-lg">TS</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">TS School</h2>
                  <p className="text-white/80 text-sm">Sistema Escolar</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2 md:py-4 overflow-y-auto">
              <ul className="element-spacing container-padding">
                {filteredMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={handleNavigation(item.path)}
                        onClick={onClose}
                        className={cn(
                          "center-align px-2 py-1 md:px-3 md:py-2 rounded-lg subtitle font-medium transition-all duration-300 ease-in-out min-h-[36px] md:min-h-[44px] touch-manipulation group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-brand-red to-red-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        )}
                      >
                        {/* Background animation for active state */}
                        {isActive && (
                          <motion.div
                            layoutId="activeBackground"
                            className="absolute inset-0 bg-gradient-to-r from-brand-red to-red-600 rounded-lg"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        {/* Content */}
                        <div className="relative z-10 center-align gap-2 md:gap-3 w-full">
                          <Icon className={cn(
                            "h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110 flex-shrink-0",
                            isActive ? "text-white" : "text-gray-600"
                          )} />
                          <span className={cn(
                            "subtitle font-medium flex-1 text-left",
                            isActive ? "text-white" : "text-gray-700"
                          )}>
                            {item.label}
                          </span>
                          <ChevronRight className={cn(
                            "h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:translate-x-1 flex-shrink-0",
                            isActive ? "text-white/80" : "text-gray-400"
                          )} />
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Versão 2.0</p>
                  <p className="text-xs text-gray-500">Sistema Escolar</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook para controlar o estado da sidebar mobile
export const useMobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Fechar automaticamente quando não estiver no mobile
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close
  };
};

// Componente do botão de toggle
export const MobileSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-30 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label="Abrir menu"
    >
      <Menu className="h-6 w-6 text-gray-700" />
    </button>
  );
};

export default MobileSidebar;