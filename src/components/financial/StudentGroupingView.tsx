import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Search, Plus, Edit, Trash2, Users, AlertCircle } from 'lucide-react';
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
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para gerar parcelas a partir de um registro financeiro
  const gerarParcelas = (registro: any): Parcela[] => {
    const parcelas: Parcela[] = [];
    
    // Se o registro tem informações de parcelas, gerar baseado nisso
    if (registro.numero_parcelas && registro.numero_parcelas > 0) {
      const valorParcela = registro.valor_total / registro.numero_parcelas;
      
      for (let i = 1; i <= registro.numero_parcelas; i++) {
        parcelas.push({
          id: `${registro.id}-${i}`,
          numero: i,
          valor: valorParcela,
          vencimento: registro.data_vencimento || new Date().toISOString().split('T')[0],
          status: registro.status_pagamento || 'Pendente',
          tipo: registro.tipo || 'Plano',
          registro_id: registro.id
        });
      }
    } else {
      // Caso não tenha parcelas definidas, criar uma única parcela
      parcelas.push({
        id: `${registro.id}-1`,
        numero: 1,
        valor: registro.valor_total || 0,
        vencimento: registro.data_vencimento || new Date().toISOString().split('T')[0],
        status: registro.status_pagamento || 'Pendente',
        tipo: registro.tipo || 'Plano',
        registro_id: registro.id
      });
    }
    
    return parcelas;
  };

  // Função para lidar com cliques em botões (evita propagação de eventos)
  const handleButtonClick = useCallback((callback: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    callback();
  }, []);

  // CORREÇÃO: Usar useCallback para evitar re-criação da função
  const fetchAlunos = useCallback(async () => {
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
        const parcelas = gerarParcelas(registro);
        
        aluno.parcelas.push(...parcelas);
        aluno.totalGeral += registro.valor_total || 0;
        
        // Calcular totais baseado no status das parcelas
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
      console.error('Erro ao buscar alunos financeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros dos alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // CORREÇÃO: Incluir toast nas dependências

  // CORREÇÃO: useEffect otimizado - só executa uma vez na montagem
  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]); // Incluir fetchAlunos nas dependências

  // CORREÇÃO: Memoizar funções que são passadas como callbacks
  // Função para salvar a posição do scroll
  const saveScrollPosition = useCallback(() => {
    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      setSavedScrollPosition(scrollContainer.scrollTop);
    }
  }, []);
  
  // Função para restaurar a posição do scroll com múltiplas tentativas
  const restoreScrollPosition = useCallback(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;
    
    // Primeira tentativa imediata
    scrollContainer.scrollTop = savedScrollPosition;
    
    // Segunda tentativa após um curto delay
    setTimeout(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = savedScrollPosition;
      }
    }, 0);
    
    // Terceira tentativa com requestAnimationFrame para garantir que o DOM foi atualizado
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = savedScrollPosition;
      }
      
      // Quarta tentativa após um delay maior
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = savedScrollPosition;
        }
      }, 100);
      
      // Quinta tentativa após um delay ainda maior
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = savedScrollPosition;
        }
      }, 300);
    });
  }, [savedScrollPosition]);

  // Modificar a função criarParcela para usar uma abordagem mais controlada ao fechar o modal
  const criarParcela = useCallback(async () => {
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
  
      // Salvar a posição atual do scroll
      saveScrollPosition();
  
      setAlunos(prev => prev.map(aluno => 
        aluno.id === novaParcela.aluno_id 
          ? { 
              ...aluno, 
              parcelas: [...aluno.parcelas, novaParcela_],
              totalGeral: aluno.totalGeral + novaParcela.valor,
              totalPendente: aluno.totalPendente + (novaParcela.status === 'Pendente' ? novaParcela.valor : 0),
              totalPago: aluno.totalPago + (novaParcela.status === 'Pago' ? novaParcela.valor : 0)
            }
          : aluno
      ));
  
      toast({
        title: "Sucesso",
        description: "Parcela criada com sucesso!",
      });
  
      // Fechar o modal de forma controlada
      setIsDialogOpen(false);
      
      // Resetar o formulário
      setNovaParcela({
        tipo: '',
        numero: 1,
        valor: 0,
        vencimento: '',
        status: 'Pendente',
        aluno_id: ''
      });
  
      // Restaurar a posição do scroll
      restoreScrollPosition();
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar parcela.",
        variant: "destructive",
      });
    }
  }, [novaParcela, toast, saveScrollPosition, restoreScrollPosition]);
  
  // Modificar a função salvarEdicaoParcela de forma similar
  const salvarEdicaoParcela = useCallback(async () => {
    if (!editandoParcela) return;
  
    try {
      // Salvar a posição atual do scroll
      saveScrollPosition();
  
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
  
      // Fechar o modal de forma controlada
      setIsEditModalOpen(false);
      setEditandoParcela(null);
  
      // Restaurar a posição do scroll
      restoreScrollPosition();
    } catch (error) {
      console.error('Erro ao salvar parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar parcela.",
        variant: "destructive",
      });
    }
  }, [editandoParcela, toast, saveScrollPosition, restoreScrollPosition]);

  const abrirModalCriarParcela = useCallback((alunoId: string, alunoNome: string) => {
    setNovaParcela({
      tipo: '',
      numero: 1,
      valor: 0,
      vencimento: '',
      status: 'Pendente',
      aluno_id: alunoId
    });
    setIsDialogOpen(true);
  }, []);

  const abrirModalEditarParcela = useCallback((parcela: Parcela) => {
    setEditandoParcela(parcela);
    setIsEditModalOpen(true);
  }, []);

  const excluirParcela = useCallback(async (parcelaId: string) => {
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
  }, [toast]);

  const toggleStudentExpansion = useCallback((studentId: string) => {
    // Salvar a posição atual do scroll antes da mudança
    const scrollContainer = containerRef.current;
    const currentScrollTop = scrollContainer?.scrollTop || 0;
    
    // Salvar no estado global também
    setSavedScrollPosition(currentScrollTop);
    
    const newExpanded = new Set(expandedStudents);
    const wasExpanded = newExpanded.has(studentId);
    
    if (wasExpanded) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    
    setExpandedStudents(newExpanded);
    
    // Usar um timeout para garantir que o DOM foi completamente atualizado
    if (wasExpanded && scrollContainer) {
      // Usar a função de restauração robusta
      setTimeout(restoreScrollPosition, 50);
    }
  }, [expandedStudents, restoreScrollPosition]);

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const filteredAlunos = useMemo(() => 
    alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    ), [alunos, searchTerm]
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
    <div ref={containerRef} className="space-y-4 overflow-auto">
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
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // Salvar a posição do scroll antes de fechar o modal
            saveScrollPosition();
            setIsDialogOpen(false);
            // Restaurar a posição do scroll após fechar o modal
            restoreScrollPosition();
          } else {
            setIsDialogOpen(true);
          }
        }}
      >
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
            <Button 
              variant="outline" 
              onClick={() => {
                // Salvar a posição do scroll antes de fechar o modal
                saveScrollPosition();
                setIsDialogOpen(false);
                // Restaurar a posição do scroll após fechar o modal
                restoreScrollPosition();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={criarParcela} className="bg-red-600 hover:bg-red-700">
              Criar Parcela
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edição de parcela */}
      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // Salvar a posição do scroll antes de fechar o modal
            saveScrollPosition();
            setIsEditModalOpen(false);
            // Restaurar a posição do scroll após fechar o modal
            restoreScrollPosition();
          } else {
            setIsEditModalOpen(true);
          }
        }}
      >
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
                  onClick={() => {
                    // Salvar a posição do scroll antes de fechar o modal
                    saveScrollPosition();
                    setIsEditModalOpen(false);
                    // Restaurar a posição do scroll após fechar o modal
                    restoreScrollPosition();
                  }}
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
                      className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      onClick={(e) => toggleStudentExpansion(aluno.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleStudentExpansion(aluno.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Recolher' : 'Expandir'} detalhes de ${aluno.nome}`}
                    >
                      <TableCell>
                        <div className="transition-transform duration-300 ease-in-out">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
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
                    
                    {/* Linha expandida com animação otimizada */}
                    {isExpanded && (
                      <TableRow className="transition-all duration-500 ease-in-out">
                        <TableCell colSpan={6} className="p-0">
                          <div className="bg-gray-50 p-4 border-l-4 border-blue-500 animate-fadeIn">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-lg text-gray-800">
                                Todas as Parcelas de {aluno.nome}
                              </h4>
                              <Button
                                onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome), e)}
                                className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Parcela
                              </Button>
                            </div>
                            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-100">
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Parcela</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {aluno.parcelas.length > 0 ? (
                                    aluno.parcelas
                                      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
                                      .map((parcela, index) => (
                                        <TableRow 
                                          key={parcela.id}
                                          className="hover:bg-gray-50 transition-colors duration-200 animate-slideInUp"
                                          style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                          <TableCell className="font-medium py-4">{parcela.tipo}</TableCell>
                                          <TableCell className="py-4">{parcela.numero}</TableCell>
                                          <TableCell className="font-semibold py-4">{formatCurrency(parcela.valor)}</TableCell>
                                          <TableCell className="py-4">{formatDate(parcela.vencimento)}</TableCell>
                                          <TableCell className="py-4">
                                            <Badge className={`${getStatusColor(parcela.status)} transition-all duration-200`}>
                                              {parcela.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="py-4">
                                            <div className="flex gap-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => handleButtonClick(() => abrirModalEditarParcela(parcela), e)}
                                                className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-200"
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => handleButtonClick(() => excluirParcela(parcela.id), e)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                  ) : (
                                    <>
                                      {/* Área de mensagem quando não há parcelas */}
                                      <TableRow>
                                        <TableCell colSpan={6} className="py-12">
                                          <div className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                                            <AlertCircle className="h-12 w-12 text-gray-400" />
                                            <div className="text-center">
                                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Nenhum registro financeiro encontrado
                                              </h3>
                                              <p className="text-gray-500 mb-4">
                                                Este aluno ainda não possui parcelas ou registros financeiros cadastrados.
                                              </p>
                                              <p className="text-sm text-gray-400">
                                                Clique no botão "Criar Parcela" acima para adicionar o primeiro registro.
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                      {/* Linhas de espaçamento extra */}
                                      {[1, 2, 3].map((i) => (
                                        <TableRow key={`spacing-${i}`}>
                                          <TableCell colSpan={6} className="py-3 border-b border-gray-100">
                                            <div className="flex justify-center">
                                              <div className="w-2 h-2 bg-gray-200 rounded-full mx-1"></div>
                                              <div className="w-2 h-2 bg-gray-200 rounded-full mx-1"></div>
                                              <div className="w-2 h-2 bg-gray-200 rounded-full mx-1"></div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </>
                                  )}
                                  
                                  {/* Linha de espaçamento final para melhor visualização */}
                                  {aluno.parcelas.length > 0 && (
                                    <TableRow>
                                      <TableCell colSpan={6} className="py-4 bg-gray-25 border-t-2 border-gray-200">
                                        <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                                          <span>•</span>
                                          <span>Total de {aluno.parcelas.length} parcela{aluno.parcelas.length !== 1 ? 's' : ''}</span>
                                          <span>•</span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
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
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-red-500" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {searchTerm 
                    ? `Não encontramos alunos que correspondam à busca "${searchTerm}". Tente ajustar os termos da pesquisa.`
                    : 'Ainda não há alunos com registros financeiros cadastrados no sistema.'
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
              
              {/* Linhas decorativas de espaçamento */}
              <div className="w-full max-w-md space-y-3 pt-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGroupingView;