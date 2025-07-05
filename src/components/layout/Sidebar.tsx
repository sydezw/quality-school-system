
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  UserCheck,
  CreditCard
} from 'lucide-react';

// Define os itens do menu com suas respectivas permissões
const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Alunos', path: '/students' },
    { icon: GraduationCap, label: 'Professores', path: '/teachers' },
    { icon: BookCopy, label: 'Turmas', path: '/classes' },
    { icon: Building2, label: 'Salas', path: '/rooms' },
    { icon: FileText, label: 'Contratos', path: '/contracts' },
    { icon: FileSignature, label: 'Gerador de Contratos', path: '/contract-generator' },
    { icon: CreditCard, label: 'Planos', path: '/plans' },
    { icon: DollarSign, label: 'Financeiro', path: '/financial' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Package, label: 'Materiais', path: '/materials' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: FileText, label: 'Documentos', path: '/documents' },
    { icon: Calendar, label: 'Aniversariantes do Mês', path: '/birthdays' },
    { icon: UserCheck, label: 'Aprovar Logins', path: '/approve-logins' },
  ];

export const Sidebar = () => {
  const location = useLocation();
  const version = "v1.0.0";

  return (
    <div className="group w-16 hover:w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col overflow-hidden">
      {/* Header com logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          {/* Logo compacto sempre visível */}
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SE</span>
          </div>
          
          {/* Nome completo que aparece no hover */}
          <div className="ml-3 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
            <h2 className="text-xl font-semibold text-brand-red">Sistema Escolar</h2>
          </div>
        </div>
      </div>

      {/* Navegação */}
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
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out",
                    isActive
                      ? "bg-brand-red text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {/* Ícone sempre visível */}
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  
                  {/* Texto que aparece no hover */}
                  <span className="ml-3 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Componente de versão no rodapé */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500 opacity-70 hover:opacity-100 transition-opacity duration-300">
          {/* Ícone TS sempre visível */}
          <div className="rounded-full bg-indigo-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
            TS
          </div>
          
          {/* Versão que aparece no hover */}
          <span className="text-xs font-medium text-gray-400 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
            {version}
          </span>
        </div>
      </div>
    </div>
  );
};
