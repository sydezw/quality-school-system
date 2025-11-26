import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Eye,
  EyeOff,
  RotateCcw,
  FilterX
} from 'lucide-react';
import { useParcelas, ParcelaComDetalhes } from '@/hooks/useParcelas';
import { criarDataDeString } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import FinancialPlanForm from './FinancialPlanForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Calendar, CreditCard, Trash2, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialPlanDialog from './FinancialPlanDialog';
import { Student } from '@/types/shared';
import { formatarFormaPagamento, formatDate } from '@/utils/formatters';
import { calcularNumeroPorTipo, type ParcelaBasica } from '@/utils/parcelaCalculations';
import { useMultipleSelection } from '@/hooks/useMultipleSelection';
import { MultipleSelectionBar } from '@/components/shared/MultipleSelectionBar';
import { SelectionCheckbox } from '@/components/shared/SelectionCheckbox';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';

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

interface ParcelasTableProps {
  onRefresh?: () => Promise<void>;
}

const ParcelasTable: React.FC<ParcelasTableProps> = ({ onRefresh }) => {
  // Estado para controlar se é a primeira vez que o componente é montado
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Estados dos filtros - com filtro automático inicial
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>(['pendente', 'vencido']); // Filtro inicial: apenas pendentes e vencidas
  const [tipoFilters, setTipoFilters] = useState<string[]>(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
  const [dataInicio, setDataInicio] = useState(''); // Sem data início para mostrar desde o início
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]); // Data atual como fim para mostrar até hoje
  const [idiomaFilter, setIdiomaFilter] = useState<'todos' | 'Inglês' | 'Japonês'>('todos');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para o modal de criação de plano
  const [isFinancialPlanDialogOpen, setIsFinancialPlanDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<Student | null>(null);
  
  // Estado para controlar se os filtros avançados estão expandidos
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Estado para o modal de confirmação de exclusão
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para aplicar filtro automático inicial (apenas na primeira vez)
  useEffect(() => {
    if (isInitialLoad) {
      toast.success("🎯 Filtro automático aplicado - Mostrando apenas parcelas pendentes e vencidas até hoje.");
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

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
    excluirMultiplasParcelas,
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
        toast.error("Nenhum aluno encontrado - Não há alunos ativos para criar plano de pagamento.");
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
        toast.error("Todos os alunos já possuem planos - Todos os alunos ativos já possuem planos de pagamento criados.");
        return;
      }

      // Abrir o modal de criação de plano
      setSelectedStudentForPlan(null);
      setIsFinancialPlanDialogOpen(true);
      
      toast.success(`Modal de criação aberto - ${studentsWithoutPlans.length} aluno(s) disponível(is) para criar plano.`);
    } catch (error) {
      console.error('Erro ao verificar alunos:', error);
      toast.error("Erro ao verificar alunos disponíveis.");
    }
  };

  const handlePlanSuccess = () => {
    fetchParcelas(); // Atualizar a lista de parcelas
    setIsFinancialPlanDialogOpen(false);
    setSelectedStudentForPlan(null);
  };

  // Função para lidar com exclusão (individual ou múltipla)
  const handleDelete = async (parcela: ParcelaComDetalhes) => {
    if (isSelectionMode) {
      // Se estamos no modo de seleção, adicionar/remover da seleção
      toggleSelection(parcela);
    } else {
      // Se não estamos no modo de seleção, entrar no modo e selecionar esta parcela
      enterSelectionMode();
      toggleSelection(parcela);
    }
  };

  // Função para confirmar exclusão múltipla
  const handleConfirmMultipleDelete = () => {
    const selectedParcelas = getSelectedItems();
    if (selectedParcelas.length === 0) return;
    
    setIsConfirmDeleteModalOpen(true);
  };

  // Função para executar a exclusão após confirmação
  const executeDelete = async () => {
    const selectedParcelas = getSelectedItems();
    if (selectedParcelas.length === 0) return;

    try {
      setIsDeleting(true);
      
      if (selectedParcelas.length === 1) {
        await excluirParcela(selectedParcelas[0].id);
      } else {
        await excluirMultiplasParcelas(selectedParcelas.map(p => p.id));
      }
      
      exitSelectionMode();
      setIsConfirmDeleteModalOpen(false);
      
      toast.success(`Exclusão realizada - ${selectedParcelas.length} parcela(s) excluída(s) com sucesso.`);
    } catch (error) {
      console.error('Erro ao excluir parcelas:', error);
      toast.error("Erro na exclusão - Ocorreu um erro ao excluir as parcelas.");
    } finally {
      setIsDeleting(false);
    }
  };



  // Filtragem local atualizada para múltipla seleção + filtro de data automático
  const parcelasFiltradas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
    
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
      
      // Filtro por data de vencimento
      const dataVencimento = criarDataDeString(parcela.data_vencimento);
      
      const filtroDataInicio = !dataInicio || dataVencimento >= criarDataDeString(dataInicio);
      const filtroDataFim = !dataFim || dataVencimento <= criarDataDeString(dataFim);
      
      // Filtro automático: apenas parcelas até hoje (quando filtro inicial está ativo)
      const isFilteringCurrentDate = !dataInicio && 
                                     dataFim === new Date().toISOString().split('T')[0] &&
                                     statusFilters.length === 2 && 
                                     statusFilters.includes('pendente') && 
                                     statusFilters.includes('vencido');
      
      const filtroDataAutomatico = !isFilteringCurrentDate || dataVencimento <= hoje;
      
      return filtroNome && filtroStatus && filtroTipo && filtroIdioma && 
             filtroDataInicio && filtroDataFim && filtroDataAutomatico;
    });
  }, [todasParcelas, searchTerm, statusFilters, tipoFilters, idiomaFilter, 
      dataInicio, dataFim, calcularStatusAutomatico]);

  // Função para resetar filtros para o padrão inicial
  const resetarFiltrosParaPadrao = () => {
    setSearchTerm('');
    setStatusFilters(['pendente', 'vencido']);
    setTipoFilters(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
    setDataInicio(''); // Sem data início para mostrar desde o início
    setDataFim(new Date().toISOString().split('T')[0]); // Data atual como fim
    setIdiomaFilter('todos');
    setCurrentPage(1);
    
    toast.success("🔄 Filtros resetados - Filtros voltaram ao padrão inicial (pendentes/vencidas até hoje).");
  };

  // Função para limpar todos os filtros
  const limparTodosFiltros = () => {
    setSearchTerm('');
    setStatusFilters(['pago', 'pendente', 'vencido', 'cancelado']);
    setTipoFilters(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
    setDataInicio('');
    setDataFim('');
    setIdiomaFilter('todos');
    setCurrentPage(1);
    
    toast.success("🧹 Todos os filtros removidos - Mostrando todas as parcelas sem filtros.");
  };

  // Verificar se filtros estão no estado inicial
  const isFilteringInitialState = () => {
    return statusFilters.length === 2 && 
           statusFilters.includes('pendente') && 
           statusFilters.includes('vencido') &&
           !dataInicio && // Sem data início
           dataFim === new Date().toISOString().split('T')[0] && // Data fim é hoje
           idiomaFilter === 'todos' &&
           !searchTerm &&
           tipoFilters.length === 5;
  };

  // Verificar se há filtros aplicados
  const hasFiltersApplied = () => {
    return searchTerm || 
           statusFilters.length < 4 || 
           tipoFilters.length < 5 || 
           dataInicio || 
           dataFim || 
           idiomaFilter !== 'todos';
  };

  // Cálculos de paginação
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(parcelasFiltradas.length / itemsPerPage);
  const startItem = itemsPerPage === 0 ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = itemsPerPage === 0 ? parcelasFiltradas.length : Math.min(currentPage * itemsPerPage, parcelasFiltradas.length);
  const parcelas = itemsPerPage === 0 ? parcelasFiltradas : parcelasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hook para seleção múltipla
  const {
    selectedItems,
    isSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    getSelectedItems
  } = useMultipleSelection<ParcelaComDetalhes>({
    items: parcelas,
    getItemId: (parcela) => parcela.id
  });

  // DEBUG: Logs para diagnosticar
  console.log('=== DEBUG PAGINAÇÃO PARCELAS ===');
  console.log('Total parcelas filtradas:', parcelasFiltradas.length);
  console.log('Itens por página:', itemsPerPage === 0 ? 'Todos' : itemsPerPage);
  console.log('Página atual:', currentPage);
  console.log('Total de páginas:', totalPages);
  console.log('Parcelas exibidas:', parcelas.length);
  console.log('Filtro inicial ativo:', isInitialLoad);
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
  }, [searchTerm, statusFilters, tipoFilters, idiomaFilter, dataInicio, dataFim, itemsPerPage]);

  // Carregar parcelas apenas na inicialização
  useEffect(() => {
    fetchParcelas();
  }, [fetchParcelas]);

  const handleIdiomaChange = (value: string) => {
    setIdiomaFilter(value as 'todos' | 'Inglês' | 'Japonês');
  };

  const handleDataInicioChange = (value: string) => {
    setDataInicio(value);
    // Auto-preencher data fim se estiver vazia
    if (value && !dataFim) {
      setDataFim(value);
    }
  };

  const handleDataFimChange = (value: string) => {
    setDataFim(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4" style={{color: '#D90429'}} />;
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
        return 'transition-colors' + ' ' + 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
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
        return <XCircle className="h-4 w-4" style={{color: '#D90429'}} />;
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
            className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent mx-auto" style={{borderColor: '#D90429', borderTopColor: 'transparent'}}
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
          <Card className="shadow-lg border-0 bg-[#F9FAFB]">
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
                    <Label htmlFor="search" className="text-sm font-medium" style={{color: '#6B7280'}}>Buscar</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nome do aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10" style={{borderColor: '#D1D5DB'}} onFocus={(e) => {e.target.style.borderColor = '#D90429'; e.target.style.boxShadow = '0 0 0 1px #D90429'}} onBlur={(e) => {e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'}}
                      />
                    </div>
                  </div>
                  
                  {/* Filtros de Status com Multi-Select */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{color: '#6B7280'}}>Status</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between" style={{borderColor: '#D1D5DB'}} onFocus={(e) => {e.target.style.borderColor = '#D90429'; e.target.style.boxShadow = '0 0 0 1px #D90429'}} onBlur={(e) => {e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'}}
                        >
                          <span className="text-sm">
                            {statusFilters.length === 4 
                              ? 'Todos os status' 
                              : statusFilters.length === 0 
                              ? 'Selecione os status...' 
                              : statusFilters.length === 2 && statusFilters.includes('pendente') && statusFilters.includes('vencido')
                              ? 'Pendentes e Vencidas (Padrão)'
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
                    <Label className="text-sm font-medium mb-2 block" style={{color: '#6B7280'}}>Tipo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between" style={{borderColor: '#D1D5DB'}} onFocus={(e) => {e.target.style.borderColor = '#D90429'; e.target.style.boxShadow = '0 0 0 1px #D90429'}} onBlur={(e) => {e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'}}
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
                    <Label className="text-sm font-medium" style={{color: '#6B7280'}}>Idioma</Label>
                    <Select value={idiomaFilter} onValueChange={handleIdiomaChange}>
                      <SelectTrigger className="mt-1" style={{borderColor: '#D1D5DB'}} onFocus={(e) => {e.target.style.borderColor = '#D90429'; e.target.style.boxShadow = '0 0 0 1px #D90429'}} onBlur={(e) => {e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'}}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Inglês">Inglês</SelectItem>
                        <SelectItem value="Japonês">Japonês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filtro de Data Início */}
                  <div>
                    <Label htmlFor="dataInicio" className="text-sm font-medium" style={{color: '#6B7280'}}>Data Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => handleDataInicioChange(e.target.value)}
                      className="mt-1" style={{borderColor: '#D1D5DB'}} onFocus={(e) => {e.target.style.borderColor = '#D90429'; e.target.style.boxShadow = '0 0 0 1px #D90429'}} onBlur={(e) => {e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'}}
                    />
                  </div>
                  
                  {/* Filtro de Data Fim */}
                  <div>
                    <Label htmlFor="dataFim" className="text-sm font-medium" style={{color: '#6B7280'}}>Data Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => handleDataFimChange(e.target.value)}
                      className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                {/* Indicador de Filtro Automático e Botões de Reset */}
                <div className="mt-4 flex items-center justify-between">
                  {/* Indicador de filtro automático */}
                  {isFilteringInitialState() && (
                    <motion.div 
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">
                        Filtro automático ativo: Pendentes/Vencidas da data atual
                      </span>
                    </motion.div>
                  )}
                  
                  {/* Botões de Reset */}
                  {hasFiltersApplied() && (
                    <motion.div 
                      className="flex gap-2 ml-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {!isFilteringInitialState() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetarFiltrosParaPadrao}
                          className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <FilterX className="h-4 w-4" />
                          Filtro Padrão
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={limparTodosFiltros}
                        className="flex items-center gap-2 hover:bg-red-50" style={{color: '#D90429', borderColor: '#FECACA'}}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Limpar Todos
                      </Button>
                    </motion.div>
                  )}
                </div>
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
            <CardHeader className="text-white rounded-t-lg bg-[#D90429]">
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
                      className="w-full text-gray-800 border-0 px-6 py-2 shadow-lg transition-all duration-300 bg-white hover:bg-gray-100"
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
                    {searchTerm || statusFilters.length < 4 || tipoFilters.length < 5 || dataInicio || dataFim
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Nenhuma parcela foi criada ainda.'}
                  </p>
                </motion.div>
              ) : (
                <div className="overflow-x-auto max-w-full">
                  <Table className="w-full min-w-[1200px]">
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        {isSelectionMode && (
                          <TableHead className="font-bold w-12" style={{color: '#6B7280'}}>
                            <SelectionCheckbox
                              isSelected={selectedItems.size === parcelas.length && parcelas.length > 0}
                              onChange={() => {
                                if (selectedItems.size === parcelas.length) {
                                  clearSelection();
                                } else {
                                  selectAll();
                                }
                              }}
                            />
                          </TableHead>
                        )}
                        <TableHead className="font-bold w-20" style={{color: '#6B7280'}}>ID</TableHead>
              <TableHead className="font-bold min-w-[180px]" style={{color: '#6B7280'}}>Aluno</TableHead>
              <TableHead className="font-bold min-w-[150px]" style={{color: '#6B7280'}}>Plano</TableHead>
              <TableHead className="font-bold w-32" style={{color: '#6B7280'}}>Tipo</TableHead>
              <TableHead className="font-bold w-24" style={{color: '#6B7280'}}>Idioma</TableHead>
              <TableHead className="font-bold w-20" style={{color: '#6B7280'}}>Parcela</TableHead>
              <TableHead className="font-bold w-32" style={{color: '#6B7280'}}>Valor</TableHead>
              <TableHead className="font-bold w-32" style={{color: '#6B7280'}}>Vencimento</TableHead>
              <TableHead className="font-bold w-32" style={{color: '#6B7280'}}>Forma Pagamento</TableHead>
              <TableHead className="font-bold min-w-[150px]" style={{color: '#6B7280'}}>Descrição do Item</TableHead>
              <TableHead className="font-bold w-32" style={{color: '#6B7280'}}>Status</TableHead>
              <TableHead className="font-bold min-w-[200px]" style={{color: '#6B7280'}}>Observações</TableHead>
              <TableHead className="font-bold text-center w-32" style={{color: '#6B7280'}}>Ações</TableHead>
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
                              } ${selectedItems.has(parcela.id) ? 'bg-blue-50' : ''}`}
                            >
                              {isSelectionMode && (
                                <TableCell>
                                  <SelectionCheckbox
                                    isSelected={selectedItems.has(parcela.id)}
                                    onChange={() => toggleSelection(parcela)}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="font-mono text-base text-gray-600">
                                #{parcela.id}
                              </TableCell>
                              <TableCell className="font-medium text-base text-gray-900">
                                {parcela.aluno_nome || 'N/A'}
                              </TableCell>
                              <TableCell className="text-base" style={{color: '#6B7280'}}>
                                {parcela.plano_nome || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTipoIcon(parcela.tipo_item)}
                                  <span className="capitalize font-medium text-base">{parcela.tipo_item}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="inline-block px-3 py-1 rounded-md text-base font-medium border" style={{backgroundColor: '#F3F4F6', color: '#6B7280', borderColor: '#E5E7EB'}}>
                                  {parcela.idioma_registro}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium text-base">
                                {calcularNumeroPorTipo(parcela, todasParcelas)}ª
                              </TableCell>
                              <TableCell className="font-bold text-base text-green-700">
                                R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <div className="text-base">
                                  {formatDate(parcela.data_vencimento)}
                                </div>
                              </TableCell>
                              <TableCell className="text-base" style={{color: '#6B7280'}}>
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
                                        onClick={async () => {
                                          await marcarComoPago(parcela.id);
                                          // Atualizar dados financeiros no componente pai
                                          if (onRefresh) {
                                            await onRefresh();
                                          }
                                        }}
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
                                      onClick={() => handleDelete(parcela)}
                                      className="hover:bg-red-50" style={{borderColor: '#FECACA', color: '#D90429'}} onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = '#FCA5A5'} onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = '#FECACA'}
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

        {/* Barra de Seleção Múltipla */}
        {isSelectionMode && (
          <MultipleSelectionBar
            isVisible={isSelectionMode}
            selectedCount={selectedItems.size}
            totalItems={parcelas.length}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onDelete={handleConfirmMultipleDelete}
            onCancel={exitSelectionMode}
            itemName="parcelas"
            deleteButtonText="Excluir Selecionadas"
            isAllSelected={selectedItems.size === parcelas.length && parcelas.length > 0}
          />
        )}

        {/* Contador de Registros */}
        {parcelasFiltradas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-4"
          >
            <div className="rounded-full px-6 py-3 shadow-lg bg-[#D90429]">
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
            <Card className="shadow-md border-0 bg-[#F9FAFB]">
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
                            ? 'cursor-not-allowed' + ' ' + 'bg-gray-100 text-gray-400'
                : 'bg-white border shadow-sm' + ' ' + 'text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200'
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
                                  ? 'text-white shadow-lg bg-[#D90429]'
                : 'bg-white border border-gray-200' + ' ' + 'text-gray-700 hover:bg-red-50 hover:text-red-600'
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
                            ? 'cursor-not-allowed' + ' ' + 'bg-gray-100 text-gray-400'
                : 'bg-white border shadow-sm' + ' ' + 'text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200'
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
              <Card className="shadow-sm border-0 overflow-hidden bg-[#D90429]">
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
              <Card className="shadow-sm border-0 bg-[#D90429] overflow-hidden">
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
      <Dialog open={isFinancialPlanDialogOpen} onOpenChange={setIsFinancialPlanDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Plano de Pagamento</DialogTitle>
          </DialogHeader>
          <FinancialPlanForm
            preSelectedStudent={selectedStudentForPlan}
            onSuccess={handlePlanSuccess}
            onCancel={() => setIsFinancialPlanDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={executeDelete}
        itemCount={getSelectedItems().length}
        itemName="parcela"
        isLoading={isDeleting}
      />
    </>
  );
};

export default ParcelasTable;
