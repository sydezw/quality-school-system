import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Calendar, User, DollarSign, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewContractDialog } from '@/components/contracts/NewContractDialog';
import { EditContractDialog } from '@/components/contracts/EditContractDialog';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { PermissionButton } from '@/components/shared/PermissionButton';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Contract {
  id: string;
  aluno_id: string;
  aluno_nome: string;
  data_inicio: string;
  data_fim: string;
  dias_restantes: number;
  situacao: string;
  valor_mensalidade: number;
  status: 'Ativo' | 'Trancado' | 'Cancelado' | 'Encerrado';
  observacao?: string;
}

const Contracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired' | 'active'>('all');
  const { toast } = useToast();
  const { hasPermission, isOwner } = usePermissions();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      
      const { data: contractsData, error } = await supabase
        .from('contratos_vencendo')
        .select('*')
        .order('dias_restantes', { ascending: true });

      if (error) throw error;

      setContracts(contractsData || []);

    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleDeleteContract = async (contractId: string) => {
    if (!isOwner() && !hasPermission('gerenciarContratos')) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para realizar esta ação. Entre em contato com o administrador.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato excluído com sucesso.",
      });

      // Recarregar dados
      fetchContracts();

    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contrato.",
        variant: "destructive",
      });
    }
  };

  const handleTerminateContract = async (contractId: string, alunoId: string) => {
    try {
      // Atualizar status do contrato para 'Encerrado'
      const { error: contractError } = await supabase
        .from('contratos')
        .update({ status: 'Encerrado' })
        .eq('id', contractId);

      if (contractError) throw contractError;

      // Atualizar status do aluno para 'Cancelado'
      const { error: alunoError } = await supabase
        .from('alunos')
        .update({ 
          status: 'Cancelado',
          data_cancelamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', alunoId);

      if (alunoError) throw alunoError;

      toast({
        title: "Sucesso",
        description: "Contrato encerrado com sucesso.",
      });

      // Recarregar dados
      fetchContracts();

    } catch (error) {
      console.error('Erro ao encerrar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar o contrato.",
        variant: "destructive",
      });
    }
  };

  const handleRenewContract = async (contract: Contract) => {
    try {
      // Calcular nova data de fim (adicionar 1 ano à data de fim atual)
      const currentEndDate = new Date(contract.data_fim);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      // Criar observação com informações de início e renovação
      const dataInicioFormatada = new Date(contract.data_inicio).toLocaleDateString('pt-BR');
      const dataRenovacaoFormatada = newEndDate.toLocaleDateString('pt-BR');
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      
      const novaObservacao = contract.observacao 
        ? `${contract.observacao} - Renovado em ${dataHoje} (Início: ${dataInicioFormatada}, Nova data fim: ${dataRenovacaoFormatada})`
        : `Contrato iniciado em ${dataInicioFormatada} - Renovado em ${dataHoje} até ${dataRenovacaoFormatada}`;

      const { error } = await supabase
        .from('contratos')
        .update({
          data_fim: newEndDate.toISOString().split('T')[0],
          status: 'Ativo',
          observacao: novaObservacao
        })
        .eq('id', contract.id);

      if (error) throw error;

      // Atualizar aluno para ativo se estiver cancelado
      await supabase
        .from('alunos')
        .update({ 
          status: 'Ativo',
          data_cancelamento: null
        })
        .eq('id', contract.aluno_id);

      toast({
        title: "Sucesso",
        description: `Contrato renovado até ${newEndDate.toLocaleDateString('pt-BR')}.`,
      });

      fetchContracts();

    } catch (error) {
      console.error('Erro ao renovar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renovar o contrato.",
        variant: "destructive",
      });
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (filter === 'expiring') return contract.situacao === 'vencendo';
    if (filter === 'expired') return contract.situacao === 'vencido';
    if (filter === 'active') return contract.situacao === 'ativo';
    return true;
  });

  const getBadgeVariant = (situacao: string) => {
    switch (situacao) {
      case 'vencido': return 'destructive';
      case 'vencendo': return 'secondary';
      case 'ativo': return 'default';
      default: return 'outline';
    }
  };

  const getBadgeText = (situacao: string, diasRestantes: number) => {
    switch (situacao) {
      case 'vencido': return 'Vencido';
      case 'vencendo': return `${diasRestantes} dias`;
      case 'ativo': return 'Ativo';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-48"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  const contractsActive = contracts.filter(c => c.situacao === 'ativo').length;
  const contractsExpiring = contracts.filter(c => c.situacao === 'vencendo').length;
  const contractsExpired = contracts.filter(c => c.situacao === 'vencido').length;

  return (
    <PermissionGuard permission="visualizarContratos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestão de Contratos</h1>
          <NewContractDialog onContractCreated={fetchContracts} />
        </div>

      {/* Resumo dos Contratos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contractsActive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{contractsExpiring}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{contractsExpired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todos ({contracts.length})
        </Button>
        <Button 
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          Ativos ({contractsActive})
        </Button>
        <Button 
          variant={filter === 'expiring' ? 'default' : 'outline'}
          onClick={() => setFilter('expiring')}
          size="sm"
        >
          Vencendo ({contractsExpiring})
        </Button>
        <Button 
          variant={filter === 'expired' ? 'destructive' : 'outline'}
          onClick={() => setFilter('expired')}
          size="sm"
        >
          Vencidos ({contractsExpired})
        </Button>
      </div>

      {/* Tabela de Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contratos {filter === 'all' ? 'Todos' : filter === 'expiring' ? 'Vencendo' : filter === 'expired' ? 'Vencidos' : 'Ativos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {contract.aluno_nome}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(contract.data_inicio).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {new Date(contract.data_fim).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(contract.situacao)}>
                      {getBadgeText(contract.situacao, contract.dias_restantes)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      R$ {contract.valor_mensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {contract.observacao || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <EditContractDialog contract={contract} onContractUpdated={fetchContracts} />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <PermissionButton 
                            permission="gerenciarContratos"
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </PermissionButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteContract(contract.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {contract.situacao === 'vencido' && (
                        <>
                          <PermissionButton 
                            permission="gerenciarContratos"
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleTerminateContract(contract.id, contract.aluno_id)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Encerrar
                          </PermissionButton>
                          <PermissionButton 
                            permission="gerenciarContratos"
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRenewContract(contract)}
                          >
                            Renovar
                          </PermissionButton>
                        </>
                      )}
                      {contract.situacao === 'vencendo' && (
                        <>
                          <PermissionButton 
                            permission="gerenciarContratos"
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTerminateContract(contract.id, contract.aluno_id)}
                          >
                            Encerrar
                          </PermissionButton>
                          <PermissionButton 
                            permission="gerenciarContratos"
                            size="sm" 
                            variant="default"
                            onClick={() => handleRenewContract(contract)}
                          >
                            Renovar
                          </PermissionButton>
                        </>
                      )}
                      {contract.situacao === 'ativo' && (
                        <PermissionButton 
                          permission="gerenciarContratos"
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRenewContract(contract)}
                        >
                          Renovar
                        </PermissionButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContracts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum contrato encontrado para este filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  );
};

export default Contracts;
