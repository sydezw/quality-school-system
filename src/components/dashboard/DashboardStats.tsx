
import StatCard from '@/components/shared/StatCard';
import { Users, BookCopy, AlertTriangle, UserCheck, FileText, Cake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStatsProps {
  data: {
    totalAlunos: number;
    totalTurmas: number;
    faturamentoMes: number;
    inadimplentes: number;
    professoresAtivos: number;
    contratosAtivos: number;
    aniversariantesHoje: number;
  };
}

const DashboardStats = ({ data }: DashboardStatsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

      {/* Total de Alunos */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/students')}
        tabIndex={0}
        title="Ir para Alunos"
      >
        <StatCard 
          title="Total de Alunos" 
          value={data.totalAlunos.toString()} 
          icon={<Users className="h-4 w-4 text-muted-foreground" />} 
          details="Alunos ativos" 
        />
      </div>

      {/* Total de Turmas */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/classes')}
        tabIndex={0}
        title="Ir para Turmas"
      >
        <StatCard 
          title="Total de Turmas" 
          value={data.totalTurmas.toString()} 
          icon={<BookCopy className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>
      
      {/* Contratos Ativos */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/contracts')}
        tabIndex={0}
        title="Ir para Contratos"
      >
        <StatCard 
          title="Contratos Ativos" 
          value={data.contratosAtivos.toString()} 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      {/* Aniversariantes de Hoje */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/birthdays')}
        tabIndex={0}
        title="Ir para Aniversariantes"
      >
        <StatCard 
          title="Aniversariantes de Hoje" 
          value="Verifique agora" 
          icon={<Cake className="h-4 w-4 text-purple-600" />} 
          className={data.aniversariantesHoje > 0 ? "border-purple-300 bg-purple-50" : ""}
        />
      </div>
      
      {/* Inadimplentes */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/financial?status=inadimplente')}
        tabIndex={0}
        title="Ver apenas inadimplentes"
      >
        <StatCard 
          title="Inadimplentes" 
          value={data.inadimplentes.toString()} 
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
          className="border-destructive" 
        />
      </div>
      
      {/* Professores Ativos */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/teachers')}
        tabIndex={0}
        title="Ir para Professores"
      >
        <StatCard 
          title="Professores Ativos" 
          value={data.professoresAtivos.toString()} 
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>
    </div>
  );
};

export default DashboardStats;

