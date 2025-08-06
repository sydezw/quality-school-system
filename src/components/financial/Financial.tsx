import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ParcelasTable from './ParcelasTable';
import StudentGroupingView from './StudentGroupingView';
import { useFinancial } from '@/hooks/useFinancial';

const Financial = () => {
  const [currentView, setCurrentView] = useState<'records' | 'grouping'>('records');
  const { boletos, despesas, fetchBoletos, fetchDespesas } = useFinancial();

  useEffect(() => {
    fetchBoletos();
    fetchDespesas();
  }, [fetchBoletos, fetchDespesas]);

  // Função para atualizar dados financeiros quando uma parcela for marcada como paga
  const handleFinancialUpdate = async () => {
    await fetchBoletos();
    await fetchDespesas();
  };

  // Calcular receitas (boletos pagos)
  const totalReceitas = boletos
    .filter(b => b.status === 'Pago')
    .reduce((total, boleto) => total + boleto.valor, 0);

  // Calcular despesas (despesas pagas)
  const totalDespesas = despesas
    .filter(d => d.status === 'Pago')
    .reduce((total, despesa) => total + despesa.valor, 0);

  // Calcular saldo
  const saldo = totalReceitas - totalDespesas;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      {/* Cards de Resumo Financeiro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Card de Receitas */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-white">
                <span className="text-sm font-medium">Receitas</span>
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalReceitas)}
              </div>
              <p className="text-green-100 text-xs mt-1">
                {boletos.filter(b => b.status === 'Pago').length} boletos pagos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card de Despesas */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-white">
                <span className="text-sm font-medium">Despesas</span>
                <TrendingDown className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalDespesas)}
              </div>
              <p className="text-red-100 text-xs mt-1">
                {despesas.filter(d => d.status === 'Pago').length} despesas pagas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card de Saldo */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className={`shadow-lg border-0 bg-gradient-to-br ${
            saldo >= 0 
              ? 'from-blue-500 to-blue-600' 
              : 'from-orange-500 to-orange-600'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-white">
                <span className="text-sm font-medium">Saldo</span>
                <DollarSign className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(saldo)}
              </div>
              <p className="text-white/80 text-xs mt-1">
                {saldo >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setCurrentView('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'records'
                ? 'text-red-600' + ' ' + 'border-red-500'
        : 'border-transparent hover:border-gray-300' + ' ' + 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registros (Parcelas)
          </button>
          <button
            onClick={() => setCurrentView('grouping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'grouping'
                ? 'text-red-600' + ' ' + 'border-red-500'
        : 'border-transparent hover:border-gray-300' + ' ' + 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Agrupamento por Aluno
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {currentView === 'records' ? (
          <ParcelasTable onRefresh={handleFinancialUpdate} />
        ) : (
          <StudentGroupingView onRefresh={handleFinancialUpdate} />
        )}
      </div>
    </div>
  );
};

export default Financial;