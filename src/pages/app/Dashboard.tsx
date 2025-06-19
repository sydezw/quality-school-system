
import ContractAlerts from '@/components/dashboard/ContractAlerts';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RevenueExpenseChart from '@/components/dashboard/RevenueExpenseChart';
import StudentsLanguageChart from '@/components/dashboard/StudentsLanguageChart';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { dashboardData, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStats data={dashboardData} />

      {/* Alertas de Contratos */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Alertas de Contratos</h2>
        <ContractAlerts />
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <RevenueExpenseChart data={dashboardData.receitasDespesas} />
        <StudentsLanguageChart data={dashboardData.alunosPorIdioma} />
      </div>
    </div>
  );
};

export default Dashboard;
