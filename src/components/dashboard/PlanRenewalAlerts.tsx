import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PlanRenewalAlert {
  id: string;
  nome_aluno: string;
  aluno_id: string;
  ultima_parcela: number;
  data_renovacao: string;
  dias_para_renovacao: number;
}

const PlanRenewalAlerts = () => {
  const [renewalAlerts, setRenewalAlerts] = useState<PlanRenewalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPlanRenewalAlerts = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da tabela parcelas com informações do aluno
      const { data: parcelasData, error } = await supabase
        .from('parcelas')
        .select(`
          id,
          aluno_id,
          nome_aluno,
          data_criacao,
          material_1x, material_2x, material_3x, material_4x, material_5x, material_6x,
          material_7x, material_8x, material_9x, material_10x, material_11x, material_12x,
          matricula_1x, matricula_2x, matricula_3x, matricula_4x, matricula_5x, matricula_6x,
          matricula_7x, matricula_8x, matricula_9x, matricula_10x, matricula_11x, matricula_12x,
          plano_1x, plano_2x, plano_3x, plano_4x, plano_5x, plano_6x,
          plano_7x, plano_8x, plano_9x, plano_10x, plano_11x, plano_12x
        `)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      const alerts: PlanRenewalAlert[] = [];

      parcelasData?.forEach((parcela) => {
        // Verificar a última parcela para cada tipo (material, matrícula, plano)
        const tipos = ['material', 'matricula', 'plano'];
        
        tipos.forEach((tipo) => {
          let ultimaParcela = 0;
          
          // Encontrar a última parcela com valor
          for (let i = 12; i >= 1; i--) {
            const coluna = `${tipo}_${i}x`;
            if (parcela[coluna] && parcela[coluna] > 0) {
              ultimaParcela = i;
              break;
            }
          }
          
          // Se encontrou uma última parcela, calcular data de renovação
          if (ultimaParcela > 0) {
            const dataBase = new Date(parcela.data_criacao);
            const dataRenovacao = new Date(dataBase);
            dataRenovacao.setMonth(dataRenovacao.getMonth() + 12); // 12 meses após a primeira parcela
            
            const hoje = new Date();
            const diasParaRenovacao = Math.ceil((dataRenovacao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            
            // Alertar quando faltam 30 dias ou menos para renovação
            if (diasParaRenovacao <= 30 && diasParaRenovacao >= 0) {
              alerts.push({
                id: `${parcela.id}_${tipo}`,
                nome_aluno: parcela.nome_aluno,
                aluno_id: parcela.aluno_id,
                ultima_parcela: ultimaParcela,
                data_renovacao: dataRenovacao.toISOString().split('T')[0],
                dias_para_renovacao: diasParaRenovacao
              });
            }
          }
        });
      });

      // Remover duplicatas por aluno
      const alertsUnicos = alerts.filter((alert, index, self) => 
        index === self.findIndex(a => a.aluno_id === alert.aluno_id)
      );

      setRenewalAlerts(alertsUnicos);

    } catch (error) {
      console.error('Erro ao buscar alertas de renovação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas de renovação de planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const showRenewalAlert = (alert: PlanRenewalAlert) => {
    toast({
      title: "⚠️ Última Parcela Detectada",
      description: `Esta é a última parcela do aluno ${alert.nome_aluno}. Por favor, criar novo plano de pagamento em ${alert.data_renovacao}.`,
      duration: 8000,
    });
  };

  useEffect(() => {
    fetchPlanRenewalAlerts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={renewalAlerts.length > 0 ? "border-yellow-300 bg-yellow-50 cursor-pointer" : "cursor-pointer"}
      onClick={() => navigate('/financial?tab=renovacao')}
      tabIndex={0}
      title="Clique para ver detalhes de renovação"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Renovações de Planos</CardTitle>
        <RefreshCw className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-yellow-600">
          {renewalAlerts.length}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Próximos 30 dias
        </p>
        {renewalAlerts.length > 0 && (
          <div className="mt-3 space-y-1">
            {renewalAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-xs">
                <span className="font-medium">{alert.nome_aluno}</span> - {alert.dias_para_renovacao} dias
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 h-5 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    showRenewalAlert(alert);
                  }}
                >
                  Alertar
                </Button>
              </div>
            ))}
            {renewalAlerts.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{renewalAlerts.length - 3} mais...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanRenewalAlerts;