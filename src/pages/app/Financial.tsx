import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/shared/PermissionButton';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

interface Boleto {
  id: string;
  aluno_id: string;
  data_vencimento: string;
  valor: number;
  status: string;
  descricao: string;
  link_pagamento: string | null;
  alunos?: { nome: string };
}

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  status: string;
}

interface Student {
  id: string;
  nome: string;
}

const Financial = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBoletoDialogOpen, setIsBoletoDialogOpen] = useState(false);
  const [isDespesaDialogOpen, setIsDespesaDialogOpen] = useState(false);
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const { toast } = useToast();
  const { hasPermission, isOwner } = usePermissions();
  const { register: registerBoleto, handleSubmit: handleSubmitBoleto, reset: resetBoleto, setValue: setValueBoleto } = useForm();
  const { register: registerDespesa, handleSubmit: handleSubmitDespesa, reset: resetDespesa, setValue: setValueDespesa } = useForm();

  useEffect(() => {
    fetchBoletos();
    fetchDespesas();
    fetchStudents();
  }, []);

  const fetchBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('boletos')
        .select(`
          *,
          alunos (nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      setBoletos(data || []);
    } catch (error) {
      console.error('Erro ao buscar boletos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os boletos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const onSubmitBoleto = async (data: any) => {
    try {
      const formData = {
        ...data,
        valor: parseFloat(data.valor)
      };

      if (editingBoleto) {
        const { error } = await supabase
          .from('boletos')
          .update(formData)
          .eq('id', editingBoleto.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Boleto atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('boletos')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Boleto criado com sucesso!",
        });
      }

      setIsBoletoDialogOpen(false);
      setEditingBoleto(null);
      resetBoleto();
      fetchBoletos();
    } catch (error) {
      console.error('Erro ao salvar boleto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o boleto.",
        variant: "destructive",
      });
    }
  };

  const onSubmitDespesa = async (data: any) => {
    try {
      const formData = {
        ...data,
        valor: parseFloat(data.valor)
      };

      if (editingDespesa) {
        const { error } = await supabase
          .from('despesas')
          .update(formData)
          .eq('id', editingDespesa.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Despesa criada com sucesso!",
        });
      }

      setIsDespesaDialogOpen(false);
      setEditingDespesa(null);
      resetDespesa();
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a despesa.",
        variant: "destructive",
      });
    }
  };

  const deleteBoleto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este boleto?')) return;

    try {
      const { error } = await supabase
        .from('boletos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Boleto excluído com sucesso!",
      });
      fetchBoletos();
    } catch (error) {
      console.error('Erro ao excluir boleto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o boleto.",
        variant: "destructive",
      });
    }
  };

  const deleteDespesa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a despesa.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openEditBoletoDialog = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setValueBoleto('aluno_id', boleto.aluno_id);
    setValueBoleto('data_vencimento', boleto.data_vencimento);
    setValueBoleto('valor', boleto.valor);
    setValueBoleto('status', boleto.status);
    setValueBoleto('descricao', boleto.descricao);
    setValueBoleto('link_pagamento', boleto.link_pagamento || '');
    setIsBoletoDialogOpen(true);
  };

  const openEditDespesaDialog = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setValueDespesa('descricao', despesa.descricao);
    setValueDespesa('valor', despesa.valor);
    setValueDespesa('data', despesa.data);
    setValueDespesa('categoria', despesa.categoria);
    setValueDespesa('status', despesa.status);
    setIsDespesaDialogOpen(true);
  };

  const totalReceitas = boletos
    .filter(b => b.status === 'Pago')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalDespesas = despesas
    .filter(d => d.status === 'Pago')
    .reduce((sum, d) => sum + d.valor, 0);

  if (loading) {
    return (
      <PermissionGuard permission="visualizarFinanceiro">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando dados financeiros...</p>
          </div>
        </div>
      </PermissionGuard>
    );
  }
  return (
    <PermissionGuard permission="visualizarFinanceiro">
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

      <Tabs defaultValue="boletos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="boletos">Receitas / Boletos</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="boletos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Boletos e Receitas</h2>
            <Dialog open={isBoletoDialogOpen} onOpenChange={setIsBoletoDialogOpen}>
              <DialogTrigger asChild>
                <PermissionButton
                  permission="gerenciarFinanceiro"
                  onClick={() => { setEditingBoleto(null); resetBoleto(); setIsBoletoDialogOpen(true); }}
                  className="bg-brand-red hover:bg-brand-red/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Boleto
                </PermissionButton>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingBoleto ? 'Editar Boleto' : 'Novo Boleto'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitBoleto(onSubmitBoleto)} className="space-y-4">
                  <div>
                    <Label htmlFor="aluno_id">Aluno *</Label>
                    <Select onValueChange={(value) => setValueBoleto('aluno_id', value)} defaultValue={editingBoleto?.aluno_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      {...registerBoleto('descricao', { required: true })}
                      placeholder="Ex: Mensalidade Janeiro 2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor">Valor *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      {...registerBoleto('valor', { required: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      {...registerBoleto('data_vencimento', { required: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setValueBoleto('status', value)} defaultValue={editingBoleto?.status || 'Pendente'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="link_pagamento">Link de Pagamento</Label>
                    <Input
                      id="link_pagamento"
                      {...registerBoleto('link_pagamento')}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                      {editingBoleto ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsBoletoDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {boletos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum boleto cadastrado ainda.</p>
                  <p className="text-sm text-gray-400">Clique no botão "Novo Boleto" para começar.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boletos.map((boleto) => (
                      <TableRow key={boleto.id}>
                        <TableCell className="font-medium">{boleto.alunos?.nome}</TableCell>
                        <TableCell>{boleto.descricao}</TableCell>
                        <TableCell className="font-medium">
                          R$ {boleto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(boleto.status)}>
                            {boleto.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <PermissionButton
                              permission="gerenciarFinanceiro"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditBoletoDialog(boleto)}
                            >
                              <Edit className="h-4 w-4" />
                            </PermissionButton>
                            <PermissionButton
                              permission="gerenciarFinanceiro"
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBoleto(boleto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </PermissionButton>
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

        <TabsContent value="despesas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Despesas</h2>
            <Dialog open={isDespesaDialogOpen} onOpenChange={setIsDespesaDialogOpen}>
              <DialogTrigger asChild>
                <PermissionButton
                  permission="gerenciarFinanceiro"
                  onClick={() => { setEditingDespesa(null); resetDespesa(); setIsDespesaDialogOpen(true); }}
                  className="bg-brand-red hover:bg-brand-red/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </PermissionButton>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitDespesa(onSubmitDespesa)} className="space-y-4">
                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      {...registerDespesa('descricao', { required: true })}
                      placeholder="Ex: Aluguel Janeiro 2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor">Valor *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      {...registerDespesa('valor', { required: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      {...registerDespesa('data', { required: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select onValueChange={(value) => setValueDespesa('categoria', value)} defaultValue={editingDespesa?.categoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salário">Salário</SelectItem>
                        <SelectItem value="aluguel">Aluguel</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="manutenção">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setValueDespesa('status', value)} defaultValue={editingDespesa?.status || 'Pendente'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                      {editingDespesa ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDespesaDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
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
                            <PermissionButton
                              permission="gerenciarFinanceiro"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDespesaDialog(despesa)}
                            >
                              <Edit className="h-4 w-4" />
                            </PermissionButton>
                            <PermissionButton
                              permission="gerenciarFinanceiro"
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDespesa(despesa.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </PermissionButton>
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
        </Tabs>
      </div>
    </PermissionGuard>
  );
};

export default Financial;
