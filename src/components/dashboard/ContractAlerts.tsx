
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ContractAlert {
  id: string;
  aluno_nome: string;
  data_fim: string;
  dias_restantes: number;
  situacao: string;
  valor_mensalidade: number;
}

const ContractAlerts = () => {
  const [contractsExpiring, setContractsExpiring] = useState<ContractAlert[]>([]);
  const [contractsExpired, setContractsExpired] = useState<ContractAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchContractAlerts = async () => {
    try {
      setLoading(true);
      
      const { data: contractsData, error } = await supabase
        .from('contratos_vencendo')
        .select('*')
        .order('dias_restantes', { ascending: true });

      if (error) throw error;

      const expiring = contractsData?.filter(c => c.situacao === 'vencendo') || [];
      const expired = contractsData?.filter(c => c.situacao === 'vencido') || [];

      setContractsExpiring(expiring);
      setContractsExpired(expired);

    } catch (error) {
      console.error('Erro ao buscar alertas de contratos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas de contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractAlerts();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">

      {/* Contratos Vencendo */}
      <Card
        className={contractsExpiring.length > 0 ? "border-orange-300 bg-orange-50 cursor-pointer" : "cursor-pointer"}
        onClick={() => navigate('/contracts?alerta=vencendo')}
        tabIndex={0}
        title="Clique para ver contratos vencendo"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contratos Vencendo</CardTitle>
          <Calendar className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {contractsExpiring.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Próximos 30 dias
          </p>
          {contractsExpiring.length > 0 && (
            <div className="mt-3 space-y-1">
              {contractsExpiring.slice(0, 3).map((contract) => (
                <div key={contract.id} className="text-xs">
                  <span className="font-medium">{contract.aluno_nome}</span> - {contract.dias_restantes} dias
                </div>
              ))}
              {contractsExpiring.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{contractsExpiring.length - 3} mais...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contratos Vencidos */}
      <Card
        className={contractsExpired.length > 0 ? "border-red-300 bg-red-50 cursor-pointer" : "cursor-pointer"}
        onClick={() => navigate('/contracts?alerta=vencido')}
        tabIndex={0}
        title="Clique para ver contratos vencidos"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contratos Vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {contractsExpired.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requerem ação imediata
          </p>
          {contractsExpired.length > 0 && (
            <div className="mt-3 space-y-1">
              {contractsExpired.slice(0, 3).map((contract) => (
                <div key={contract.id} className="text-xs">
                  <span className="font-medium">{contract.aluno_nome}</span> - Vencido
                </div>
              ))}
              {contractsExpired.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{contractsExpired.length - 3} mais...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ContractAlerts;
