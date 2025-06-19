
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface RevenueExpenseChartProps {
  data: { name: string; Receitas: number; Despesas: number }[];
}

const chartConfig = {
  Receitas: {
    label: "Receitas",
    color: "#1A1A1A",
  },
  Despesas: {
    label: "Despesas", 
    color: "#D72638",
  },
};

const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  console.log('RevenueExpenseChart renderizando com dados:', data);
  
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Receitas vs. Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
              />
              <Bar dataKey="Receitas" fill="var(--color-Receitas)" />
              <Bar dataKey="Despesas" fill="var(--color-Despesas)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseChart;
