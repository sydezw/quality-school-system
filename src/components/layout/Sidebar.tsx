
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePermissions, UserPermissions } from '@/hooks/usePermissions';
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
  Building2,
  FileSignature,
  UserCheck
} from 'lucide-react';

// Define os itens do menu com suas respectivas permissões
const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/app/dashboard', permission: null }, // Dashboard sempre visível
  { icon: Users, label: 'Alunos', path: '/app/students', permission: null },
  { icon: GraduationCap, label: 'Professores', path: '/app/teachers', permission: null },
  { icon: BookCopy, label: 'Turmas', path: '/app/classes', permission: null },
  { icon: Building2, label: 'Salas', path: '/app/rooms', permission: null },
  { icon: FileText, label: 'Contratos', path: '/app/contracts', permission: null },
  { icon: FileSignature, label: 'Gerador de Contratos', path: '/app/contract-generator', permission: null },
  { icon: DollarSign, label: 'Financeiro', path: '/app/financial', permission: null },
  { icon: BarChart3, label: 'Relatórios', path: '/app/reports', permission: null },
  { icon: Calendar, label: 'Agenda', path: '/app/agenda', permission: null },
  { icon: Package, label: 'Materiais', path: '/app/materials', permission: null },
  { icon: FileText, label: 'Documentos', path: '/app/documents', permission: 'criarAvaliacoes' as keyof UserPermissions },
  { icon: Calendar, label: 'Aniversariantes do Mês', path: '/app/birthdays', permission: null }, // Sempre visível
  { icon: UserCheck, label: 'Aprovar Logins', path: '/app/approve-logins', permission: 'gerenciarUsuarios' as keyof UserPermissions },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission, isOwner, loading } = usePermissions();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold text-brand-red">Sistema Escolar</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {!loading && menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            // Verifica se o usuário tem permissão para ver este item
            const hasAccess = item.permission === null || isOwner() || hasPermission(item.permission as any);
            
            if (!hasAccess) {
              return null;
            }
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-red text-white"
                      : "text-gray-700 hover:bg-gray-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
