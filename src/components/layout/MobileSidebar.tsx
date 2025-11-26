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
  Cake,
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

// Componente do ícone personalizado para Aprovar Logins
const ApproveLoginIcon = ({ className }: { className?: string }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 1024 1024" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#333" d="M866.9 169.9L527.1 54.1C523 52.7 517.5 52 512 52s-11 .7-15.1 2.1L157.1 169.9c-8.3 2.8-15.1 12.4-15.1 21.2v482.4c0 8.8 5.7 20.4 12.6 25.9L499.3 968c3.5 2.7 8 4.1 12.6 4.1s9.2-1.4 12.6-4.1l344.7-268.6c6.9-5.4 12.6-17 12.6-25.9V191.1c.2-8.8-6.6-18.3-14.9-21.2zM810 654.3L512 886.5 214 654.3V226.7l298-101.6 298 101.6v427.6z"></path>
    <path fill="#E6E6E6" d="M214 226.7v427.6l298 232.2 298-232.2V226.7L512 125.1 214 226.7zM632.8 328H688c6.5 0 10.3 7.4 6.5 12.7L481.9 633.4a16.1 16.1 0 0 1-26 0l-126.4-174c-3.8-5.3 0-12.7 6.5-12.7h55.2c5.2 0 10 2.5 13 6.6l64.7 89.1 150.9-207.8c3-4.1 7.9-6.6 13-6.6z"></path>
    <path fill="#333" d="M404.2 453.3c-3-4.1-7.8-6.6-13-6.6H336c-6.5 0-10.3 7.4-6.5 12.7l126.4 174a16.1 16.1 0 0 0 26 0l212.6-292.7c3.8-5.3 0-12.7-6.5-12.7h-55.2c-5.2 0-10 2.5-13 6.6L335.3 542.4l-64.7-89.1z"></path>
  </svg>
);

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
    { path: '/birthdays', label: 'Aniversários', icon: Cake, roles: ['admin'] },
    { path: '/approve-logins', label: 'Gestão de Usuários', icon: ApproveLoginIcon, roles: ['admin'] },
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