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
        // Buscar dados financeiros dos alunos agrupados por turma
        const { data: financialData, error } = await supabase
          .from('financeiro_alunos')
          .select(`
            id,
            valor_plano,
            valor_total,
            aluno_id,
            alunos!inner (
              id,
              nome,
              turma_id,
              turma_particular_id,
              turmas (
                id,
                nome
              ),
              turmas_particular (
                id,
                nome
              )
            )
          `);

        if (error) throw error;

        console.log('Dados financeiros encontrados:', financialData);

        // Processar dados para o gráfico
        const turmasMap = new Map<string, { valores_plano: number[]; valores_total: number[]; alunos: string[] }>();

        financialData?.forEach(item => {
          if (item.alunos) {
            const turma = item.alunos.turmas || item.alunos.turmas_particular;
            if (turma?.nome) {
              const existing = turmasMap.get(turma.nome) || { valores_plano: [], valores_total: [], alunos: [] };
              
              if (item.valor_plano) existing.valores_plano.push(item.valor_plano);
              if (item.valor_total) existing.valores_total.push(item.valor_total);
              if (item.alunos.nome && !existing.alunos.includes(item.alunos.nome)) {
                existing.alunos.push(item.alunos.nome);
              }
              
              turmasMap.set(turma.nome, existing);
            }
          }
        });

        // Converter para array com médias dos valores por turma
        const processedData: TurmaPrecoData[] = [];
        turmasMap.forEach((values, name) => {
          const avgValorPlano = values.valores_plano.length > 0 
            ? Math.round(values.valores_plano.reduce((a, b) => a + b, 0) / values.valores_plano.length)
            : 0;
          const avgValorTotal = values.valores_total.length > 0 
            ? Math.round(values.valores_total.reduce((a, b) => a + b, 0) / values.valores_total.length)
            : 0;
          
          if (avgValorPlano > 0 || avgValorTotal > 0) {
            processedData.push({
              name: `${name} (${values.alunos.length} alunos)`,
              valor_plano: avgValorPlano,
              valor_total: avgValorTotal
            });
          }
        });

        console.log('Dados processados para o gráfico:', processedData);
        setData(processedData.slice(0, 8)); // Limitar a 8 turmas
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