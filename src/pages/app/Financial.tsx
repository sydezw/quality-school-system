import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard, ChevronDown, ChevronRight, Check, Send, History, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinancial } from '@/hooks/useFinancial';
import FinancialDialogs from '@/components/financial/FinancialDialogs';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import RenewalAlertsTable from '@/components/financial/RenewalAlertsTable';
import ParcelasTable from '@/components/financial/ParcelasTable';
import StudentGroupingView from '@/components/financial/StudentGroupingView';
import DespesasTable from '@/components/financial/DespesasTable';
import { StatusAluno } from '@/types/financial';
import FinancialReportsTable from '@/components/financial/FinancialReportsTable';


// Interfaces movidas para @/types/financial

const Financial = () => {
  const {
    state,
    setState,
    dialogState,
    setDialogState,
    fetchBoletos,
    fetchContratos,
    calcularProgressoParcelas,
    obterStatusAluno,
    obterPlanoAluno,
    getStatusColor,
    marcarComoPago,
    refreshData,
    toast
  } = useFinancial();

  // Desestruturar variáveis do state
  const {
    boletos,
    despesas,
    students,
    alunosFinanceiros,
    historicoPagamentos,
    planosGenericos,
    contratos,
    loading,
    filtroStatus,
    viewMode,
    expandedAlunos,
    expandedToggles
  } = state;

  const {
    isBoletoDialogOpen,
    isDespesaDialogOpen,
    isNovoPlanoDialogOpen,
    isParcelaAvulsaDialogOpen,
    editingBoleto,
    editingDespesa,
    alunoSelecionadoParcela
  } = dialogState;

  // Effects movidos para useFinancial hook

  // Todas as funções foram movidas para o hook useFinancial

  // Funções auxiliares locais
  const filtrarAlunosPorStatus = (alunos: typeof alunosFinanceiros) => {
    if (filtroStatus === 'todos') return alunos;
    
    return alunos.filter(aluno => {
      switch (filtroStatus) {
        case 'inadimplentes':
          return aluno.boletosVencidos > 0;
        case 'pendentes':
          return aluno.boletos.some(b => b.status === 'Pendente');
        case 'pagos':
          return aluno.boletos.some(b => b.status === 'Pago');
        default:
          return true;
      }
    });
  };

  const totalReceitas = boletos
    .filter(b => b.status === 'Pago')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalDespesas = despesas
    .filter(d => d.status === 'Pago')
    .reduce((sum, d) => sum + d.valor, 0);

  const toggleAlunoExpanded = (alunoId: string) => {
    const newExpanded = new Set(expandedAlunos);
    if (newExpanded.has(alunoId)) {
      newExpanded.delete(alunoId);
    } else {
      newExpanded.add(alunoId);
    }
    setState(prev => ({
      ...prev,
      expandedAlunos: newExpanded
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financeiro</h1>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Pagas)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Pagas)</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registros" className="space-y-4">
        <TabsList className="bg-gray-200 p-1 rounded-lg shadow-lg">
          <motion.div 
            className="flex w-full"
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <TabsTrigger 
              value="registros" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-black data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Registros
              </motion.span>
            </TabsTrigger>
            <TabsTrigger 
              value="agrupamento" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Agrupamento
              </motion.span>
            </TabsTrigger>
            <TabsTrigger 
              value="operacional" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Despesas
              </motion.span>
            </TabsTrigger>
            {/* Aba de renovações removida */}
            <TabsTrigger 
              value="relatorios" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Relatórios
              </motion.span>
            </TabsTrigger>
          </motion.div>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <TabsContent value="registros" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ParcelasTable />
            </motion.div>
          </TabsContent>

          <TabsContent value="agrupamento" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <StudentGroupingView />
            </motion.div>
          </TabsContent>

          <TabsContent value="operacional" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Gestão de Despesas</h2>
              </div>
              <DespesasTable />
            </motion.div>
          </TabsContent>

          {/* TabsContent de renovação removido */}

          <TabsContent value="relatorios" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FinancialReportsTable />
            </motion.div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default Financial;
