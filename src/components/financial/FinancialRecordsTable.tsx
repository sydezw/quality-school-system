import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Search, Filter, Undo2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FinancialPlanDialog from './FinancialPlanDialog';

interface FinanceiroAluno {
  id: string;
  aluno_id: string;
  plano_id: string;
  valor_plano: number;
  valor_material: number;
  valor_matricula: number;
  desconto_total: number;
  valor_total: number;
  status_geral: string;
  data_primeiro_vencimento: string;
  forma_pagamento_plano: string;
  forma_pagamento_material: string;
  forma_pagamento_matricula: string;
  numero_parcelas_plano: number;
  numero_parcelas_material: number;
  numero_parcelas_matricula: number;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  alunos?: { nome: string };
  planos?: { nome: string };
}

interface Student {
  id: string;
  nome: string;
}

interface Plano {
  id: string;
  nome: string;
  valor_total: number;
}

const FinancialRecordsTable = () => {
  const [registros, setRegistros] = useState<FinanceiroAluno[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [editingRecord, setEditingRecord] = useState<FinanceiroAluno | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<FinanceiroAluno | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [undoRecord, setUndoRecord] = useState<FinanceiroAluno | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [isFinancialPlanDialogOpen, setIsFinancialPlanDialogOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRegistros(),
        fetchStudents(),
        fetchPlanos()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          *,
          alunos (nome),
          planos (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistros(data || []);
    } catch (error) {
      console.error('Erro ao buscar registros financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros financeiros.",
        variant: "destructive",
      });
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

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  const openEditDialog = (record: FinanceiroAluno) => {
    setEditingRecord(record);
    
    // Preencher o formulário com os dados do registro
    setValue('aluno_id', record.aluno_id);
    setValue('plano_id', record.plano_id);
    setValue('valor_plano', record.valor_plano);
    setValue('valor_material', record.valor_material);
    setValue('valor_matricula', record.valor_matricula);
    setValue('desconto_total', record.desconto_total);
    setValue('status_geral', record.status_geral);
    setValue('data_primeiro_vencimento', record.data_primeiro_vencimento);
    setValue('forma_pagamento_plano', record.forma_pagamento_plano);
    setValue('forma_pagamento_material', record.forma_pagamento_material);
    setValue('forma_pagamento_matricula', record.forma_pagamento_matricula);
    setValue('numero_parcelas_plano', record.numero_parcelas_plano);
    setValue('numero_parcelas_material', record.numero_parcelas_material);
    setValue('numero_parcelas_matricula', record.numero_parcelas_matricula);
    
    setIsEditDialogOpen(true);
  };

  const handleEdit = async (data: any) => {
    if (!editingRecord) return;

    try {
      // Calcular valor total
      const valorTotal = (data.valor_plano || 0) + (data.valor_material || 0) + (data.valor_matricula || 0) - (data.desconto_total || 0);

      const { error } = await supabase
        .from('financeiro_alunos')
        .update({
          aluno_id: data.aluno_id,
          plano_id: data.plano_id,
          valor_plano: parseFloat(data.valor_plano) || 0,
          valor_material: parseFloat(data.valor_material) || 0,
          valor_matricula: parseFloat(data.valor_matricula) || 0,
          desconto_total: parseFloat(data.desconto_total) || 0,
          valor_total: valorTotal,
          status_geral: data.status_geral,
          data_primeiro_vencimento: data.data_primeiro_vencimento,
          forma_pagamento_plano: data.forma_pagamento_plano,
          forma_pagamento_material: data.forma_pagamento_material,
          forma_pagamento_matricula: data.forma_pagamento_matricula,
          numero_parcelas_plano: parseInt(data.numero_parcelas_plano) || 1,
          numero_parcelas_material: parseInt(data.numero_parcelas_material) || 1,
          numero_parcelas_matricula: parseInt(data.numero_parcelas_matricula) || 1,
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro atualizado com sucesso!",
      });

      setIsEditDialogOpen(false);
      setEditingRecord(null);
      reset();
      fetchRegistros();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o registro.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (record: FinanceiroAluno) => {
    setDeletingRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      const { error } = await supabase
        .from('financeiro_alunos')
        .delete()
        .eq('id', deletingRecord.id);

      if (error) throw error;

      // Salvar para desfazer
      setUndoRecord(deletingRecord);
      setShowUndoToast(true);

      toast({
        title: "Registro excluído",
        description: (
          <div className="flex items-center justify-between">
            <span>Registro removido com sucesso</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              className="ml-2"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Desfazer
            </Button>
          </div>
        ),
      });

      setIsDeleteDialogOpen(false);
      setDeletingRecord(null);
      fetchRegistros();

      // Limpar opção de desfazer após 10 segundos
      setTimeout(() => {
        setUndoRecord(null);
        setShowUndoToast(false);
      }, 10000);
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro.",
        variant: "destructive",
      });
    }
  };

  const handleUndo = async () => {
    if (!undoRecord) return;

    try {
      const { error } = await supabase
        .from('financeiro_alunos')
        .insert({
          aluno_id: undoRecord.aluno_id,
          plano_id: undoRecord.plano_id,
          valor_plano: undoRecord.valor_plano,
          valor_material: undoRecord.valor_material,
          valor_matricula: undoRecord.valor_matricula,
          desconto_total: undoRecord.desconto_total,
          valor_total: undoRecord.valor_total,
          status_geral: undoRecord.status_geral,
          data_primeiro_vencimento: undoRecord.data_primeiro_vencimento,
          forma_pagamento_plano: undoRecord.forma_pagamento_plano,
          forma_pagamento_material: undoRecord.forma_pagamento_material,
          forma_pagamento_matricula: undoRecord.forma_pagamento_matricula,
          numero_parcelas_plano: undoRecord.numero_parcelas_plano,
          numero_parcelas_material: undoRecord.numero_parcelas_material,
          numero_parcelas_matricula: undoRecord.numero_parcelas_matricula,
        });

      if (error) throw error;

      toast({
        title: "Restaurado",
        description: "Registro restaurado com sucesso!",
      });

      setUndoRecord(null);
      setShowUndoToast(false);
      fetchRegistros();
    } catch (error) {
      console.error('Erro ao restaurar registro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível restaurar o registro.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'parcialmente pago':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pendente':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = registro.alunos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registro.planos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registro.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || registro.status_geral.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por aluno, plano ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcialmente pago">Parcialmente Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Registros Financeiros ({filteredRegistros.length})</CardTitle>
            <Button
              onClick={() => setIsFinancialPlanDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Plano de Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRegistros.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum registro encontrado.</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || statusFilter !== 'todos' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Nenhum plano de pagamento foi criado ainda.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Aluno</TableHead>
                    <TableHead className="font-semibold">Plano</TableHead>
                    <TableHead className="font-semibold">Valor Plano</TableHead>
                    <TableHead className="font-semibold">Valor Material</TableHead>
                    <TableHead className="font-semibold">Valor Matrícula</TableHead>
                    <TableHead className="font-semibold">Desconto</TableHead>
                    <TableHead className="font-semibold">Valor Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Data Vencimento</TableHead>
                    <TableHead className="font-semibold text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistros.map((registro, index) => (
                    <TableRow 
                      key={registro.id} 
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    >
                      <TableCell className="font-mono text-sm">
                        {registro.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {registro.alunos?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {registro.planos?.nome || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {registro.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {registro.valor_material.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {registro.valor_matricula.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        R$ {registro.desconto_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {registro.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(registro.status_geral)}>
                          {registro.status_geral}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(registro.data_primeiro_vencimento).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(registro)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteDialog(registro)}
                            className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro Financeiro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aluno_id">Aluno</Label>
                <Select value={watch('aluno_id')} onValueChange={(value) => setValue('aluno_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
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
                <Label htmlFor="plano_id">Plano</Label>
                <Select value={watch('plano_id')} onValueChange={(value) => setValue('plano_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((plano) => (
                      <SelectItem key={plano.id} value={plano.id}>
                        {plano.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="valor_plano">Valor do Plano</Label>
                <Input
                  id="valor_plano"
                  type="number"
                  step="0.01"
                  {...register('valor_plano')}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label htmlFor="valor_material">Valor do Material</Label>
                <Input
                  id="valor_material"
                  type="number"
                  step="0.01"
                  {...register('valor_material')}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label htmlFor="valor_matricula">Valor da Matrícula</Label>
                <Input
                  id="valor_matricula"
                  type="number"
                  step="0.01"
                  {...register('valor_matricula')}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desconto_total">Desconto Total</Label>
                <Input
                  id="desconto_total"
                  type="number"
                  step="0.01"
                  {...register('desconto_total')}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label htmlFor="status_geral">Status</Label>
                <Select value={watch('status_geral')} onValueChange={(value) => setValue('status_geral', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Parcialmente Pago">Parcialmente Pago</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="data_primeiro_vencimento">Data do Primeiro Vencimento</Label>
              <Input
                id="data_primeiro_vencimento"
                type="date"
                {...register('data_primeiro_vencimento')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="forma_pagamento_plano">Forma Pagamento Plano</Label>
                <Select value={watch('forma_pagamento_plano')} onValueChange={(value) => setValue('forma_pagamento_plano', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="forma_pagamento_material">Forma Pagamento Material</Label>
                <Select value={watch('forma_pagamento_material')} onValueChange={(value) => setValue('forma_pagamento_material', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="forma_pagamento_matricula">Forma Pagamento Matrícula</Label>
                <Select value={watch('forma_pagamento_matricula')} onValueChange={(value) => setValue('forma_pagamento_matricula', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero_parcelas_plano">Parcelas Plano</Label>
                <Select value={watch('numero_parcelas_plano')?.toString()} onValueChange={(value) => setValue('numero_parcelas_plano', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="numero_parcelas_material">Parcelas Material</Label>
                <Select value={watch('numero_parcelas_material')?.toString()} onValueChange={(value) => setValue('numero_parcelas_material', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="numero_parcelas_matricula">Parcelas Matrícula</Label>
                <Select value={watch('numero_parcelas_matricula')?.toString()} onValueChange={(value) => setValue('numero_parcelas_matricula', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Salvar Alterações
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingRecord(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro financeiro?
              <br />
              <strong>Aluno:</strong> {deletingRecord?.alunos?.nome}
              <br />
              <strong>Plano:</strong> {deletingRecord?.planos?.nome}
              <br />
              <strong>Valor Total:</strong> R$ {deletingRecord?.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <br /><br />
              Esta ação pode ser desfeita nos próximos 10 segundos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Criação de Plano Financeiro */}
      <FinancialPlanDialog
        isOpen={isFinancialPlanDialogOpen}
        onOpenChange={setIsFinancialPlanDialogOpen}
        onSuccess={() => {
          fetchData();
          toast({
            title: "Sucesso",
            description: "Plano financeiro criado com sucesso!",
          });
        }}
      />
    </div>
  );
};

export default FinancialRecordsTable;