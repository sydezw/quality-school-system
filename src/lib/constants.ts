
import {
  LayoutDashboard,
  Users,
  User,
  BookCopy,
  CircleDollarSign,
  BookOpenCheck,
  FileText,
  Settings,
} from 'lucide-react';

export const SIDEBAR_LINKS = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Alunos', icon: Users, href: '#' },
  { title: 'Professores', icon: User, href: '#' },
  { title: 'Turmas', icon: BookCopy, href: '#' },
  { title: 'Financeiro', icon: CircleDollarSign, href: '#' },
  { title: 'Pedagógico', icon: BookOpenCheck, href: '#' },
  { title: 'Relatórios', icon: FileText, href: '#' },
  { title: 'Configurações', icon: Settings, href: '#' },
];
