import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlunoFinanceiro {
  id: string;
  nome: string;
  totalGeral: number;
  totalPago: number;
  totalPendente: number;
  parcelas: Parcela[];
}

interface Parcela {
  id: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
  tipo: string;
  registro_id: string;
}

interface NovaParcelaForm {
  tipo: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
  aluno_id: string;
}

const StudentGroupingView = () => {
  const [alunos, setAlunos] = useState<AlunoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editandoParcela, setEditandoParcela] = useState<Parcela | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novaParcela, setNovaParcela] = useState<NovaParcelaForm>({
    tipo: '',
    numero: 1,
    valor: 0,
    vencimento: '',
    status: 'Pendente',
    aluno_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          *,
          alunos (id, nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por aluno
      const alunosMap = new Map<string, AlunoFinanceiro>();
      
      data?.forEach((registro: any) => {
        const alunoId = registro.aluno_id;
        const alunoNome = registro.alunos?.nome || 'Nome não encontrado';
        
        if (!alunosMap.has(alunoId)) {
          alunosMap.set(alunoId, {
            id: alunoId,
            nome: alunoNome,
            totalGeral: 0,
            totalPago: 0,
            totalPendente: 0,
            parcelas: []
          });
        }
        
        const aluno = alunosMap.get(alunoId)!;
        
        // Gerar parcelas para este registro
        const parcelas = gerarParcelas(registro);
        aluno.parcelas.push(...parcelas);
        
        // Calcular totais
        aluno.totalGeral += registro.valor_total || 0;
        
        parcelas.forEach(parcela => {
          if (parcela.status === 'Pago') {
            aluno.totalPago += parcela.valor;
          } else {
            aluno.totalPendente += parcela.valor;
          }
        });
      });
      
      setAlunos(Array.from(alunosMap.values()));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarParcelas = (registro: any): Parcela[] => {
    const parcelas: Parcela[] = [];
    const dataBase = new Date(registro.data_primeiro_vencimento || new Date());
    
    // Parcelas do plano
    if (registro.valor_plano > 0) {
      const numParcelas = registro.numero_parcelas_plano || 1;
      const valorParcela = registro.valor_plano / numParcelas;
      
      for (let i = 1; i <= numParcelas; i++) {
        const vencimento = new Date(dataBase);
        vencimento.setMonth(vencimento.getMonth() + i - 1);
        
        parcelas.push({
          id: `plano-${registro.id}-${i}`,
          numero: i,
          valor: valorParcela,
          vencimento: vencimento.toISOString().split('T')[0],
          status: determinarStatus(vencimento, i),
          tipo: 'Plano',
          registro_id: registro.id
        });
      }
    }
    
    // Parcelas do material
    if (registro.valor_material > 0) {
      const numParcelas = registro.numero_parcelas_material || 1;
      const valorParcela = registro.valor_material / numParcelas;
      
      for (let i = 1; i <= numParcelas; i++) {
        const vencimento = new Date(dataBase);
        vencimento.setMonth(vencimento.getMonth() + i - 1);
        
        parcelas.push({
          id: `material-${registro.id}-${i}`,
          numero: i,
          valor: valorParcela,
          vencimento: vencimento.toISOString().split('T')[0],
          status: determinarStatus(vencimento, i),
          tipo: 'Material',
          registro_id: registro.id
        });
      }
    }
    
    // Parcela da matrícula
    if (registro.valor_matricula > 0) {
      parcelas.push({
        id: `matricula-${registro.id}-1`,
        numero: 1,
        valor: registro.valor_matricula,
        vencimento: dataBase.toISOString().split('T')[0],
        status: 'Pago',
        tipo: 'Matrícula',
        registro_id: registro.id
      });
    }
    
    return parcelas;
  };

  const determinarStatus = (vencimento: Date, numeroParcela: number): 'Pago' | 'Pendente' | 'Vencido' => {
    const hoje = new Date();
    
    // Simular algumas parcelas pagas
    if (numeroParcela <= 2) return 'Pago';
    
    // Se venceu, marcar como vencido
    if (vencimento < hoje) return 'Vencido';
    
    return 'Pendente';
  };

  const abrirModalCriarParcela = (alunoId: string, alunoNome: string) => {
    setNovaParcela({
      tipo: '',
      numero: 1,
      valor: 0,
      vencimento: '',
      status: 'Pendente',
      aluno_id: alunoId
    });
    setIsDialogOpen(true);
  };

  const abrirModalEditarParcela = (parcela: Parcela) => {
    setEditandoParcela(parcela);
    setIsEditModalOpen(true);
  };

  const criarParcela = async () => {
    try {
      if (!novaParcela.tipo || !novaParcela.vencimento || !novaParcela.aluno_id) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      const novaParcela_: Parcela = {
        id: `custom-${Date.now()}`,
        numero: novaParcela.numero,
        valor: novaParcela.valor,
        vencimento: novaParcela.vencimento,
        status: novaParcela.status,
        tipo: novaParcela.tipo,
        registro_id: 'custom'
      };

      // Atualizar o estado local
      setAlunos(prev => prev.map(aluno => {
        if (aluno.id === novaParcela.aluno_id) {
          const novasParcelas = [...aluno.parcelas, novaParcela_];
          const novoTotal = aluno.totalGeral + novaParcela.valor;
          const novoPago = novaParcela.status === 'Pago' ? aluno.totalPago + novaParcela.valor : aluno.totalPago;
          const novoPendente = novaParcela.status !== 'Pago' ? aluno.totalPendente + novaParcela.valor : aluno.totalPendente;
          
          return {
            ...aluno,
            parcelas: novasParcelas,
            totalGeral: novoTotal,
            totalPago: novoPago,
            totalPendente: novoPendente
          };
        }
        return aluno;
      }));

      toast({
        title: "Sucesso",
        description: "Parcela criada com sucesso!",
      });

      setNovaParcela({
        tipo: '',
        numero: 1,
        valor: 0,
        vencimento: '',
        status: 'Pendente',
        aluno_id: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a parcela.",
        variant: "destructive",
      });
    }
  };

  const salvarEdicaoParcela = async () => {
    if (!editandoParcela) return;

    try {
      console.log('Salvando parcela editada:', editandoParcela);

      setAlunos(prev => prev.map(aluno => ({
        ...aluno,
        parcelas: aluno.parcelas.map(p => 
          p.id === editandoParcela.id ? editandoParcela : p
        )
      })));

      toast({
        title: "Sucesso",
        description: "Parcela editada com sucesso!",
      });

      setIsEditModalOpen(false);
      setEditandoParcela(null);
    } catch (error) {
      console.error('Erro ao editar parcela:', error);
      toast({
        title: "Erro",
        description: "Não foi possível editar a parcela.",
        variant: "destructive",
      });
    }
  };

  const excluirParcela = async (parcelaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta parcela?')) return;

    try {
      console.log('Excluindo parcela:', parcelaId);

      setAlunos(prev => prev.map(aluno => ({
        ...aluno,
        parcelas: aluno.parcelas.filter(p => p.id !== parcelaId),
        totalGeral: aluno.totalGeral - (aluno.parcelas.find(p => p.id === parcelaId)?.valor || 0),
        totalPago: aluno.totalPago - (aluno.parcelas.find(p => p.id === parcelaId && p.status === 'Pago')?.valor || 0),
        totalPendente: aluno.totalPendente - (aluno.parcelas.find(p => p.id === parcelaId && p.status !== 'Pago')?.valor || 0)
      })));

      toast({
        title: "Sucesso",
        description: "Parcela excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir parcela:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a parcela.",
        variant: "destructive",
      });
    }
  };

  const toggleStudentExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800';
      case 'Vencido':
        return 'bg-red-100 text-red-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Registros Financeiros por Aluno</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome do aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Modal de criar parcela */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Parcela</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aluno" className="text-right">
                Aluno
              </Label>
              <div className="col-span-3">
                <Input
                  value={alunos.find(a => a.id === novaParcela.aluno_id)?.nome || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select value={novaParcela.tipo} onValueChange={(value) => setNovaParcela(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plano">Plano</SelectItem>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Matrícula">Matrícula</SelectItem>
                  <SelectItem value="Taxa">Taxa</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numero" className="text-right">
                Parcela
              </Label>
              <Input
                id="numero"
                type="number"
                value={novaParcela.numero}
                onChange={(e) => setNovaParcela(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))}
                className="col-span-3"
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={novaParcela.valor}
                onChange={(e) => setNovaParcela(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                className="col-span-3"
                min="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vencimento" className="text-right">
                Vencimento
              </Label>
              <Input
                id="vencimento"
                type="date"
                value={novaParcela.vencimento}
                onChange={(e) => setNovaParcela(prev => ({ ...prev, vencimento: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={novaParcela.status} onValueChange={(value: 'Pago' | 'Pendente' | 'Vencido') => setNovaParcela(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={criarParcela} className="bg-red-600 hover:bg-red-700">
              Criar Parcela
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edição de parcela */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Parcela</DialogTitle>
          </DialogHeader>
          {editandoParcela && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select 
                  value={editandoParcela.tipo} 
                  onValueChange={(value) => setEditandoParcela(prev => prev ? {...prev, tipo: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plano">Plano</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Matrícula">Matrícula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-numero">Número da Parcela</Label>
                <Input
                  id="edit-numero"
                  type="number"
                  value={editandoParcela.numero}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, numero: parseInt(e.target.value) || 1} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-valor">Valor</Label>
                <Input
                  id="edit-valor"
                  type="number"
                  step="0.01"
                  value={editandoParcela.valor}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, valor: parseFloat(e.target.value) || 0} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-vencimento">Data de Vencimento</Label>
                <Input
                  id="edit-vencimento"
                  type="date"
                  value={editandoParcela.vencimento}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, vencimento: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editandoParcela.status} 
                  onValueChange={(value: 'Pago' | 'Pendente' | 'Vencido') => setEditandoParcela(prev => prev ? {...prev, status: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={salvarEdicaoParcela}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabela principal */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos ({filteredAlunos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome do Aluno</TableHead>
                <TableHead>Total Geral</TableHead>
                <TableHead>Total Pago</TableHead>
                <TableHead>Total Pendente</TableHead>
                <TableHead>Parcelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlunos.map((aluno) => {
                const isExpanded = expandedStudents.has(aluno.id);
                
                return (
                  <React.Fragment key={aluno.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleStudentExpansion(aluno.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{aluno.nome}</TableCell>
                      <TableCell>{formatCurrency(aluno.totalGeral)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(aluno.totalPago)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(aluno.totalPendente)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge className="bg-green-100 text-green-800">
                            {aluno.parcelas.filter(p => p.status === 'Pago').length} Pagas
                          </Badge>
                          <Badge className="bg-red-100 text-red-800">
                            {aluno.parcelas.filter(p => p.status === 'Vencido').length} Vencidas
                          </Badge>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {aluno.parcelas.filter(p => p.status === 'Pendente').length} Pendentes
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Linha expandida com todas as parcelas */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="bg-gray-50 p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold">Todas as Parcelas de {aluno.nome}</h4>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalCriarParcela(aluno.id, aluno.nome);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Parcela
                              </Button>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tipo</TableHead>
                                  <TableHead>Parcela</TableHead>
                                  <TableHead>Valor</TableHead>
                                  <TableHead>Vencimento</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {aluno.parcelas
                                  .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
                                  .map((parcela) => (
                                    <TableRow key={parcela.id}>
                                      <TableCell>{parcela.tipo}</TableCell>
                                      <TableCell>{parcela.numero}</TableCell>
                                      <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                                      <TableCell>{formatDate(parcela.vencimento)}</TableCell>
                                      <TableCell>
                                        <Badge className={getStatusColor(parcela.status)}>
                                          {parcela.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => abrirModalEditarParcela(parcela)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => excluirParcela(parcela.id)}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredAlunos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum aluno encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGroupingView;