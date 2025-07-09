
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface RevenueExpenseChartProps {
  data: { name: string; Receitas: number; Despesas: number }[];
}

const chartConfig = {
  Receitas: {
    label: "Receitas",
    color: "#10B981",
  },
  Despesas: {
    label: "Despesas", 
    color: "#EF4444",
  },
};

const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  return (
    <motion.div
      className="md:col-span-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 via-white to-red-50 border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-r from-green-500 to-red-500 text-white rounded-xl p-2 shadow-md"
            >
              <TrendingUp className="h-5 w-5" />
            </motion.div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-700 to-red-700 bg-clip-text text-transparent">
                Receitas vs. Despesas
              </CardTitle>
              <p className="text-gray-600 text-sm mt-1">Comparativo mensal</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                />
                <Bar 
                  dataKey="Receitas" 
                  fill="var(--color-Receitas)" 
                  radius={[4, 4, 0, 0]}
                  className="drop-shadow-sm"
                />
                <Bar 
                  dataKey="Despesas" 
                  fill="var(--color-Despesas)" 
                  radius={[4, 4, 0, 0]}
                  className="drop-shadow-sm"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RevenueExpenseChart;
