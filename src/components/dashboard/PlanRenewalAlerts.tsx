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
      
      // Buscar dados da tabela financeiro_alunos com informações do aluno
      const { data: financialData, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          id,
          aluno_id,
          numero_parcelas_material,
          numero_parcelas_matricula,
          numero_parcelas_plano,
          created_at,
          alunos(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alerts: PlanRenewalAlert[] = [];

      financialData?.forEach((financial) => {
        // Verificar cada tipo de pagamento (material, matrícula, plano)
        const tipos = [
          { nome: 'material', parcelas: financial.numero_parcelas_material },
          { nome: 'matricula', parcelas: financial.numero_parcelas_matricula },
          { nome: 'plano', parcelas: financial.numero_parcelas_plano }
        ];
        
        tipos.forEach((tipo) => {
          if (tipo.parcelas && tipo.parcelas > 0) {
            // Calcular data de renovação (1 ano após a criação)
            const dataBase = new Date(financial.created_at);
            const dataRenovacao = new Date(dataBase);
            dataRenovacao.setFullYear(dataRenovacao.getFullYear() + 1);
            
            const hoje = new Date();
            const diasParaRenovacao = Math.ceil((dataRenovacao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            
            // Alertar quando faltam 30 dias ou menos para renovação
            if (diasParaRenovacao <= 30 && diasParaRenovacao >= 0) {
              alerts.push({
                id: `${financial.id}_${tipo.nome}`,
                nome_aluno: financial.alunos?.nome || 'Nome não encontrado',
                aluno_id: financial.aluno_id,
                ultima_parcela: tipo.parcelas,
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