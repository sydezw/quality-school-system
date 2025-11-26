import { useState } from 'react';
import SimpleBarChart from '@/components/dashboard/SimpleBarChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SimpleBarChartExample = () => {
  // Dados de exemplo baseados no exemplo do Recharts
  const [data] = useState([
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
    },
  ]);

  const generateRandomData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      name: `Page ${String.fromCharCode(65 + i)}`,
      uv: Math.floor(Math.random() * 5000) + 1000,
      pv: Math.floor(Math.random() * 5000) + 1000,
    }));
  };

  const [chartData, setChartData] = useState(data);

  const handleRefreshData = () => {
    setChartData(generateRandomData());
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exemplo de Gráfico de Barras</h1>
          <p className="text-muted-foreground">
            Demonstração do componente SimpleBarChart baseado no exemplo do Recharts
          </p>
        </div>
        <Button onClick={handleRefreshData} variant="outline">
          Gerar Dados Aleatórios
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Gráfico Principal */}
        <SimpleBarChart 
          data={chartData}
          title="Gráfico de Barras Simples"
          description="Exemplo baseado no SimpleBarChart do Recharts"
        />

        {/* Informações sobre os dados */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Gráfico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">UV:</span>
                      <span className="text-sm font-medium">{item.uv.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">PV:</span>
                      <span className="text-sm font-medium">{item.pv.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre o componente */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Componente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Características:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Baseado no exemplo SimpleBarChart do Recharts</li>
                <li>Responsivo com ResponsiveContainer</li>
                <li>Inclui grid cartesiano, eixos X e Y</li>
                <li>Tooltip interativo e legenda</li>
                <li>Duas barras por categoria (UV e PV)</li>
                <li>Cores personalizáveis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Uso:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<SimpleBarChart 
  data={data}
  title="Título do Gráfico"
  description="Descrição opcional"
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleBarChartExample;