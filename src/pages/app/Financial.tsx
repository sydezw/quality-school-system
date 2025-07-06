import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard, ChevronDown, ChevronRight, Check, Send, History, Filter, RefreshCw } from 'lucide-react';
import { useFinancial } from '@/hooks/useFinancial';
import FinancialDialogs from '@/components/financial/FinancialDialogs';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import RenewalAlertsTable from '@/components/financial/RenewalAlertsTable';
import FinancialRecordsTable from '@/components/financial/FinancialRecordsTable';
import StudentGroupingView from '@/components/financial/StudentGroupingView';
import { StatusAluno } from '@/types/financial';


// Interfaces movidas para @/types/financial

const Financial = () => {
  const {
    state,
    setState,
    dialogState,
    setDialogState,
    fetchBoletos,
    fetchContratos,
    calcularProgressoParcelas,
    obterStatusAluno,
    obterPlanoAluno,
    getStatusColor,
    marcarComoPago,
    refreshData,
    toast
  } = useFinancial();

  // Desestruturar variáveis do state
  const {
    boletos,
    despesas,
    students,
    alunosFinanceiros,
    historicoPagamentos,
    planosGenericos,
    contratos,
    loading,
    filtroStatus,
    viewMode,
    expandedAlunos,
    expandedToggles
  } = state;

  const {
    isBoletoDialogOpen,
    isDespesaDialogOpen,
    isNovoPlanoDialogOpen,
    isParcelaAvulsaDialogOpen,
    editingBoleto,
    editingDespesa,
    alunoSelecionadoParcela
  } = dialogState;

  // Effects movidos para useFinancial hook

  // Todas as funções foram movidas para o hook useFinancial

  // Funções auxiliares locais
  const filtrarAlunosPorStatus = (alunos: typeof alunosFinanceiros) => {
    if (filtroStatus === 'todos') return alunos;
    
    return alunos.filter(aluno => {
      switch (filtroStatus) {
        case 'inadimplentes':
          return aluno.boletosVencidos > 0;
        case 'pendentes':
          return aluno.boletos.some(b => b.status === 'Pendente');
        case 'pagos':
          return aluno.boletos.some(b => b.status === 'Pago');
        default:
          return true;
      }
    });
  };

  const totalReceitas = boletos
    .filter(b => b.status === 'Pago')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalDespesas = despesas
    .filter(d => d.status === 'Pago')
    .reduce((sum, d) => sum + d.valor, 0);

  const toggleAlunoExpanded = (alunoId: string) => {
    const newExpanded = new Set(expandedAlunos);
    if (newExpanded.has(alunoId)) {
      newExpanded.delete(alunoId);
    } else {
      newExpanded.add(alunoId);
    }
    setState(prev => ({
      ...prev,
      expandedAlunos: newExpanded
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financeiro</h1>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Pagas)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Pagas)</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registros" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registros">Registros</TabsTrigger>
          <TabsTrigger value="agrupamento">Agrupamento</TabsTrigger>
          <TabsTrigger value="operacional">Financeiro Operacional</TabsTrigger>
          <TabsTrigger value="renovacao">Renovações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="space-y-4">
          <FinancialRecordsTable />
        </TabsContent>

        <TabsContent value="agrupamento" className="space-y-4">
          <StudentGroupingView />
        </TabsContent>

        {/* ... existing TabsContent for operacional, renovacao, relatorios ... */}
        <TabsContent value="operacional" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Controle Financeiro da Escola</h2>
            <Dialog open={isDespesaDialogOpen} onOpenChange={(open) => setDialogState(prev => ({ ...prev, isDespesaDialogOpen: open }))}>            
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setDialogState(prev => ({ ...prev, editingDespesa: null, isDespesaDialogOpen: true })); 
                  }}
                  className="bg-brand-red hover:bg-brand-red/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p>Conteúdo do formulário de despesa será implementado aqui.</p>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                      {editingDespesa ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setDialogState(prev => ({ ...prev, isDespesaDialogOpen: false }))}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {despesas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma despesa cadastrada ainda.</p>
                  <p className="text-sm text-gray-400">Clique no botão "Nova Despesa" para começar.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas.map((despesa) => (
                      <TableRow key={despesa.id}>
                        <TableCell className="font-medium">{despesa.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{despesa.categoria}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(despesa.data).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(despesa.status)}>
                            {despesa.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDialogState(prev => ({ ...prev, editingDespesa: despesa, isDespesaDialogOpen: true }));
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                                  // Implementar função de deletar despesa
                                  toast({ title: 'Funcionalidade em desenvolvimento', variant: 'default' });
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Relatórios e Análises Financeiras</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Resumo Consolidado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Resumo Financeiro Consolidado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de Receitas (Pagas):</span>
                  <span className="font-semibold text-green-600">
                    R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de Despesas (Pagas):</span>
                  <span className="font-semibold text-red-600">
                    R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Saldo Líquido:</span>
                    <span className={`font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status de Cobranças */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Status das Cobranças
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Boletos Pendentes:</span>
                  <span className="font-semibold text-yellow-600">
                    {boletos.filter(b => b.status === 'Pendente').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Boletos Pagos:</span>
                  <span className="font-semibold text-green-600">
                    {boletos.filter(b => b.status === 'Pago').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Boletos Vencidos:</span>
                  <span className="font-semibold text-red-600">
                    {boletos.filter(b => b.status === 'Vencido').length}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total de Boletos:</span>
                    <span className="font-bold">{boletos.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Cobranças de Alunos:</strong> Gerencie boletos, parcelas e recibos dos estudantes</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Financeiro Operacional:</strong> Controle receitas consolidadas e despesas da escola</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Relatórios:</strong> Análises e resumos para tomada de decisão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renovacao" className="space-y-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Renovações de Planos</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Sistema de Alertas de Renovação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Como funciona:</h3>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>O sistema monitora automaticamente as parcelas 1x até 12x de cada aluno</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Quando a última parcela com valor é detectada, um alerta é gerado</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>A data de renovação é calculada como 12 meses após a primeira parcela</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Alertas aparecem no dashboard quando faltam 30 dias ou menos para renovação</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Ações Recomendadas:</h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Entre em contato com o aluno para discutir a renovação do plano</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Crie um novo plano de pagamento na aba "Cobranças de Alunos"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Atualize os dados financeiros do aluno conforme necessário</p>
                      </div>
                    </div>
                  </div>
                </div>
               </CardContent>
             </Card>
             
             <RenewalAlertsTable />
           </div>
         </TabsContent>
        

        
        {/* Todos os diálogos foram movidos para o componente FinancialDialogs */}
        <FinancialDialogs 
          dialogState={dialogState}
          setDialogState={setDialogState}
          students={students}
          planosGenericos={planosGenericos}
          onSubmitBoleto={() => Promise.resolve()}
          onSubmitDespesa={() => Promise.resolve()}
          criarNovoPlano={() => Promise.resolve()}
          criarParcelaAvulsa={() => Promise.resolve()}
          openEditDespesaDialog={() => {}}
        />
      </Tabs>
    </div>
  );
};

export default Financial;
