
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
  BookOpen,
  Cake
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

// Define os itens do menu com suas respectivas permissões - Sistema restritivo para professores
const getAllMenuItems = (permissions: ReturnType<typeof usePermissions>) => {
  // Para professores, apenas itens explicitamente permitidos
  if (permissions.isProfessor) {
    return [
      { icon: BookCopy, label: 'Minhas Turmas', path: '/teacher-classes', visible: permissions.canAccessTeacherClasses },
      { icon: Users, label: 'Meus Alunos', path: '/my-students', visible: true },
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
    { icon: CreditCard, label: 'Planos', path: '/plans', visible: permissions.canAccessPlans },
    { icon: DollarSign, label: 'Financeiro', path: '/financial', visible: permissions.canAccessFinancial },
    { icon: Calendar, label: 'Agenda', path: '/agenda', visible: permissions.canAccessAgenda },
    { icon: Package, label: 'Materiais', path: '/materials', visible: permissions.canAccessMaterials },
    { icon: BarChart3, label: 'Relatórios', path: '/reports', visible: permissions.canAccessReports },
    { icon: FileText, label: 'Documentos', path: '/documents', visible: permissions.canAccessDocuments },
    { icon: UserCheck, label: 'Responsáveis', path: '/responsibles', visible: permissions.canAccessResponsibles },
    { icon: Cake, label: 'Aniversariantes do Mês', path: '/birthdays', visible: permissions.canAccessBirthdays },
    { icon: ApproveLoginIcon, label: 'Aprovar Logins', path: '/approve-logins', visible: permissions.canAccessApproveLogins }
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
      const allowedPaths = ['/teacher-classes', '/lessons', '/my-students'];
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
      <nav className="flex-1 py-4">
        <ul className="space-y-0 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={handleNavigation(item.path)}
                  className={cn(
                    "flex items-center px-3 py-1 rounded-lg text-sm font-bold transition-all duration-300 ease-in-out min-h-[24px]",
                    "font-bold",
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
