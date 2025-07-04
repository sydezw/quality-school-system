import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, User, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RenewalAlert {
  id: string;
  aluno_id: string;
  nome_aluno: string;
  tipo: 'material' | 'matricula' | 'plano';
  ultima_parcela: number;
  data_criacao: string;
  data_renovacao: string;
  dias_para_renovacao: number;
}

const RenewalAlertsTable: React.FC = () => {
  const [alerts, setAlerts] = useState<RenewalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRenewalAlerts();
  }, []);

  const fetchRenewalAlerts = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos registros financeiros com informações dos alunos
      const { data: registrosFinanceiros, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          id,
          aluno_id,
          created_at,
          numero_parcelas_material,
          numero_parcelas_matricula,
          numero_parcelas_plano,
          material_1x, material_2x, material_3x, material_4x, material_5x, material_6x,
          material_7x, material_8x, material_9x, material_10x, material_11x, material_12x,
          matricula_1x, matricula_2x, matricula_3x, matricula_4x, matricula_5x, matricula_6x,
          matricula_7x, matricula_8x, matricula_9x, matricula_10x, matricula_11x, matricula_12x,
          plano_1x, plano_2x, plano_3x, plano_4x, plano_5x, plano_6x,
          plano_7x, plano_8x, plano_9x, plano_10x, plano_11x, plano_12x,
          alunos!inner(
            nome
          )
        `);

      if (error) {
        console.error('Erro ao buscar registros financeiros:', error);
        return;
      }

      const renewalAlerts: RenewalAlert[] = [];
      const today = new Date();

      registrosFinanceiros?.forEach((registro: any) => {
        const dataCriacao = new Date(registro.created_at);
        const dataRenovacao = new Date(dataCriacao);
        dataRenovacao.setFullYear(dataRenovacao.getFullYear() + 1);
        
        const diasParaRenovacao = Math.ceil((dataRenovacao.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Verificar apenas se faltam 30 dias ou menos para renovação
        if (diasParaRenovacao <= 30 && diasParaRenovacao >= 0) {
          // Verificar material
          if (registro.numero_parcelas_material > 0) {
            const materialParcelas = [
              registro.material_1x, registro.material_2x, registro.material_3x, registro.material_4x,
              registro.material_5x, registro.material_6x, registro.material_7x, registro.material_8x,
              registro.material_9x, registro.material_10x, registro.material_11x, registro.material_12x
            ];
            
            let ultimaParcela = 0;
            for (let i = 0; i < materialParcelas.length; i++) {
              if (materialParcelas[i] && materialParcelas[i] > 0) {
                ultimaParcela = i + 1;
              }
            }
            
            if (ultimaParcela === registro.numero_parcelas_material) {
              renewalAlerts.push({
                id: `${registro.id}-material`,
                aluno_id: registro.aluno_id,
                nome_aluno: registro.alunos.nome,
                tipo: 'material',
                ultima_parcela: ultimaParcela,
                data_criacao: registro.created_at,
                data_renovacao: dataRenovacao.toISOString().split('T')[0],
                dias_para_renovacao: diasParaRenovacao
              });
            }
          }
          
          // Verificar matrícula
          if (registro.numero_parcelas_matricula > 0) {
            const matriculaParcelas = [
              registro.matricula_1x, registro.matricula_2x, registro.matricula_3x, registro.matricula_4x,
              registro.matricula_5x, registro.matricula_6x, registro.matricula_7x, registro.matricula_8x,
              registro.matricula_9x, registro.matricula_10x, registro.matricula_11x, registro.matricula_12x
            ];
            
            let ultimaParcela = 0;
            for (let i = 0; i < matriculaParcelas.length; i++) {
              if (matriculaParcelas[i] && matriculaParcelas[i] > 0) {
                ultimaParcela = i + 1;
              }
            }
            
            if (ultimaParcela === registro.numero_parcelas_matricula) {
              renewalAlerts.push({
                id: `${registro.id}-matricula`,
                aluno_id: registro.aluno_id,
                nome_aluno: registro.alunos.nome,
                tipo: 'matricula',
                ultima_parcela: ultimaParcela,
                data_criacao: registro.created_at,
                data_renovacao: dataRenovacao.toISOString().split('T')[0],
                dias_para_renovacao: diasParaRenovacao
              });
            }
          }
          
          // Verificar plano
          if (registro.numero_parcelas_plano > 0) {
            const planoParcelas = [
              registro.plano_1x, registro.plano_2x, registro.plano_3x, registro.plano_4x,
              registro.plano_5x, registro.plano_6x, registro.plano_7x, registro.plano_8x,
              registro.plano_9x, registro.plano_10x, registro.plano_11x, registro.plano_12x
            ];
            
            let ultimaParcela = 0;
            for (let i = 0; i < planoParcelas.length; i++) {
              if (planoParcelas[i] && planoParcelas[i] > 0) {
                ultimaParcela = i + 1;
              }
            }
            
            if (ultimaParcela === registro.numero_parcelas_plano) {
              renewalAlerts.push({
                id: `${registro.id}-plano`,
                aluno_id: registro.aluno_id,
                nome_aluno: registro.alunos.nome,
                tipo: 'plano',
                ultima_parcela: ultimaParcela,
                data_criacao: registro.created_at,
                data_renovacao: dataRenovacao.toISOString().split('T')[0],
                dias_para_renovacao: diasParaRenovacao
              });
            }
          }
        }
      });

      setAlerts(renewalAlerts);
    } catch (error) {
      console.error('Erro ao buscar alertas de renovação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas de renovação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'material': return 'Material';
      case 'matricula': return 'Matrícula';
      case 'plano': return 'Plano';
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'material': return 'bg-blue-100 text-blue-800';
      case 'matricula': return 'bg-green-100 text-green-800';
      case 'plano': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (dias: number) => {
    if (dias <= 7) return 'bg-red-100 text-red-800';
    if (dias <= 15) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando alertas de renovação...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Renovação ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum alerta de renovação no momento</p>
            <p className="text-sm">Todos os planos estão em dia!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">{alert.nome_aluno}</span>
                      <Badge className={getTipoColor(alert.tipo)}>
                        {getTipoLabel(alert.tipo)}
                      </Badge>
                      <Badge className={getUrgencyColor(alert.dias_para_renovacao)}>
                        {alert.dias_para_renovacao} dias
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Última parcela: {alert.ultima_parcela}x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Data de renovação: {new Date(alert.data_renovacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">
                        ⚠️ Esta é a última parcela! Por favor, criar novo plano de pagamento em {new Date(alert.data_renovacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button 
                      size="sm" 
                      className="bg-brand-red hover:bg-red-700"
                      onClick={() => {
                        // Navegar para a aba de cobranças
                        const tabsElement = document.querySelector('[value="cobrancas"]') as HTMLElement;
                        if (tabsElement) {
                          tabsElement.click();
                        }
                      }}
                    >
                      Criar Plano
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RenewalAlertsTable;