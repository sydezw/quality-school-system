import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TurmaPrecoData {
  name: string;
  valor_plano: number;
  valor_total: number;
}

interface SimpleBarChartProps {
  data?: TurmaPrecoData[];
  title?: string;
  description?: string;
}

const SimpleBarChart = ({ data: propData, title = "Preços das Turmas", description }: SimpleBarChartProps) => {
  const [data, setData] = useState<TurmaPrecoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurmasPrecos = async () => {
      if (propData) {
        setData(propData);
        setLoading(false);
        return;
      }

      try {
        // Buscar turmas com seus planos financeiros
        const { data: financialData, error } = await supabase
          .from('financeiro_alunos')
          .select(`
            valor_plano,
            valor_total,
            alunos (
              turma_id,
              turma_particular_id,
              turmas:turma_id (
                nome
              ),
              turmas_particular:turma_particular_id (
                nome
              )
            ),
            planos (
              nome
            )
          `)
          .limit(10);

        if (error) throw error;

        // Processar dados para o gráfico
        const processedData: TurmaPrecoData[] = [];
        const turmasMap = new Map<string, { valor_plano: number; valor_total: number; count: number }>();

        financialData?.forEach(item => {
          const turma = item.alunos?.turmas || item.alunos?.turmas_particular;
          if (turma?.nome) {
            const existing = turmasMap.get(turma.nome) || { valor_plano: 0, valor_total: 0, count: 0 };
            existing.valor_plano += item.valor_plano || 0;
            existing.valor_total += item.valor_total || 0;
            existing.count += 1;
            turmasMap.set(turma.nome, existing);
          }
        });

        // Converter para array e calcular médias
        turmasMap.forEach((values, name) => {
          processedData.push({
            name,
            valor_plano: Math.round(values.valor_plano / values.count),
            valor_total: Math.round(values.valor_total / values.count)
          });
        });

        setData(processedData.slice(0, 6)); // Limitar a 6 turmas
      } catch (error) {
        console.error('Erro ao buscar preços das turmas:', error);
        // Dados de fallback
        setData([
          { name: 'Inglês Básico', valor_plano: 350, valor_total: 500 },
          { name: 'Inglês Inter.', valor_plano: 480, valor_total: 650 },
          { name: 'Inglês Avanç.', valor_plano: 650, valor_total: 850 },
          { name: 'Japonês Básico', valor_plano: 400, valor_total: 550 },
          { name: 'Japonês Inter.', valor_plano: 520, valor_total: 720 },
          { name: 'Particular', valor_plano: 800, valor_total: 950 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTurmasPrecos();
  }, [propData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${value}`,
                name === 'valor_plano' ? 'Valor do Plano' : 'Valor Total'
              ]}
            />
            <Legend 
              formatter={(value) => 
                value === 'valor_plano' ? 'Valor do Plano' : 'Valor Total'
              }
            />
            <Bar dataKey="valor_plano" fill="#000000" name="valor_plano" />
            <Bar dataKey="valor_total" fill="#EF4444" name="valor_total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SimpleBarChart;