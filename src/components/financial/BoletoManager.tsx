import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useBoletos, type Boleto, type CriarBoletoData } from '@/hooks/useBoletos';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import DatePicker from '@/components/shared/DatePicker';
import { format } from 'date-fns';
import { formatarFormaPagamento } from '@/utils/formatters';

interface Student {
  id: string;
  nome: string;
}

interface BoletoManagerProps {
  filtroStatus?: string;
  alunoSelecionado?: string;
}

const BoletoManager = ({ filtroStatus = 'todos', alunoSelecionado }: BoletoManagerProps) => {
  const { boletos, loading, marcarComoPago, criarBoletoAvulso } = useBoletos();
  const [students, setStudents] = useState<Student[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filtroLocal, setFiltroLocal] = useState(filtroStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataVencimento, setDataVencimento] = useState<Date | null>(null);

  const { register, handleSubmit, reset, control, setValue } = useForm<CriarBoletoData>();

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Parcialmente Pago': return 'bg-blue-100 text-blue-800';
      case 'Arquivado': return 'bg-gray-100' + ' ' + 'text-gray-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100' + ' ' + 'text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const onSubmit = async (data: CriarBoletoData) => {
    try {
      await criarBoletoAvulso(data);
      setIsCreateDialogOpen(false);
      setDataVencimento(null);
      reset();
    } catch (error) {
      console.error('Erro ao criar boleto:', error);
    }
  };

  const handleMarcarComoPago = async (boletoId: string) => {
    const metodo = prompt('Método de pagamento:', 'Dinheiro');
    if (metodo) {
      await marcarComoPago(boletoId, metodo);
    }
  };

  // Filtrar boletos
  const boletosFiltrados = boletos.filter(boleto => {
    // Filtro por status
    if (filtroLocal !== 'todos' && boleto.status !== filtroLocal) {
      return false;
    }
    
    // Filtro por aluno selecionado
    if (alunoSelecionado && boleto.aluno_id !== alunoSelecionado) {
      return false;
    }
    
    // Filtro por termo de busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      return (
        boleto.alunos?.nome.toLowerCase().includes(termo) ||
        boleto.descricao.toLowerCase().includes(termo) ||
        boleto.id.toLowerCase().includes(termo)
      );
    }
    
    return true;
  });

  // Estatísticas dos boletos
  const stats = {
    total: boletosFiltrados.length,
    pendentes: boletosFiltrados.filter(b => b.status === 'Pendente').length,
    pagos: boletosFiltrados.filter(b => b.status === 'Pago').length,
    vencidos: boletosFiltrados.filter(b => b.status === 'Vencido').length,
    valorTotal: boletosFiltrados.reduce((sum, b) => sum + b.valor, 0),
    valorPendente: boletosFiltrados.filter(b => b.status !== 'Pago').reduce((sum, b) => sum + b.valor, 0)
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando boletos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Pagos</p>
                <p className="text-2xl font-bold">{stats.pagos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" style={{color: '#D90429'}} />
              <div>
                <p className="text-sm font-medium">Valor Pendente</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.valorPendente)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Boletos</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Boleto Avulso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Boleto Avulso</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="aluno_id">Aluno</Label>
                    <Controller
                      name="aluno_id"
                      control={control}
                      rules={{ required: 'Selecione um aluno' }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
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
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tipo_cobranca">Tipo de Cobrança</Label>
                    <Controller
                      name="tipo_cobranca"
                      control={control}
                      rules={{ required: 'Selecione o tipo de cobrança' }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plano">Plano</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="matricula">Matrícula</SelectItem>
                            <SelectItem value="cancelamento">Cancelamento</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      {...register('valor', { required: 'Valor é obrigatório', min: 0.01 })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                    <DatePicker
                      value={dataVencimento}
                      onChange={(date) => {
                        setDataVencimento(date);
                        // Atualizar o formulário com a data selecionada
                        if (date) {
                          setValue('data_vencimento', format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      placeholder="Selecione a data de vencimento"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      {...register('descricao', { required: 'Descrição é obrigatória' })}
                      placeholder="Descrição do boleto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      {...register('observacoes')}
                      placeholder="Observações adicionais (opcional)"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false);
                      setDataVencimento(null);
                      reset();
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Boleto
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por aluno, descrição ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filtroLocal} onValueChange={setFiltroLocal}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendentes</SelectItem>
                <SelectItem value="Pago">Pagos</SelectItem>
                <SelectItem value="Vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boletosFiltrados.map((boleto) => (
                  <TableRow key={boleto.id}>
                    <TableCell className="font-medium text-base">
                      {boleto.alunos?.nome || 'N/A'}
                    </TableCell>
                    <TableCell className="text-base">{boleto.descricao}</TableCell>
                    <TableCell className="text-base">{formatCurrency(boleto.valor)}</TableCell>
                    <TableCell className="text-base">{formatDate(boleto.data_vencimento)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(boleto.status)}>
                        {boleto.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-base">{formatarFormaPagamento(boleto.metodo_pagamento) || '-'}</TableCell>
                    <TableCell>
                      {boleto.status !== 'Pago' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarcarComoPago(boleto.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {boletosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum boleto encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoletoManager;