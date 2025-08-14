
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/components/guards/ProfessorGuard';
import { useIsMobile } from '@/hooks/use-mobile';

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
  BookOpen
} from 'lucide-react';

// Define os itens do menu com suas respectivas permissões - Sistema restritivo para professores
const getAllMenuItems = (permissions: ReturnType<typeof usePermissions>) => {
  // Para professores, apenas itens explicitamente permitidos
  if (permissions.isProfessor) {
    return [
      { icon: BookCopy, label: 'Minhas Turmas', path: '/teacher-classes', visible: permissions.canAccessTeacherClasses },
      { icon: BookOpen, label: 'Aulas', path: '/lessons', visible: permissions.canAccessLessons },
    ].filter(item => item.visible);
  }
  
  // Para administradores, todos os itens exceto "Minhas Turmas"
  return [
    { icon: Home, label: 'Dashboard', path: '/dashboard', visible: permissions.canAccessDashboard },
    { icon: Users, label: 'Alunos', path: '/students', visible: permissions.canAccessStudents },
    { icon: GraduationCap, label: 'Professores', path: '/teachers', visible: permissions.canAccessTeachers },
    { icon: BookCopy, label: 'Turmas', path: '/classes', visible: permissions.canAccessClasses },
    { icon: BookOpen, label: 'Aulas', path: '/lessons', visible: permissions.canAccessLessons },
    { icon: FileText, label: 'Contratos', path: '/contracts', visible: permissions.canAccessContracts },
    { icon: FileSignature, label: 'Gerador de Contratos', path: '/contract-generator', visible: permissions.canAccessContracts },
    { icon: CreditCard, label: 'Planos', path: '/plans', visible: permissions.canAccessPlans },
    { icon: DollarSign, label: 'Financeiro', path: '/financial', visible: permissions.canAccessFinancial },
    { icon: Calendar, label: 'Agenda', path: '/agenda', visible: permissions.canAccessAgenda },
    { icon: Package, label: 'Materiais', path: '/materials', visible: permissions.canAccessMaterials },
    { icon: BarChart3, label: 'Relatórios', path: '/reports', visible: permissions.canAccessReports },
    { icon: FileText, label: 'Documentos', path: '/documents', visible: permissions.canAccessDocuments },
    { icon: UserCheck, label: 'Responsáveis', path: '/responsibles', visible: permissions.canAccessResponsibles },
    { icon: Calendar, label: 'Aniversariantes do Mês', path: '/birthdays', visible: permissions.canAccessBirthdays },
    { icon: UserCheck, label: 'Aprovar Logins', path: '/approve-logins', visible: permissions.canAccessApproveLogins }
    // Nota: "Minhas Turmas" não aparece para administradores pois canAccessTeacherClasses é false para eles
  ].filter(item => item.visible);
};

export const Sidebar = () => {
  const location = useLocation();
  const permissions = usePermissions();
  const isMobile = useIsMobile();

  // Oculta a sidebar no mobile
  if (isMobile) {
    return null;
  }
  const menuItems = getAllMenuItems(permissions);
  const version = "v1.0.0";
  
  // Caminho padrão baseado no tipo de usuário
  const defaultPath = permissions.isProfessor ? '/teacher-classes' : '/dashboard';
  
  // Verificação adicional de segurança - se professor tentar acessar rota não permitida via sidebar
  const handleNavigation = (path: string) => {
    if (permissions.isProfessor) {
      const allowedPaths = ['/teacher-classes', '/lessons'];
      if (!allowedPaths.includes(path)) {
        console.warn('Tentativa de acesso não autorizado bloqueada:', path);
        return '/teacher-classes';
      }
    }
    return path;
  };

  return (
    <div className="hidden md:flex group w-16 hover:w-[250px] bg-white border-r border-gray-200 flex-col fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out overflow-hidden">
      {/* Título/Logo no topo */}
      <div className="pt-5 px-4 pb-5">
        <div className="flex items-center gap-3">
          {/* Logo quadrado arredondado - sempre visível */}
          <div className="w-8 h-8 bg-[#DC2626] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          
          {/* Nome do sistema - aparece no hover */}
          <h2 className="text-[#DC2626] font-semibold text-base opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap" style={{fontFamily: '"Inter", sans-serif'}}>Sistema Escolar</h2>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4">
        <ul className="space-y-[2px]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={handleNavigation(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1 rounded-lg transition-all duration-200 ease-in-out min-h-[32px]",
                    "font-medium",
                    !isActive && "hover:bg-gray-50"
                  )}
                  style={{fontFamily: '"Inter", sans-serif'}}
                >
                  {/* Container do ícone com círculo */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out flex-shrink-0",
                    isActive
                      ? "bg-[#dc2626]"
                      : "hover:bg-[#fee2e2]"
                  )}>
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-200 ease-in-out",
                        isActive 
                          ? "text-white" 
                          : "text-[#6b7280] hover:text-[#dc2626]"
                      )}
                      size={20}
                      strokeWidth={1.5}
                      fill="none"
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    />
                  </div>
                  
                  {/* Texto - aparece no hover */}
                  <span className={cn(
                    "text-[0.75rem] opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                    isActive ? "text-[#1F2937] font-semibold" : "text-[#1F2937] font-medium"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
