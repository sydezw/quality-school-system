
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

interface StudentsLanguageChartProps {
  data: { name: string; value: number }[];
}

const StudentsLanguageChart = ({ data }: StudentsLanguageChartProps) => {
  const COLORS = ['#DC2626', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981'];

  return (
    <motion.div
      className="md:col-span-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 via-white to-pink-50 border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-2 shadow-md"
            >
              <Languages className="h-5 w-5" />
            </motion.div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-red-700 to-pink-700 bg-clip-text text-transparent">
                Alunos por Idioma
              </CardTitle>
              <p className="text-gray-600 text-sm mt-1">Distribuição por curso</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={data} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="drop-shadow-sm hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudentsLanguageChart;
