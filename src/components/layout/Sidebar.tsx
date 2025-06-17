
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  Building2
} from 'lucide-react';

// Corrige a definição do array menuItems
const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Users, label: 'Alunos', path: '/app/students' },
  { icon: GraduationCap, label: 'Professores', path: '/app/teachers' },
  { icon: BookCopy, label: 'Turmas', path: '/app/classes' },
  { icon: Building2, label: 'Salas', path: '/app/rooms' },
  { icon: FileText, label: 'Contratos', path: '/app/contracts' },
  { icon: DollarSign, label: 'Financeiro', path: '/app/financial' },
  { icon: BarChart3, label: 'Relatórios', path: '/app/reports' },
  { icon: Calendar, label: 'Agenda', path: '/app/agenda' },
  { icon: Package, label: 'Materiais', path: '/app/materials' },
  { icon: FileText, label: 'Documentos', path: '/app/documents' },
  { icon: Calendar, label: 'Aniversariantes do Mês', path: '/app/birthdays' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

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
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
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
