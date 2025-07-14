
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueExpenseChartProps {
  data: { name: string; Receitas: number; Despesas: number }[];
}

const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Receitas vs. Despesas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparativo mensal de receitas e despesas
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                name
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar 
              dataKey="Receitas" 
              fill="#22c55e" 
              name="Receitas"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              dataKey="Despesas" 
              fill="#ef4444" 
              name="Despesas"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseChart;
