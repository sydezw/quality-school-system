
import StatCard from '@/components/shared/StatCard';
import { Users, BookCopy, CircleDollarSign, AlertTriangle, UserCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStatsProps {
  data: {
    totalAlunos: number;
    totalTurmas: number;
    faturamentoMes: number;
    inadimplentes: number;
    professoresAtivos: number;
    contratosAtivos: number;
  };
}

const DashboardStats = ({ data }: DashboardStatsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">

      {/* Total de Alunos */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/app/students')}
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
        onClick={() => navigate('/app/classes')}
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
        onClick={() => navigate('/app/contracts')}
        tabIndex={0}
        title="Ir para Contratos"
      >
        <StatCard 
          title="Contratos Ativos" 
          value={data.contratosAtivos.toString()} 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      {/* Faturamento do Mês */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/app/financial')}
        tabIndex={0}
        title="Ir para Financeiro"
      >
        <StatCard 
          title="Faturamento do Mês" 
          value={`R$ ${data.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />} 
          details="Boletos pagos no mês" 
        />
      </div>
      
      {/* Inadimplentes */}
      <div
        className="cursor-pointer"
        onClick={() => navigate('/app/financial?status=inadimplente')}
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
        onClick={() => navigate('/app/teachers')}
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

