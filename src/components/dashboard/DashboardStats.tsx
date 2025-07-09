
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  BookCopy, 
  CircleDollarSign, 
  AlertTriangle, 
  UserCheck, 
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  const statsConfig = [
    {
      title: "Total de Alunos",
      value: data.totalAlunos.toString(),
      icon: <Users className="h-8 w-8" />,
      details: "Cadastrados no sistema",
      gradient: "from-red-500/10 to-pink-500/10",
      iconGradient: "from-red-500 to-pink-500",
      textColor: "text-red-700",
      valueColor: "text-red-800",
      detailColor: "text-red-600",
      borderColor: "border-red-200/50",
      onClick: () => navigate('/students')
    },
    {
      title: "Total de Turmas",
      value: data.totalTurmas.toString(),
      icon: <BookCopy className="h-8 w-8" />,
      details: "Turmas ativas",
      gradient: "from-blue-500/10 to-indigo-500/10",
      iconGradient: "from-blue-500 to-indigo-500",
      textColor: "text-blue-700",
      valueColor: "text-blue-800",
      detailColor: "text-blue-600",
      borderColor: "border-blue-200/50",
      onClick: () => navigate('/classes')
    },
    {
      title: "Contratos Ativos",
      value: data.contratosAtivos.toString(),
      icon: <FileText className="h-8 w-8" />,
      details: "Contratos vigentes",
      gradient: "from-green-500/10 to-emerald-500/10",
      iconGradient: "from-green-500 to-emerald-500",
      textColor: "text-green-700",
      valueColor: "text-green-800",
      detailColor: "text-green-600",
      borderColor: "border-green-200/50",
      onClick: () => navigate('/contracts')
    },
    {
      title: "Faturamento do Mês",
      value: `R$ ${data.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <CircleDollarSign className="h-8 w-8" />,
      details: "Boletos pagos no mês",
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconGradient: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-700",
      valueColor: "text-emerald-800",
      detailColor: "text-emerald-600",
      borderColor: "border-emerald-200/50",
      onClick: () => navigate('/financial')
    },
    {
      title: "Inadimplentes",
      value: data.inadimplentes.toString(),
      icon: <AlertTriangle className="h-8 w-8" />,
      details: "Requer atenção",
      gradient: "from-red-500/10 to-red-600/10",
      iconGradient: "from-red-500 to-red-600",
      textColor: "text-red-700",
      valueColor: "text-red-800",
      detailColor: "text-red-600",
      borderColor: "border-red-200/50",
      onClick: () => navigate('/financial?status=inadimplente')
    },
    {
      title: "Professores Ativos",
      value: data.professoresAtivos.toString(),
      icon: <UserCheck className="h-8 w-8" />,
      details: "Professores ativos",
      gradient: "from-orange-500/10 to-amber-500/10",
      iconGradient: "from-orange-500 to-amber-500",
      textColor: "text-orange-700",
      valueColor: "text-orange-800",
      detailColor: "text-orange-600",
      borderColor: "border-orange-200/50",
      onClick: () => navigate('/teachers')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statsConfig.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
          onClick={stat.onClick}
        >
          <Card className={`bg-white/60 backdrop-blur-sm border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} text-sm font-medium uppercase tracking-wide`}>{stat.title}</p>
                  <p className={`text-4xl font-bold mt-2 ${stat.valueColor}`}>{stat.value}</p>
                  <p className={`${stat.detailColor} text-sm mt-1`}>{stat.details}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.iconGradient} text-white rounded-xl p-3 shadow-md`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;

