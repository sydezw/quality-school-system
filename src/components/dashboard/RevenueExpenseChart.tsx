
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';

interface RevenueExpenseChartProps {
  data: { name: string; Receitas: number; Despesas: number }[];
}

const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  // Calcular lucro (Receitas - Despesas) para cada mês
  const chartData = data.map(item => ({
    month: item.name,
    Lucro: item.Receitas - item.Despesas,
    Despesas: item.Despesas
  }));

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Lucro vs. Despesas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparativo mensal de lucro e despesas
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ height: '300px' }}>
          <ResponsiveBar
            data={chartData}
            keys={['Lucro', 'Despesas']}
            indexBy="month"
            margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={({ id }) => {
              if (id === 'Lucro') return '#000000';
              if (id === 'Despesas') return '#ef4444';
              return '#cccccc';
            }}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 1.6]]
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Mês',
              legendPosition: 'middle',
              legendOffset: 32
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Valor (R$)',
              legendPosition: 'middle',
              legendOffset: -60,
              format: (value) => `R$ ${value.toLocaleString('pt-BR')}`
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1.6]]
            }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            tooltip={({ id, value, color }) => (
              <div
                style={{
                  background: 'white',
                  padding: '9px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <strong style={{ color }}>{id}</strong>
                <br />
                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
            role="application"
            ariaLabel="Gráfico de lucro vs despesas"
            barAriaLabel={e => `${e.id}: R$ ${e.formattedValue} em ${e.indexValue}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseChart;
