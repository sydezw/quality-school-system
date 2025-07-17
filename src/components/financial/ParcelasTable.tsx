import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useParcelas } from '@/hooks/useParcelas';
import { Search, Filter, Calendar, CreditCard, CheckCircle, XCircle, Clock, AlertTriangle, Trash2, Plus, Users, RefreshCw, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FinancialPlanDialog from './FinancialPlanDialog';
import { Student } from '@/types/shared';
import { formatarFormaPagamento } from '@/utils/formatters';

interface Parcela {
  id: number;
  registro_financeiro_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string | null;
  idioma_registro: 'Inglês' | 'Japonês';
  comprovante: string | null;
  observacoes?: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  forma_pagamento?: string;
  // Dados relacionados via join
  aluno_nome?: string;
  plano_nome?: string;
}

const ParcelasTable: React.FC = () => {
  // Estados dos filtros - alterados para arrays
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>(['pago', 'pendente', 'vencido', 'cancelado']);
  const [tipoFilters, setTipoFilters] = useState<string[]>(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
  const [anoInicio, setAnoInicio] = useState('todos');
  const [anoFim, setAnoFim] = useState('todos');
  const [idiomaFilter, setIdiomaFilter] = useState<'todos' | 'Inglês' | 'Japonês'>('todos');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para o modal de criação de plano
  const [isFinancialPlanDialogOpen, setIsFinancialPlanDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<Student | null>(null);
  
  // Estado para controlar se os filtros avançados estão expandidos
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const { toast } = useToast();

  // Funções para gerenciar filtros múltiplos
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilters(prev => [...prev, status]);
    } else {
      setStatusFilters(prev => prev.filter(s => s !== status));
    }
  };

  const handleTipoFilterChange = (tipo: string, checked: boolean) => {
    if (checked) {
      setTipoFilters(prev => [...prev, tipo]);
    } else {
      setTipoFilters(prev => prev.filter(t => t !== tipo));
    }
  };

  const {
    parcelas: todasParcelas,
    loading,
    fetchParcelas,
    marcarComoPago,
    excluirParcela,
    calcularStatusAutomatico
  } = useParcelas();

  // Função para criar plano de pagamento
  const handleCreatePlan = async () => {
    try {
      // Buscar todos os alunos ativos
      const { data: students, error: studentsError } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        toast({
          title: "Nenhum aluno encontrado",
          description: "Não há alunos ativos para criar plano de pagamento.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se existem alunos sem plano financeiro
      const { data: existingPlans, error: plansError } = await supabase
        .from('financeiro_alunos')
        .select('aluno_id');

      if (plansError) throw plansError;

      const studentsWithPlans = new Set(existingPlans?.map(p => p.aluno_id) || []);
      const studentsWithoutPlans = students.filter(student => !studentsWithPlans.has(student.id));

      if (studentsWithoutPlans.length === 0) {
        toast({
          title: "Todos os alunos já possuem planos",
          description: "Todos os alunos ativos já possuem planos de pagamento criados.",
          variant: "destructive",
        });
        return;
      }

      // Abrir o modal de criação de plano
      setSelectedStudentForPlan(null);
      setIsFinancialPlanDialogOpen(true);
      
      toast({
        title: "Modal de criação aberto",
        description: `${studentsWithoutPlans.length} aluno(s) disponível(is) para criar plano.`,
      });
    } catch (error) {
      console.error('Erro ao verificar alunos:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar alunos disponíveis.",
        variant: "destructive",
      });
    }
  };

  const handlePlanSuccess = () => {
    fetchParcelas(); // Atualizar a lista de parcelas
    setIsFinancialPlanDialogOpen(false);
    setSelectedStudentForPlan(null);
  };

  // Filtragem local atualizada para múltipla seleção
  const parcelasFiltradas = useMemo(() => {
    return todasParcelas.filter((parcela) => {
      // Filtro por nome do aluno
      const filtroNome = !searchTerm || 
        parcela.aluno_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por status (múltipla seleção)
      const status = calcularStatusAutomatico(parcela);
      const filtroStatus = statusFilters.includes(status);
      
      // Filtro por tipo (múltipla seleção)
      const filtroTipo = tipoFilters.includes(parcela.tipo_item);
      
      // Filtro por idioma
      const filtroIdioma = idiomaFilter === 'todos' || parcela.idioma_registro === idiomaFilter;
      
      // Filtro por ano de vencimento
      const anoVencimento = new Date(parcela.data_vencimento).getFullYear();
      const filtroAnoInicio = anoInicio === 'todos' || anoVencimento >= parseInt(anoInicio);
      const filtroAnoFim = anoFim === 'todos' || anoVencimento <= parseInt(anoFim);
      
      return filtroNome && filtroStatus && filtroTipo && filtroIdioma && 
             filtroAnoInicio && filtroAnoFim;
    });
  }, [todasParcelas, searchTerm, statusFilters, tipoFilters, idiomaFilter, 
      anoInicio, anoFim, calcularStatusAutomatico]);

  // Cálculos de paginação
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(parcelasFiltradas.length / itemsPerPage);
  const startItem = itemsPerPage === 0 ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = itemsPerPage === 0 ? parcelasFiltradas.length : Math.min(currentPage * itemsPerPage, parcelasFiltradas.length);
  const parcelas = itemsPerPage === 0 ? parcelasFiltradas : parcelasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // DEBUG: Logs para diagnosticar
  console.log('=== DEBUG PAGINAÇÃO PARCELAS ===');
  console.log('Total parcelas filtradas:', parcelasFiltradas.length);
  console.log('Itens por página:', itemsPerPage === 0 ? 'Todos' : itemsPerPage);
  console.log('Página atual:', currentPage);
  console.log('Total de páginas:', totalPages);
  console.log('Parcelas exibidas:', parcelas.length);
  console.log('Condição paginação (totalPages > 1):', totalPages > 1);
  console.log('=== FIM DEBUG ===');

  // Páginas visíveis para paginação
  const getVisiblePages = () => {
    if (totalPages <= 1 || itemsPerPage === 0) return [];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (start > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    range.forEach(page => {
      if (page !== 1 && page !== totalPages) {
        rangeWithDots.push(page);
      }
    });

    if (end < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return [...new Set(rangeWithDots)].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (typeof a === 'number') return -1;
      if (typeof b === 'number') return 1;
      return 0;
    });
  };

  const visiblePages = getVisiblePages();

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilters, tipoFilters, idiomaFilter, anoInicio, anoFim, itemsPerPage]);

  // Carregar parcelas apenas na inicialização
  useEffect(() => {
    fetchParcelas();
  }, [fetchParcelas]);

  const handleIdiomaChange = (value: string) => {
    setIdiomaFilter(value as 'todos' | 'Inglês' | 'Japonês');
  };

  const handleAnoInicioChange = (value: string) => {
    setAnoInicio(value);
    // Auto-preencher ano fim se estiver vazio
    if (value !== 'todos' && anoFim === 'todos') {
      setAnoFim(value);
    }
  };

  const handleAnoFimChange = (value: string) => {
    setAnoFim(value);
  };

  // Gerar lista de anos disponíveis (últimos 10 anos + próximos 5 anos)
  const getAnosDisponiveis = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let ano = anoAtual - 10; ano <= anoAtual + 5; ano++) {
      anos.push(ano.toString());
    }
    return anos.reverse(); // Mais recentes primeiro
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-colors';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'plano':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'material':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'matrícula':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelamento':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'outros':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600 font-medium">Carregando parcelas...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Filtros Avançados */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-gray-100">
            <CardHeader className="pb-4">
              <CardTitle 
                className="flex items-center justify-between text-red-700 cursor-pointer"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                <div className="flex items-center gap-3">
                  <Filter className="h-6 w-6" />
                  Filtros Avançados
                </div>
                <motion.div
                  animate={{ rotate: isFiltersExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            <motion.div
              initial={false}
              animate={{
                height: isFiltersExpanded ? "auto" : 0,
                opacity: isFiltersExpanded ? 1 : 0
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
              style={{ overflow: "hidden" }}
            >
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Busca */}
                  <div className="lg:col-span-2">
                    <Label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nome do aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  {/* Filtros de Status com Multi-Select */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-gray-300 focus:border-red-500 focus:ring-red-500"
                        >
                          <span className="text-sm">
                            {statusFilters.length === 4 
                              ? 'Todos os status' 
                              : statusFilters.length === 0 
                              ? 'Selecione os status...' 
                              : `${statusFilters.length} status selecionado${statusFilters.length > 1 ? 's' : ''}`
                            }
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <div className="p-2 space-y-1">
                          {[
                            { value: 'pago', label: 'Pagas', icon: CheckCircle },
                            { value: 'pendente', label: 'Pendentes', icon: Clock },
                            { value: 'vencido', label: 'Vencidas', icon: AlertTriangle },
                            { value: 'cancelado', label: 'Canceladas', icon: XCircle }
                          ].map((status) => {
                            const isChecked = statusFilters.includes(status.value);
                            const IconComponent = status.icon;
                            return (
                              <div 
                                key={status.value}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleStatusFilterChange(status.value, checked as boolean)}
                                />
                                <IconComponent className="h-4 w-4 text-gray-600" />
                                <span className="text-sm">{status.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Filtros de Tipo com Multi-Select */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-gray-300 focus:border-red-500 focus:ring-red-500"
                        >
                          <span className="text-sm">
                            {tipoFilters.length === 5 
                              ? 'Todos os tipos' 
                              : tipoFilters.length === 0 
                              ? 'Selecione os tipos...' 
                              : `${tipoFilters.length} tipo${tipoFilters.length > 1 ? 's' : ''} selecionado${tipoFilters.length > 1 ? 's' : ''}`
                            }
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <div className="p-2 space-y-1">
                          {[
                            { value: 'plano', label: 'Planos', icon: CreditCard },
                            { value: 'material', label: 'Materiais', icon: Calendar },
                            { value: 'matrícula', label: 'Matrículas', icon: CheckCircle },
                            { value: 'cancelamento', label: 'Cancelamentos', icon: XCircle },
                            { value: 'outros', label: 'Outros', icon: FileText }
                          ].map((tipo) => {
                            const isChecked = tipoFilters.includes(tipo.value);
                            const IconComponent = tipo.icon;
                            return (
                              <div 
                                key={tipo.value}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleTipoFilterChange(tipo.value, checked as boolean)}
                                />
                                <IconComponent className="h-4 w-4 text-gray-600" />
                                <span className="text-sm">{tipo.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Filtro de Idioma */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Idioma</Label>
                    <Select value={idiomaFilter} onValueChange={handleIdiomaChange}>
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Inglês">Inglês</SelectItem>
                        <SelectItem value="Japonês">Japonês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Ano Início */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ano Início</Label>
                    <Select value={anoInicio} onValueChange={handleAnoInicioChange}>
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os anos</SelectItem>
                        {getAnosDisponiveis().map((ano) => (
                          <SelectItem key={ano} value={ano}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Ano Fim */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ano Fim</Label>
                    <Select value={anoFim} onValueChange={handleAnoFimChange}>
                      <SelectTrigger className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os anos</SelectItem>
                        {getAnosDisponiveis().map((ano) => (
                          <SelectItem key={ano} value={ano}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Botão Limpar Filtros */}
                {(searchTerm || statusFilters.length < 4 || tipoFilters.length < 5 || anoInicio !== 'todos' || anoFim !== 'todos' || idiomaFilter !== 'todos') && (
                  <motion.div 
                    className="mt-4 flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilters(['pago', 'pendente', 'vencido', 'cancelado']);
                        setTipoFilters(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
                        setAnoInicio('todos');
                        setAnoFim('todos');
                        setIdiomaFilter('todos');
                      }}
                      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Limpar Filtros
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>

        {/* Tabela de Parcelas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-gray-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  <span>Parcelas ({parcelas.length})</span>
                </div>
                
                {/* Estatísticas distribuídas por todo o header */}
                <div className="flex-1 flex items-center justify-center px-8">
                  <div className="flex justify-between w-full max-w-4xl gap-4">
                    {[
                      { 
                        label: 'Total', 
                        value: parcelas.length, 
                        icon: CreditCard 
                      },
                      { 
                        label: 'Pagas', 
                        value: parcelas.filter(p => calcularStatusAutomatico(p) === 'pago').length,
                        icon: CheckCircle
                      },
                      { 
                        label: 'Vencidas', 
                        value: parcelas.filter(p => calcularStatusAutomatico(p) === 'vencido').length,
                        icon: AlertTriangle
                      },
                      { 
                        label: 'Pendentes', 
                        value: parcelas.filter(p => calcularStatusAutomatico(p) === 'pendente').length,
                        icon: Clock
                      },
                      { 
                        label: 'Canceladas',
                        value: parcelas.filter(p => calcularStatusAutomatico(p) === 'cancelado').length,
                        icon: XCircle
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30 flex-1 min-w-[100px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <stat.icon className="h-5 w-5 text-white" />
                          <div className="text-center">
                            <p className="text-xs font-medium text-white/90 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-lg font-bold text-white">{stat.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                  
                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 max-w-xs"
                  >
                    <Button
                      onClick={handleCreatePlan}
                      className="w-full bg-gradient-to-r from-red-600 via-gray-700 to-black hover:from-red-700 hover:via-gray-800 hover:to-gray-900 text-white border-0 px-6 py-2 shadow-lg transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <Users className="h-4 w-4 mr-2" />
                      Criar Plano de Pagamento
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => fetchParcelas()}
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 p-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {parcelas.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-gray-400 mb-4">
                    <CreditCard className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Nenhuma parcela encontrada</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchTerm || statusFilters.length < 4 || tipoFilters.length < 5 || anoInicio || anoFim
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Nenhuma parcela foi criada ainda.'}
                  </p>
                </motion.div>
              ) : (
                <div className="overflow-x-auto max-w-full">
                  <Table className="w-full min-w-[1200px]">
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-bold text-gray-700 w-20">ID</TableHead>
                        <TableHead className="font-bold text-gray-700 min-w-[180px]">Aluno</TableHead>
                        <TableHead className="font-bold text-gray-700 min-w-[150px]">Plano</TableHead>
                        <TableHead className="font-bold text-gray-700 w-32">Tipo</TableHead>
                        <TableHead className="font-bold text-gray-700 w-24">Idioma</TableHead>
                        <TableHead className="font-bold text-gray-700 w-20">Parcela</TableHead>
                        <TableHead className="font-bold text-gray-700 w-32">Valor</TableHead>
                        <TableHead className="font-bold text-gray-700 w-32">Vencimento</TableHead>
                        <TableHead className="font-bold text-gray-700 w-32">Forma Pagamento</TableHead>
                        <TableHead className="font-bold text-gray-700 min-w-[150px]">Descrição do Item</TableHead>
                        <TableHead className="font-bold text-gray-700 w-32">Status</TableHead>
                        <TableHead className="font-bold text-gray-700 min-w-[200px]">Observações</TableHead>
                        <TableHead className="font-bold text-gray-700 text-center w-32">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {parcelas.map((parcela, index) => {
                          const status = calcularStatusAutomatico(parcela);
                          return (
                            <TableRow
                              key={parcela.id}
                              className={`border-b hover:bg-gray-50/50 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              }`}
                            >
                              <TableCell className="font-mono text-base text-gray-600">
                                #{parcela.id}
                              </TableCell>
                              <TableCell className="font-medium text-base text-gray-900">
                                {parcela.aluno_nome || 'N/A'}
                              </TableCell>
                              <TableCell className="text-base text-gray-700">
                                {parcela.plano_nome || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTipoIcon(parcela.tipo_item)}
                                  <span className="capitalize font-medium text-base">{parcela.tipo_item}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="inline-block px-3 py-1 rounded-md text-base font-medium bg-gray-100/80 text-gray-700 border border-gray-200/50">
                                  {parcela.idioma_registro}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium text-base">
                                {parcela.numero_parcela}ª
                              </TableCell>
                              <TableCell className="font-bold text-base text-green-700">
                                R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <div className="text-base">
                                  {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                                </div>
                              </TableCell>
                              <TableCell className="text-base text-gray-700">
                                {formatarFormaPagamento(parcela.forma_pagamento) || '-'}
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="text-sm text-gray-600">
                                  {parcela.descricao_item ? (
                                    <div className="truncate" title={parcela.descricao_item}>
                                      {parcela.descricao_item}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 italic">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge className={`${getStatusBadgeColor(status)} flex items-center gap-1 w-fit`}>
                                    {getStatusIcon(status)}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Badge>
                                </motion.div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="text-sm text-gray-600">
                                  {parcela.observacoes ? (
                                    <div className="truncate" title={parcela.observacoes}>
                                      {parcela.observacoes}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 italic">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-center">
                                  {/* Manter apenas o botão de Marcar como Pago */}
                                  {status !== 'pago' && status !== 'cancelado' && (
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Button
                                        size="sm"
                                        onClick={() => marcarComoPago(parcela.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  )}
                                  
                                  {/* Manter o botão de Excluir */}
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (window.confirm('Tem certeza que deseja excluir esta parcela? Esta ação não pode ser desfeita.')) {
                                          excluirParcela(parcela.id);
                                        }
                                      }}
                                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contador de Registros */}
        {parcelasFiltradas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-4"
          >
            <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full px-6 py-3 shadow-lg">
              <span className="text-white font-medium text-sm flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>{parcelasFiltradas.length} registros encontrados</span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Paginação */}
        {(totalPages > 1 || parcelasFiltradas.length > 5) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            <Card className="shadow-md border-0 bg-gradient-to-r from-gray-50 to-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Informações de exibição */}
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span className="text-sm">
                      Mostrando {startItem} a {endItem} de {parcelasFiltradas.length} registros
                    </span>
                    {itemsPerPage > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Página {currentPage} de {totalPages}
                      </span>
                    )}
                    {itemsPerPage === 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Visualizando todos os registros
                      </span>
                    )}
                  </div>

                  {/* Controles de paginação - só mostrar se houver mais de 1 página e não estiver mostrando todos */}
                  {totalPages > 1 && itemsPerPage > 0 && (
                    <div className="flex items-center space-x-2">
                      {/* Botão Anterior */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Anterior</span>
                      </motion.button>

                      {/* Números das páginas */}
                      <div className="flex items-center space-x-1">
                        {visiblePages.map((page, index) => (
                          page === '...' ? (
                            <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <motion.button
                              key={page}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setCurrentPage(page as number)}
                              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-red-600 to-gray-800 text-white shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                              }`}
                            >
                              {page}
                            </motion.button>
                          )
                        ))}
                      </div>

                      {/* Botão Próximo */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <span className="text-sm font-medium">Próximo</span>
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  )}

                  {/* Seletor de itens por página - sempre mostrar */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Itens por página:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        console.log('Mudando itens por página para:', value === '0' ? 'Todos' : value);
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="0">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Estatísticas Financeiras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md w-full">
            {/* Total a Receber */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-sm border-0 bg-gradient-to-r from-red-600 to-gray-800 overflow-hidden">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-white flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/90 uppercase tracking-wide truncate">Total a Receber</p>
                      <p className="text-sm font-bold text-white truncate">
                        R$ {parcelasFiltradas.reduce((total, parcela) => total + parcela.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Recebido */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-sm border-0 bg-gradient-to-r from-red-600 to-gray-800 overflow-hidden">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-white flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/90 uppercase tracking-wide truncate">
                        Total Recebido
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-white truncate">
                          R$ {parcelasFiltradas
                            .filter(p => calcularStatusAutomatico(p) === 'pago')
                            .reduce((total, parcela) => total + parcela.valor, 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-xs font-medium text-white/80 bg-white/20 px-1 py-0.5 rounded">
                          {parcelasFiltradas.length > 0 
                            ? Math.round(
                                (parcelasFiltradas.filter(p => calcularStatusAutomatico(p) === 'pago').length /
                                  parcelasFiltradas.length) * 100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Modal de criação de plano financeiro */}
      <FinancialPlanDialog
        isOpen={isFinancialPlanDialogOpen}
        onOpenChange={setIsFinancialPlanDialogOpen}
        selectedStudent={selectedStudentForPlan}
        onSuccess={handlePlanSuccess}
      />
    </>
  );
};

export default ParcelasTable;