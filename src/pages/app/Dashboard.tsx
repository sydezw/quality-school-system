
import ContractAlerts from '@/components/dashboard/ContractAlerts';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RevenueExpenseChart from '@/components/dashboard/RevenueExpenseChart';
import StudentsLanguageChart from '@/components/dashboard/StudentsLanguageChart';
import { useDashboardData } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Bell, Users, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { dashboardData, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl border border-red-100">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gradient-to-r from-red-600 to-pink-600 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-red-200 to-pink-200 opacity-25 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-semibold">Carregando dashboard...</p>
          <p className="mt-2 text-gray-500">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/30">
      <div className="space-y-8 p-6">
        {/* Header Principal com Gradiente Vermelho-Rosa */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          <div className="relative bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl border border-red-200">
            <motion.div 
              className="absolute inset-0 bg-white/10"
              animate={{ 
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <TrendingUp className="h-10 w-10 text-white" />
                    </motion.div>
                    <div>
                      <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                        Dashboard
                      </h1>
                      <p className="text-red-100 text-xl font-medium mt-2">Visão geral do sistema escolar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-red-100">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Sistema integrado de gestão</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 transition-all duration-200 shadow-lg"
                >
                  <RefreshCw className="h-6 w-6" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards de Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DashboardStats data={dashboardData} />
        </motion.div>

        {/* Alertas e Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 via-white to-red-50 border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-3 shadow-md"
                >
                  <Bell className="h-6 w-6" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-orange-600 bg-clip-text text-transparent">
                    Alertas e Notificações
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-1">Acompanhe contratos e vencimentos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ContractAlerts />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráficos e Análises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-3 shadow-md"
                >
                  <BarChart3 className="h-6 w-6" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">
                    Análises e Relatórios
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-1">Dados financeiros e estatísticas</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-5">
                <RevenueExpenseChart data={dashboardData.receitasDespesas} />
                <StudentsLanguageChart data={dashboardData.alunosPorIdioma} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
