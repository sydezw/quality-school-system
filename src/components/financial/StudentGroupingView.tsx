import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  CreditCard, 
  FileText, 
  Package, 
  GraduationCap, 
  User,
  Archive,
  Database,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Star,
  Award,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  EyeOff,
  XCircle,
  History,
  Receipt,
  Banknote,
  Smartphone,
  Building2,
  Wallet,
  RotateCcw,
  Download,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useParcelas } from '../../hooks/useParcelas';
import { useParcelasMigrados } from '@/hooks/useParcelasMigrados';
import FinancialPlanForm from '@/components/financial/FinancialPlanForm';
import { HistoricoParcelasModal } from '@/components/financial/modals/HistoricoParcelasModal';
import { MoverParaHistoricoModal } from '@/components/financial/modals/MoverParaHistoricoModal';
import { TornarAtivoModal } from '@/components/financial/modals/TornarAtivoModal';
import { ExcluirRegistroModal } from './modals/ExcluirRegistroModal';
import FinancialPlanDialog from './FinancialPlanDialog';
import { PreviewProximaParcela } from './PreviewProximaParcela';
import { ordenarParcelasPorTipoENumero, criarNovaParcela, getProximoNumeroParcela } from '@/utils/parcelaNumbering';
import { MultipleParcelasModal } from './MultipleParcelasModal';

interface AlunoFinanceiro {
  id: string;
  nome: string;
  // Dados do financeiro_alunos
  valor_total: number;
  valor_plano: number;
  valor_material: number;
  valor_matricula: number;
  desconto_total?: number;
  status_geral: string;
  data_primeiro_vencimento: string;
  // Parcelas individuais
  parcelas: ParcelaAluno[];
  registro_financeiro_id: string;
  numero_parcelas_plano?: number;
  numero_parcelas_material?: number;
  numero_parcelas_matricula?: number;
  // Formas de pagamento
  forma_pagamento_plano?: string;
  forma_pagamento_material?: string;
  forma_pagamento_matricula?: string;
  // Propriedade para identificar se é migrado
  migrado: 'sim' | 'nao';
}

interface ParcelaAluno {
  id: number;
  registro_financeiro_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: "pago" | "pendente" | "vencido" | "cancelado";
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string | null;
  idioma_registro: 'Inglês' | 'Japonês';
  comprovante: string | null;
  observacoes?: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  forma_pagamento?: string;
}

interface NovaParcelaForm {
  registro_financeiro_id: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  idioma_registro: 'Inglês' | 'Japonês';
  descricao_item?: string;
  observacoes?: string;
  forma_pagamento?: string;
}

interface StudentGroupingViewProps {
  alunosFinanceiros?: AlunoFinanceiro[];
  onRefresh?: () => void;
}

const StudentGroupingView: React.FC<StudentGroupingViewProps> = ({ alunosFinanceiros, onRefresh }: StudentGroupingViewProps = {}) => {
  const [alunos, setAlunos] = useState<AlunoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoRegistro, setTipoRegistro] = useState<'ativos' | 'migrados'>('ativos');
  
  // Estado para controlar se os filtros avançados estão expandidos
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // New filter states
  const [statusFilters, setStatusFilters] = useState<string[]>(['pago', 'pendente', 'vencido', 'cancelado']);
  const [tipoFilters, setTipoFilters] = useState<string[]>(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
  const [idiomaFilter, setIdiomaFilter] = useState<'todos' | 'Inglês' | 'Japonês'>('todos');
  const [dataVencimentoInicio, setDataVencimentoInicio] = useState('');
  const [dataVencimentoFim, setDataVencimentoFim] = useState('');
  const [formaPagamentoFilter, setFormaPagamentoFilter] = useState<'todos' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'dinheiro' | 'transferencia'>('todos');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editandoParcela, setEditandoParcela] = useState<ParcelaAluno | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novaParcela, setNovaParcela] = useState<NovaParcelaForm | null>(null);
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
  const [isVerHistoricoModalOpen, setIsVerHistoricoModalOpen] = useState(false);
  const [alunoHistorico, setAlunoHistorico] = useState<{id: string, nome: string} | null>(null);
  const [isMoverHistoricoModalOpen, setIsMoverHistoricoModalOpen] = useState(false);
  const [alunoParaArquivar, setAlunoParaArquivar] = useState<{id: string, nome: string, parcelas: ParcelaAluno[]} | null>(null);
  const [isFinancialPlanDialogOpen, setIsFinancialPlanDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState(null);
  const [isVisualizarPlanoModalOpen, setIsVisualizarPlanoModalOpen] = useState(false);
  const [alunoPlanoDetalhes, setAlunoPlanoDetalhes] = useState<AlunoFinanceiro | null>(null);
  const [totalParcelasCarregadas, setTotalParcelasCarregadas] = useState<number>(0);
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<{id: string, nome: string} | null>(null);
  const [selectedRegistroId, setSelectedRegistroId] = useState<string | null>(null);
  const [isTornarAtivoModalOpen, setIsTornarAtivoModalOpen] = useState(false);
  const [alunoParaTornarAtivo, setAlunoParaTornarAtivo] = useState<AlunoFinanceiro | null>(null);
  const [isMultipleParcelasModalOpen, setIsMultipleParcelasModalOpen] = useState(false);
  const [selectedAlunoForMultipleParcelas, setSelectedAlunoForMultipleParcelas] = useState<AlunoFinanceiro | null>(null);
  
  // Estados para confirmação de exclusão
  const [parcelaParaExcluir, setParcelaParaExcluir] = useState<{id: number, numero: number, valor: number} | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  
  // Adicionar estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const STUDENTS_PER_PAGE = 10;
  
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Adicionar o hook useParcelas
  const { marcarComoPago } = useParcelas();
  
  // Hook para parcelas migradas
  const { 
    parcelaPreview, 
    loadingPreview, 
    marcarComoPageMigrado, 
    criarProximaParcela, 
    cancelarPreview 
  } = useParcelasMigrados();

  // Filter handler functions
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

  const handleIdiomaChange = (value: string) => {
    setIdiomaFilter(value as 'todos' | 'Inglês' | 'Japonês');
  };

  const handleFormaPagamentoChange = (value: string) => {
    setFormaPagamentoFilter(value as 'todos' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'dinheiro' | 'transferencia');
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilters(['pago', 'pendente', 'vencido', 'cancelado']);
    setTipoFilters(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
    setIdiomaFilter('todos');
    setDataVencimentoInicio('');
    setDataVencimentoFim('');
    setFormaPagamentoFilter('todos');
  };

  // Função para calcular status automático baseado na data
  const calcularStatusAutomatico = useCallback((parcela: ParcelaAluno) => {
    if (parcela.status_pagamento === 'pago' || parcela.status_pagamento === 'cancelado') {
      return parcela.status_pagamento;
    }
    
    const hoje = new Date();
    const dataVencimento = new Date(parcela.data_vencimento);
    
    if (dataVencimento < hoje) {
      return 'vencido';
    }
    
    return 'pendente';
  }, []);

  // Função para obter forma de pagamento da parcela
  const getFormaPagamentoParcela = useCallback((parcela: ParcelaAluno, aluno: AlunoFinanceiro) => {
    // Se a parcela já tem forma_pagamento definida, usar ela
    if (parcela.forma_pagamento) {
      return parcela.forma_pagamento;
    }
    
    // Caso contrário, buscar do registro financeiro baseado no tipo_item
    switch (parcela.tipo_item) {
      case 'plano':
        return aluno.forma_pagamento_plano || 'boleto';
      case 'material':
        return aluno.forma_pagamento_material || 'boleto';
      case 'matrícula':
        return aluno.forma_pagamento_matricula || 'boleto';
      default:
        return 'boleto';
    }
  }, []);

  // Enhanced function to filter students
  const filteredAlunos = useMemo(() => {
    return alunos.filter(aluno => {
      // Search term filter
      const filtroNome = !searchTerm.trim() || 
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if student has parcelas matching the filters
      const parcelasValidas = aluno.parcelas.filter(parcela => {
        // Status filter
        const status = calcularStatusAutomatico(parcela);
        const filtroStatus = statusFilters.includes(status);
        
        // Type filter
        const filtroTipo = tipoFilters.includes(parcela.tipo_item);
        
        // Language filter
        const filtroIdioma = idiomaFilter === 'todos' || parcela.idioma_registro === idiomaFilter;
        
        // Date range filter
        const dataVencimento = new Date(parcela.data_vencimento);
        const filtroDataInicio = !dataVencimentoInicio || 
          dataVencimento >= new Date(dataVencimentoInicio);
        const filtroDataFim = !dataVencimentoFim || 
          dataVencimento <= new Date(dataVencimentoFim);
        
        // Payment method filter
        const formaPagamentoParcela = getFormaPagamentoParcela(parcela, aluno);
        const filtroFormaPagamento = formaPagamentoFilter === 'todos' || 
          formaPagamentoParcela === formaPagamentoFilter;
        
        return filtroStatus && filtroTipo && filtroIdioma && 
               filtroDataInicio && filtroDataFim && filtroFormaPagamento;
      });
      
      // Include student if name matches and has at least one valid parcela
      // OR if no specific filters are applied (show all students)
      const hasActiveFilters = statusFilters.length < 4 || tipoFilters.length < 5 || 
                              idiomaFilter !== 'todos' || dataVencimentoInicio || 
                              dataVencimentoFim || formaPagamentoFilter !== 'todos';
      
      return filtroNome && (parcelasValidas.length > 0 || !hasActiveFilters);
    });
  }, [alunos, searchTerm, statusFilters, tipoFilters, idiomaFilter, 
      dataVencimentoInicio, dataVencimentoFim, formaPagamentoFilter, calcularStatusAutomatico, getFormaPagamentoParcela]);

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredAlunos.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentStudents = filteredAlunos.slice(startIndex, endIndex);

  // Resetar página quando pesquisa muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoRegistro, statusFilters, tipoFilters, idiomaFilter, 
      dataVencimentoInicio, dataVencimentoFim, formaPagamentoFilter]);

  // Lógica para números de páginas visíveis (máximo 5)
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Informações de exibição
  const startItem = filteredAlunos.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredAlunos.length);



  // Função para formatar moeda (removida - usando utilitário)
  // Função para formatar data (removida - usando utilitário)

  // Função para ícones de tipo
  const getTipoIcon = useCallback((tipo: string) => {
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
  }, []);

  // Função auxiliar para ícones de tipo (emoji)
  const getTipoIconEmoji = (tipo: string) => {
    switch (tipo) {
      case 'plano': return '📚';
      case 'material': return '📖';
      case 'matrícula': return '🎓';
      case 'cancelamento': return '❌';
      default: return '📄';
    }
  };

  // Função auxiliar para cores de tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'plano': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'material': return 'text-green-600 bg-green-50 border-green-200';
      case 'matrícula': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'cancelamento': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Função para ícones de status
  const getStatusIcon = useCallback((status: string) => {
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
  }, []);

  // Função para ícones de status geral
  const getStatusGeralIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'parcialmente pago':
        return <AlertTriangle className="h-4 w-4" />;
      case 'arquivado':
        return <Archive className="h-4 w-4" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  // Função para obter cor do status
  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors';
      case 'parcialmente pago':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors';
      case 'arquivado':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-colors';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
    }
  }, [])

  // Função para calcular progresso total
  const calcularProgressoTotal = useCallback((aluno: AlunoFinanceiro) => {
    // Buscar dados do registro financeiro para obter número total de parcelas
    const totalParcelas = {
      plano: aluno.numero_parcelas_plano || 0,
      material: aluno.numero_parcelas_material || 0,
      matricula: aluno.numero_parcelas_matricula || 0
    };
    
    const totalGeralParcelas = totalParcelas.plano + totalParcelas.material + totalParcelas.matricula;
    const parcelasPagas = aluno.parcelas.filter(p => p.status_pagamento === 'pago').length;
    const percentual = totalGeralParcelas > 0 ? (parcelasPagas / totalGeralParcelas) * 100 : 0;
    
    return {
      pagas: parcelasPagas,
      total: totalGeralParcelas,
      percentual: Math.round(percentual)
    };
  }, []);

  // Função para calcular total pago (apenas para migrados)
  const calcularTotalPago = useCallback((aluno: AlunoFinanceiro) => {
    const parcelasPagas = aluno.parcelas.filter(p => p.status_pagamento === 'pago');
    return parcelasPagas.reduce((total, parcela) => total + parcela.valor, 0);
  }, []);

  // Função para salvar posição do scroll
  const saveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      setSavedScrollPosition(containerRef.current.scrollTop);
    }
  }, []);

  // Função para restaurar posição do scroll
  const restoreScrollPosition = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = savedScrollPosition;
    }
  }, [savedScrollPosition]);

  // Função para alternar expansão do aluno
  const toggleStudentExpansion = useCallback((alunoId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alunoId)) {
        newSet.delete(alunoId);
      } else {
        newSet.add(alunoId);
      }
      return newSet;
    });
  }, []);

  // Função para lidar com cliques em botões
  const handleButtonClick = useCallback((action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  }, []);

  // Função para obter próximo número de parcela
  const getProximoNumeroParcela = useCallback(async (registroFinanceiroId: string, tipoItem: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros') => {
    try {
      const { data: parcelas, error } = await supabase
        .from('parcelas_alunos')
        .select('numero_parcela')
        .eq('registro_financeiro_id', registroFinanceiroId)
        .eq('tipo_item', tipoItem)
        .order('numero_parcela', { ascending: false })
        .limit(1);

      if (error) throw error;

      return parcelas && parcelas.length > 0 ? parcelas[0].numero_parcela + 1 : 1;
    } catch (error) {
      console.error('Erro ao buscar próximo número de parcela:', error);
      return 1;
    }
  }, []);

  // Função para abrir modal de criar parcela
  const abrirModalCriarParcela = useCallback(async (alunoId: string, nomeAluno: string, registroFinanceiroId: string, tipoItem: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros' = 'plano') => {
    try {
      // Calcular o próximo número de parcela para o tipo específico
      const proximoNumero = await getProximoNumeroParcela(registroFinanceiroId, tipoItem);
      
      setNovaParcela({
        registro_financeiro_id: registroFinanceiroId,
        tipo_item: tipoItem,
        numero_parcela: proximoNumero,
        valor: 0,
        data_vencimento: '',
        status_pagamento: 'pendente',
        idioma_registro: 'Inglês',
        observacoes: '',
        forma_pagamento: 'boleto'
      });
      setIsCreateModalOpen(true);
    } catch (error) {
      console.error('Erro ao calcular próximo número de parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao calcular número da parcela",
        variant: "destructive"
      });
    }
  }, [toast, getProximoNumeroParcela]);

  // Função para abrir modal de editar parcela
  const abrirModalEditarParcela = useCallback((parcela: ParcelaAluno) => {
    console.log('Abrindo modal para editar parcela:', parcela);
    setEditandoParcela(parcela);
    setIsEditModalOpen(true);
  }, []);

  // Função para abrir modal de ver histórico
  const abrirModalVerHistorico = useCallback((alunoId: string, nomeAluno: string) => {
    setAlunoHistorico({ id: alunoId, nome: nomeAluno });
    setIsVerHistoricoModalOpen(true);
  }, []);

  // Função para abrir modal de mover para histórico
  const abrirModalMoverParaHistorico = useCallback((alunoId: string, nomeAluno: string, parcelas: ParcelaAluno[]) => {
    setAlunoParaArquivar({ id: alunoId, nome: nomeAluno, parcelas });
    setIsMoverHistoricoModalOpen(true);
  }, []);

  // Função para abrir modal de visualizar plano
  const abrirModalVisualizarPlano = useCallback((aluno: AlunoFinanceiro) => {
    setAlunoPlanoDetalhes(aluno);
    setIsVisualizarPlanoModalOpen(true);
  }, []);

  // Função para abrir modal de excluir registro
  const abrirModalExcluirRegistro = useCallback((alunoId: string, nomeAluno: string, registroId: string) => {
    setSelectedAluno({ id: alunoId, nome: nomeAluno });
    setSelectedRegistroId(registroId);
    setExcluirModalOpen(true);
  }, []);

  // Função para abrir modal de tornar ativo
  const abrirModalTornarAtivo = useCallback((aluno: AlunoFinanceiro) => {
    setAlunoParaTornarAtivo(aluno);
    setIsTornarAtivoModalOpen(true);
  }, []);

  // Função para abrir modal de múltiplas parcelas
  const abrirModalMultiplasParcelas = useCallback((aluno: AlunoFinanceiro) => {
    setSelectedAlunoForMultipleParcelas(aluno);
    setIsMultipleParcelasModalOpen(true);
  }, []);

  // Função para abrir confirmação de exclusão
  const abrirConfirmacaoExclusao = useCallback((parcela: ParcelaAluno) => {
    setParcelaParaExcluir({
      id: parcela.id,
      numero: parcela.numero_parcela,
      valor: parcela.valor
    });
    setIsConfirmDeleteModalOpen(true);
  }, []);

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

      // Buscar alunos que já possuem plano
      const { data: existingPlans, error: plansError } = await supabase
        .from('financeiro_alunos')
        .select('aluno_id');

      if (plansError) throw plansError;

      const studentsWithPlans = new Set(existingPlans?.map(plan => plan.aluno_id) || []);
      const availableStudents = students.filter(student => !studentsWithPlans.has(student.id));

      if (availableStudents.length === 0) {
        toast({
          title: "Todos os alunos já possuem plano",
          description: "Todos os alunos ativos já possuem um plano de pagamento criado.",
          variant: "destructive",
        });
        return;
      }

      // Abrir modal sem aluno pré-selecionado
      setSelectedStudentForPlan(null);
      setIsFinancialPlanDialogOpen(true);
    } catch (error) {
      console.error('Erro ao verificar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar os planos existentes.",
        variant: "destructive",
      });
    }
  };

  // Função para sucesso do plano
  const handlePlanSuccess = () => {
    if (onRefresh) {
      onRefresh(); // Atualizar a lista de alunos financeiros
    } else {
      carregarDados(); // Fallback para carregamento interno
    }
    setIsFinancialPlanDialogOpen(false);
    setSelectedStudentForPlan(null);
  };

  // Função para verificar se o registro está arquivado
  const isRegistroArquivado = (aluno: any) => {
    console.log('Verificando aluno:', aluno.nome, 'Status:', aluno.status_geral);
    return aluno.status_geral === 'Arquivado';
  };

  // Função para criar plano de pagamento para um aluno específico
  const handleCreatePlanForStudent = async (aluno: any) => {
    try {
      // Verificar se existe um registro financeiro arquivado para reativar
      const { data: registroArquivado, error } = await supabase
        .from('financeiro_alunos')
        .select('*')
        .eq('aluno_id', aluno.id)
        .eq('status_geral', 'Arquivado')
        .single();

      if (registroArquivado && !error) {
        // Reativar o registro existente
        const { error: updateError } = await supabase
          .from('financeiro_alunos')
          .update({ status_geral: 'Pendente' })
          .eq('id', registroArquivado.id);

        if (updateError) throw updateError;

        toast({
          title: "Sucesso",
          description: "Registro financeiro reativado com sucesso!",
        });

        // Atualizar dados
        if (onRefresh) {
          onRefresh();
        } else {
          carregarDados();
        }
      } else {
        // Abrir modal para criar novo plano
        setSelectedStudentForPlan(aluno);
        setIsFinancialPlanDialogOpen(true);
      }
    } catch (error) {
      console.error('Erro ao processar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar plano de pagamento",
        variant: "destructive"
      });
    }
  };



  // Função para carregar dados dos alunos
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      const migradoValue = tipoRegistro === 'ativos' ? 'nao' : 'sim';
      
      const { data: alunosData, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          id,
          aluno_id,
          migrado,
          plano_id,
          valor_plano,
          valor_matricula,
          valor_material,
          desconto_total,
          status_geral,
          data_primeiro_vencimento,
          forma_pagamento_plano,
          forma_pagamento_material,
          forma_pagamento_matricula,
          numero_parcelas_plano,
          numero_parcelas_material,
          numero_parcelas_matricula,
          alunos (
            id,
            nome,
            status
          ),
          planos (
            id,
            nome,
            valor_total
          ),
          parcelas_alunos (
            id,
            registro_financeiro_id,
            numero_parcela,
            valor,
            data_vencimento,
            data_pagamento,
            status_pagamento,
            tipo_item,
            descricao_item,
            idioma_registro,
            forma_pagamento,
            observacoes,
            criado_em,
            atualizado_em,
            comprovante
          )
        `)
        .eq('migrado', migradoValue);

      if (error) {
        console.error('Erro ao carregar dados:', error);
        throw error;
      }

      const alunosFormatados = alunosData?.map(registro => ({
        id: registro.alunos?.id || '',
        nome: registro.alunos?.nome || '',
        migrado: registro.migrado,
        plano_id: registro.plano_id,
        valor_total: (registro.valor_plano || 0) + (registro.valor_material || 0) + (registro.valor_matricula || 0) - (registro.desconto_total || 0),
        valor_plano: registro.valor_plano,
        valor_matricula: registro.valor_matricula,
        valor_material: registro.valor_material,
        desconto_total: registro.desconto_total,
        status_geral: registro.status_geral,
        data_primeiro_vencimento: registro.data_primeiro_vencimento,
        forma_pagamento_plano: registro.forma_pagamento_plano,
        forma_pagamento_material: registro.forma_pagamento_material,
        forma_pagamento_matricula: registro.forma_pagamento_matricula,
        numero_parcelas_plano: registro.numero_parcelas_plano,
        numero_parcelas_material: registro.numero_parcelas_material,
        numero_parcelas_matricula: registro.numero_parcelas_matricula,
        plano: registro.planos ? {
          id: registro.planos.id,
          nome: registro.planos.nome,
          valor_total: registro.planos.valor_total
        } : null,
        // Ordenar parcelas usando a nova função
        parcelas: ordenarParcelasPorTipoENumero(registro.parcelas_alunos || []),
        registro_financeiro_id: registro.id
      })) || [];

      console.log('Alunos carregados:', alunosFormatados.map(a => ({ nome: a.nome, status_geral: a.status_geral })));

      setAlunos(alunosFormatados);
      
      // Calcular total de parcelas carregadas
      const totalParcelas = alunosFormatados.reduce((total, aluno) => 
        total + aluno.parcelas.length, 0
      );
      setTotalParcelasCarregadas(totalParcelas);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos alunos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [tipoRegistro, toast]);

  // Função para criar nova parcela
  const criarParcela = async () => {
    if (!novaParcela) return;

    try {
      const parcelaCriada = await criarNovaParcela(
        novaParcela.registro_financeiro_id,
        novaParcela.tipo_item,
        {
          valor: novaParcela.valor,
          data_vencimento: novaParcela.data_vencimento,
          status_pagamento: novaParcela.status_pagamento,
          descricao_item: novaParcela.descricao_item,
          idioma_registro: novaParcela.idioma_registro,
          forma_pagamento: novaParcela.forma_pagamento
        }
      );

      if (parcelaCriada) {
        toast({
          title: "Sucesso",
          description: "Parcela criada com sucesso!",
        });
        setNovaParcela(null);
        setIsCreateModalOpen(false);
        await carregarDados();
      } else {
        throw new Error('Erro ao criar parcela');
      }
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar parcela",
        variant: "destructive"
      });
    }
  };

  // Função para salvar edição de parcela
  const salvarEdicaoParcela = useCallback(async () => {
    if (!editandoParcela) return;

    try {
      const { error } = await supabase
        .from('parcelas_alunos')
        .update({
          tipo_item: editandoParcela.tipo_item,
          numero_parcela: editandoParcela.numero_parcela,
          valor: editandoParcela.valor,
          data_vencimento: editandoParcela.data_vencimento,
          status_pagamento: editandoParcela.status_pagamento,
          observacoes: editandoParcela.observacoes || null,
          forma_pagamento: editandoParcela.forma_pagamento || 'boleto',
          descricao_item: editandoParcela.descricao_item || null
        })
        .eq('id', editandoParcela.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela atualizada com sucesso!"
      });

      setIsEditModalOpen(false);
      setEditandoParcela(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar parcela",
        variant: "destructive"
      });
    }
  }, [editandoParcela, toast, carregarDados]);

  // Função para excluir parcela (modificada para ser chamada após confirmação)
  const excluirParcela = useCallback(async (parcelaId: number) => {
    try {
      const { error } = await supabase
        .from('parcelas_alunos')
        .delete()
        .eq('id', parcelaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela excluída com sucesso!"
      });

      // Fechar modal e limpar estado
      setIsConfirmDeleteModalOpen(false);
      setParcelaParaExcluir(null);
      
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir parcela",
        variant: "destructive"
      });
    }
  }, [toast, carregarDados]);

  // Função para cancelar exclusão
  const cancelarExclusao = useCallback(() => {
    setIsConfirmDeleteModalOpen(false);
    setParcelaParaExcluir(null);
  }, []);

  // Função para excluir registro financeiro completo
  const excluirRegistroFinanceiro = useCallback(async (registroId: string, alunoNome: string) => {
    try {
      // 1. Verificar se existem parcelas pagas (importante para auditoria)
      const { data: parcelasPagas } = await supabase
        .from('parcelas_alunos')
        .select('*')
        .eq('registro_financeiro_id', registroId)
        .eq('status_pagamento', 'pago');
      
      if (parcelasPagas && parcelasPagas.length > 0) {
        toast({
          title: "Atenção!",
          description: `Este registro possui ${parcelasPagas.length} parcela(s) já paga(s). Considere mover para histórico em vez de excluir.`,
          variant: "destructive"
        });
        return;
      }
      
      // 2. Excluir o registro financeiro principal (parcelas serão excluídas automaticamente por CASCADE)
      const { error } = await supabase
        .from('financeiro_alunos')
        .delete()
        .eq('id', registroId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: `Registro financeiro de ${alunoNome} excluído permanentemente.`,
      });
      
      // 3. Atualizar a interface
      if (onRefresh) {
        onRefresh();
      } else {
        carregarDados();
      }
      
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir registro financeiro. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [toast, carregarDados, onRefresh]);

  // Função para calcular o número da parcela por tipo de item
  const calcularNumeroPorTipo = useCallback((parcelas: any[], parcelaAtual: any) => {
    // Filtrar parcelas do mesmo tipo e ordenar por numero_parcela
    const parcelasMesmoTipo = parcelas
      .filter(p => p.tipo_item === parcelaAtual.tipo_item)
      .sort((a, b) => a.numero_parcela - b.numero_parcela);
    
    // Encontrar a posição da parcela atual na lista ordenada
    const indice = parcelasMesmoTipo.findIndex(p => p.id === parcelaAtual.id);
    
    // Retornar a posição + 1 (numeração começa em 1)
    return indice + 1;
  }, []);

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (alunosFinanceiros) {
      setAlunos(alunosFinanceiros);
      setLoading(false);
    } else {
      carregarDados();
    }
  }, [alunosFinanceiros, carregarDados, tipoRegistro]);

  return (
    <motion.div 
      ref={containerRef}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {loading && (
        <motion.div 
          className="flex justify-center items-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="h-8 w-8 text-red-600" />
          </motion.div>
          <span className="ml-3 text-lg font-medium text-gray-600">Carregando dados financeiros...</span>
        </motion.div>
      )}

      {/* Header com gradiente e estatísticas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="overflow-hidden shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-red-600 to-gray-800 text-white relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-white/10"
              animate={{ 
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Users className="h-8 w-8" />
                  </motion.div>
                  <div>
                        <CardTitle className="text-2xl font-bold flex items-center space-x-3">
                      <div className="bg-white/20 rounded-full p-2">
                        <Users className="h-6 w-6" />
                      </div>
                      <span>Agrupamento Financeiro de Alunos</span>
                    </CardTitle>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={carregarDados}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-2 transition-all duration-200"
                  title="Atualizar dados"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.button>
              </div>
              
              {/* Estatísticas */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-full p-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-red-100 text-sm">Total de Alunos</p>
                      <p className="text-2xl font-bold">{filteredAlunos.length}</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500/20 rounded-full p-2">
                      <TrendingUp className="h-5 w-5 text-green-200" />
                    </div>
                    <div>
                      <p className="text-red-100 text-sm">Total Arrecadado</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(filteredAlunos
                          .filter(aluno => aluno.status_geral === 'Pago')
                          .reduce((acc, aluno) => acc + aluno.valor_total, 0))}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-500/20 rounded-full p-2">
                      <TrendingDown className="h-5 w-5 text-yellow-200" />
                    </div>
                    <div>
                      <p className="text-red-100 text-sm">Total Pendente</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(filteredAlunos
                          .filter(aluno => aluno.status_geral !== 'Pago')
                          .reduce((acc, aluno) => acc + aluno.valor_total, 0))}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/20 rounded-full p-2">
                      <CreditCard className="h-5 w-5 text-blue-200" />
                    </div>
                    <div>
                      <p className="text-red-100 text-sm">Total de Parcelas</p>
                      <p className="text-2xl font-bold">
                        {filteredAlunos.reduce((acc, aluno) => acc + aluno.parcelas.length, 0)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Record Type Toggle - Centralizado onde estava o botão de criar plano */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mb-6"
      >
        <div className="bg-gray-100 p-1 rounded-lg flex shadow-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTipoRegistro('ativos')}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
              tipoRegistro === 'ativos'
                ? 'bg-white text-red-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Registros Ativos</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTipoRegistro('migrados')}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
              tipoRegistro === 'migrados'
                ? 'bg-white text-orange-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>Registros Migrados</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Filters Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >

        <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-gray-100">
          <CardHeader 
            className="pb-4 cursor-pointer"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <CardTitle className="flex items-center justify-between text-red-700">
              <div className="flex items-center gap-3">
                <Filter className="h-6 w-6" />
                Filtros Avançados
              </div>
              <div className="flex items-center gap-4">
                {/* Botão Criar Plano - Movido para o canto */}
                {tipoRegistro === 'ativos' && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleCreatePlan}
                      size="sm"
                      className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white border-0 shadow-md transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <Users className="h-4 w-4 mr-1" />
                      Criar Plano
                    </Button>
                  </motion.div>
                )}
                <motion.div
                  animate={{ rotate: isFiltersExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </div>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {isFiltersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <CardContent>
                  {/* Search Filter */}
                  <div className="mb-6">
                    <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                      Buscar por nome do aluno
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        type="text"
                        placeholder="Digite o nome do aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Status Filters */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Status das Parcelas
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'pago', label: 'Pagas', color: 'green', icon: CheckCircle },
                        { key: 'pendente', label: 'Pendentes', color: 'yellow', icon: Clock },
                        { key: 'vencido', label: 'Vencidas', color: 'red', icon: AlertTriangle },
                        { key: 'cancelado', label: 'Canceladas', color: 'gray', icon: XCircle }
                      ].map(({ key, label, color, icon: Icon }) => {
                        const isActive = statusFilters.includes(key);
                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusFilterChange(key, !isActive)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                              isActive
                                ? `bg-${color}-100 border-${color}-300 text-${color}-800`
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Filters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* Type Filter */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Item</Label>
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
                                ? 'Selecione tipos...' 
                                : `${tipoFilters.length} tipos`
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
                    {/* Language Filter */}
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
                    
                    {/* Payment Method Filter */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Forma de Pagamento</Label>
                      <Select value={formaPagamentoFilter} onValueChange={handleFormaPagamentoChange}>
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          <SelectItem value="boleto">
                            <div className="flex items-center space-x-2">
                              <Receipt className="h-4 w-4" />
                              <span>Boleto</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cartao_credito">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Cartão de Crédito</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cartao_debito">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Cartão de Débito</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pix">
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4" />
                              <span>PIX</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dinheiro">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Dinheiro</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="transferencia">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4" />
                              <span>Transferência</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Date Range Filters */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Data Início</Label>
                      <Input
                        type="date"
                        value={dataVencimentoInicio}
                        onChange={(e) => {
                          const novaDataInicio = e.target.value;
                          setDataVencimentoInicio(novaDataInicio);
                          // Auto-preencher data fim se estiver vazia
                          if (novaDataInicio && !dataVencimentoFim) {
                            setDataVencimentoFim(novaDataInicio);
                          }
                        }}
                        className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Data Fim</Label>
                      <Input
                        type="date"
                        value={dataVencimentoFim}
                        onChange={(e) => setDataVencimentoFim(e.target.value)}
                        className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {(searchTerm || statusFilters.length < 4 || tipoFilters.length < 5 || idiomaFilter !== 'todos' || 
                    dataVencimentoInicio || dataVencimentoFim || formaPagamentoFilter !== 'todos') && (
                    <motion.div 
                      className="mt-6 flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>



      {/* Modal de criar parcela */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-red-600" />
              <span>Criar Nova Parcela</span>
            </DialogTitle>
          </DialogHeader>
          {novaParcela && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={novaParcela.tipo_item} 
                  onValueChange={(value) => setNovaParcela(prev => prev ? {...prev, tipo_item: value as 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros'} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano">Plano</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="matrícula">Matrícula</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="numero">Número da Parcela</Label>
                <Input
                  id="numero"
                  type="number"
                  value={novaParcela.numero_parcela}
                  onChange={(e) => setNovaParcela(prev => prev ? {...prev, numero_parcela: parseInt(e.target.value) || 1} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={novaParcela.valor}
                  onChange={(e) => setNovaParcela(prev => prev ? {...prev, valor: parseFloat(e.target.value) || 0} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="vencimento">Data de Vencimento</Label>
                <Input
                  id="vencimento"
                  type="date"
                  value={novaParcela.data_vencimento}
                  onChange={(e) => setNovaParcela(prev => prev ? {...prev, data_vencimento: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                <Select 
                  value={novaParcela.forma_pagamento || 'boleto'} 
                  onValueChange={(value) => setNovaParcela(prev => prev ? {...prev, forma_pagamento: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="descricao-item">Descrição do Item</Label>
                <Input
                  id="descricao-item"
                  type="text"
                  placeholder="Ex: valor promocional material + plano"
                  value={novaParcela.descricao_item || ''}
                  onChange={(e) => setNovaParcela(prev => prev ? {...prev, descricao_item: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Adicione observações sobre esta parcela..."
                  value={novaParcela.observacoes || ''}
                  onChange={(e) => setNovaParcela(prev => prev ? {...prev, observacoes: e.target.value} : null)}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNovaParcela(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={criarParcela}
                  className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 transition-all duration-200"
                >
                  Criar Parcela
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de editar parcela */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-red-600" />
              <span>Editar Parcela</span>
            </DialogTitle>
          </DialogHeader>
          {editandoParcela ? (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              
              <div>
                <Label htmlFor="edit-tipo">Tipo</Label>
                <Select 
                  value={editandoParcela.tipo_item} 
                  onValueChange={(value) => setEditandoParcela(prev => prev ? {...prev, tipo_item: value as 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros'} : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano">Plano</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="matrícula">Matrícula</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-numero">Número da Parcela</Label>
                <Input
                  id="edit-numero"
                  type="number"
                  value={editandoParcela.numero_parcela}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, numero_parcela: parseInt(e.target.value) || 1} : null)}
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
                  value={editandoParcela.data_vencimento}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, data_vencimento: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editandoParcela.status_pagamento} 
                  onValueChange={(value) => setEditandoParcela(prev => prev ? {...prev, status_pagamento: value as 'pago' | 'pendente' | 'vencido' | 'cancelado'} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-forma-pagamento">Forma de Pagamento</Label>
                <Select 
                  value={editandoParcela.forma_pagamento || 'boleto'} 
                  onValueChange={(value) => setEditandoParcela(prev => prev ? {...prev, forma_pagamento: value} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-descricao-item">Descrição do Item</Label>
                <Input
                  id="edit-descricao-item"
                  type="text"
                  placeholder="Ex: valor promocional material + plano"
                  value={editandoParcela.descricao_item || ''}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, descricao_item: e.target.value} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-observacoes">Observações</Label>
                <textarea
                  id="edit-observacoes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Adicione observações sobre esta parcela..."
                  value={editandoParcela.observacoes || ''}
                  onChange={(e) => setEditandoParcela(prev => prev ? {...prev, observacoes: e.target.value} : null)}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    saveScrollPosition();
                    setIsEditModalOpen(false);
                    setEditandoParcela(null);
                    restoreScrollPosition();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={salvarEdicaoParcela}
                  className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 transition-all duration-200"
                >
                  Salvar Alterações
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Carregando dados da parcela...</p>
              <p className="text-sm mt-2">Se este problema persistir, tente fechar e abrir o modal novamente.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabela principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    {tipoRegistro === 'ativos' ? 'Alunos Cadastrados' : 'Registros Migrados'}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredAlunos.length} aluno{filteredAlunos.length !== 1 ? 's' : ''} encontrado{filteredAlunos.length !== 1 ? 's' : ''}
                    {totalParcelasCarregadas > 0 && (
                      <span className="ml-2 font-medium text-blue-600">
                        • {totalParcelasCarregadas} parcelas carregadas
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-800 px-3 py-1">
                  {filteredAlunos.length} registros
                </Badge>
                {totalParcelasCarregadas > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    {totalParcelasCarregadas} parcelas
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Nome do Aluno</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>{tipoRegistro === 'migrados' ? 'Total Pago' : 'Valor Total'}</span>
              </div>
            </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Parcelas</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Primeiro Vencimento</span>
                    </div>
                  </TableHead>
                  {/* Remover coluna Status Geral apenas para migrados */}
            {tipoRegistro === 'ativos' && (
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Status Geral</span>
                </div>
              </TableHead>
            )}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {currentStudents.map((aluno, index) => {
                    const isExpanded = expandedStudents.has(aluno.id);
                    
                    return (
                      <React.Fragment key={aluno.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="cursor-pointer hover:bg-red-50 transition-all duration-200 border-b border-gray-100"
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
                          <TableCell className="text-center">
                            <motion.div 
                              className="flex justify-center"
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="bg-red-100 rounded-full p-1">
                                <ChevronRight className="h-4 w-4 text-red-600" />
                              </div>
                            </motion.div>
                          </TableCell>
                          <TableCell className="font-medium text-base py-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-2">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>{aluno.nome}</span>
                              </div>
                            </div>
                          </TableCell>
                          {isRegistroArquivado(aluno) ? (
                            <TableCell colSpan={tipoRegistro === 'ativos' ? 4 : 3} className="py-4">
                              <div className="flex items-center justify-center bg-gray-100 text-gray-600 px-6 py-6 rounded-lg">
                                <Archive className="h-6 w-6 mr-2" />
                                <span className="text-lg font-semibold">Arquivado</span>
                              </div>
                            </TableCell>
                          ) : (
                            <>
                              <TableCell className="text-base py-4">
                                <span className="font-semibold text-gray-800">
                                  {tipoRegistro === 'migrados' 
                                    ? formatCurrency(calcularTotalPago(aluno))
                                    : formatCurrency((aluno.valor_plano || 0) + (aluno.valor_material || 0) + (aluno.valor_matricula || 0) - (aluno.desconto_total || 0))
                                  }
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex gap-1 flex-wrap">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }}>
                                        <Badge className="bg-green-100 text-green-800 text-xs border border-green-200 flex items-center gap-1 px-1 py-0.5 min-w-[30px] justify-center cursor-help">
                                          <span className="font-semibold">{aluno.parcelas.filter(p => p.status_pagamento === 'pago').length}</span>
                                          <CheckCircle className="h-5 w-5" />
                                        </Badge>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Parcelas Pagas</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }}>
                                        <Badge className="bg-red-100 text-red-800 text-xs border border-red-200 flex items-center gap-1 px-1 py-0.5 min-w-[30px] justify-center cursor-help">
                                          <span className="font-semibold">{aluno.parcelas.filter(p => p.status_pagamento === 'vencido').length}</span>
                                          <AlertTriangle className="h-5 w-5" />
                                        </Badge>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Parcelas Vencidas</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }}>
                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs border border-yellow-200 flex items-center gap-1 px-1 py-0.5 min-w-[30px] justify-center cursor-help">
                                          <span className="font-semibold">{aluno.parcelas.filter(p => p.status_pagamento === 'pendente').length}</span>
                                          <Clock className="h-5 w-5" />
                                        </Badge>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Parcelas Pendentes</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }}>
                                        <Badge className="bg-gray-100 text-gray-800 text-xs border border-gray-200 flex items-center gap-1 px-1 py-0.5 min-w-[30px] justify-center cursor-help">
                                          <span className="font-semibold">{aluno.parcelas.filter(p => p.status_pagamento === 'cancelado').length}</span>
                                          <XCircle className="h-5 w-5" />
                                        </Badge>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Parcelas Canceladas</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                              <TableCell className="text-base py-4">
                                <span className="font-semibold text-gray-600">{formatDate(aluno.data_primeiro_vencimento)}</span>
                              </TableCell>
                              {tipoRegistro === 'ativos' && (
                                <TableCell className="text-base py-4">
                                  <div className="flex flex-col gap-2 min-w-[120px]">
                                    {(() => {
                                      const progresso = calcularProgressoTotal(aluno);
                                      return (
                                        <>
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold text-gray-700">
                                              {progresso.pagas}/{progresso.total}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {progresso.percentual}%
                                            </span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-5">
                                            <div 
                                              className="h-5 rounded-full transition-all duration-300 bg-gradient-to-r from-red-600 to-gray-800"
                                              style={{ width: `${progresso.percentual}%` }}
                                            ></div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </TableCell>
                              )}
                            </>
                          )}
                        </motion.tr>
                        
                        {/* Linha expandida com animação */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <TableCell colSpan={tipoRegistro === 'migrados' ? 5 : 6} className="p-0">
                                <motion.div 
                                  className="bg-gradient-to-r from-red-50 to-gray-100 p-6 border-l-4 border-red-500"
                                  initial={{ opacity: 0, y: -20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-2">
                                        <Eye className="h-5 w-5 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-xl text-gray-800">
                                          Parcelas de {aluno.nome}
                                        </h4>
                                        <p className="text-gray-600">Detalhamento completo dos registros financeiros</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleButtonClick(() => abrirModalVisualizarPlano(aluno), e)}
                                        className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                      >
                                        <Receipt className="h-4 w-4" />
                                        <span>Visualizar Plano de Pagamento</span>
                                      </motion.button>
                                      {aluno.migrado === 'nao' ? (
                                        <>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => handleButtonClick(() => abrirModalVerHistorico(aluno.id, aluno.nome), e)}
                                            className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                          >
                                            <History className="h-4 w-4" />
                                            <span>Ver Histórico</span>
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => handleButtonClick(() => abrirModalMoverParaHistorico(aluno.id, aluno.nome, aluno.parcelas), e)}
                                            className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                          >
                                            <Archive className="h-4 w-4" />
                                            <span>Mover para Histórico</span>
                                          </motion.button>
                                        </>
                                      ) : null}
                                      
                                      {/* Botão Nova Parcela - agora disponível para todos os tipos de registro */}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                          >
                                            <Plus className="h-4 w-4" />
                                            <span>Nova Parcela</span>
                                            <ChevronDown className="h-4 w-4" />
                                          </motion.button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id, 'plano'), e)}>
                                            Plano
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id, 'material'), e)}>
                                            Material
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id, 'matrícula'), e)}>
                                            Matrícula
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id, 'cancelamento'), e)}>
                                            Cancelamento
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id, 'outros'), e)}>
                                            Outros
                                          </DropdownMenuItem>
                                          {aluno.migrado === 'sim' && (
                                            <DropdownMenuItem onClick={(e) => handleButtonClick(() => abrirModalMultiplasParcelas(aluno), e)}>
                                              Múltiplas Parcelas
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>

                                      

                                  
                                  {/* Botão Tornar Ativo - apenas para registros migrados */}
                                      {aluno.migrado === 'sim' && (
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={(e) => handleButtonClick(() => abrirModalTornarAtivo(aluno), e)}
                                          className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                          title="Tornar registro ativo"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                          <span>Tornar Ativo</span>
                                        </motion.button>
                                      )}
                                      
                                      {/* Botão Excluir Registro - agora disponível para todos os tipos de registro */}
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleButtonClick(() => abrirModalExcluirRegistro(aluno.id, aluno.nome, aluno.registro_financeiro_id), e)}
                                        className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg border border-red-600"
                                        title="Excluir registro financeiro permanentemente"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Excluir Registro</span>
                                      </motion.button>
                                    </div>
                                  </div>
                                  
                                  {/* Renderização condicional baseada no status arquivado */}
                                  {isRegistroArquivado(aluno) ? (
                                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-gray-50 p-8">
                                      <div className="text-center">
                                        <div className="flex justify-center mb-4">
                                          <Archive className="h-16 w-16 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                          Nenhum Registro Financeiro Ativo
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                          Este aluno não possui registros financeiros ativos no momento.
                                        </p>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleCreatePlanForStudent(aluno)}
                                          className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg mx-auto"
                                        >
                                          <Plus className="h-5 w-5" />
                                          <span>Criar Plano de Pagamento</span>
                                        </motion.button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-red-200 overflow-hidden shadow-lg bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900">
                                            <TableHead className="font-semibold text-white">
                                              <div className="flex items-center space-x-2">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Tipo Item</span>
                                              </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">Parcela</TableHead>
                                            <TableHead className="font-semibold text-white">
                                              <div className="flex items-center space-x-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span>Valor</span>
                                              </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">Forma Pagamento</TableHead>
                                            <TableHead className="font-semibold text-white">
                                              <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4" />
                                                <span>Descrição do Item</span>
                                              </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">
                                              <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Vencimento</span>
                                              </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">
                                              <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Pagamento</span>
                                              </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">Status</TableHead>
                                            <TableHead className="font-semibold text-white">
                                              <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4" />
                                                <span>Observações</span>
                                              </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-white text-center">Ações</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {aluno.parcelas.length > 0 ? (
                                          aluno.parcelas.map((parcela, parcelaIndex) => {
                                              const formaPagamento = getFormaPagamentoParcela(parcela, aluno);
                                              const isLastParcela = parcelaIndex === aluno.parcelas.length - 1;
                                              
                                              // Lógica aprimorada: só mostra preview se a parcela atual for a última E for a parcela que foi marcada como paga
                                              const shouldShowPreview = parcelaPreview && 
                                                                       parcelaPreview.registro_financeiro_id === parcela.registro_financeiro_id && 
                                                                       aluno.migrado === 'sim' && 
                                                                       isLastParcela &&
                                                                       parcelaPreview.parcela_base_id === parcela.id; // Verifica se esta é a parcela que gerou o preview
                                              
                                              return (
                                                <React.Fragment key={parcela.id}>
                                                  {/* Linha da parcela normal */}
                                                  <motion.tr
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: parcelaIndex * 0.05 }}
                                                    className="hover:bg-red-50 transition-colors duration-200 border-b border-gray-100"
                                                  >
                                                    <TableCell className="font-medium py-4 text-base">
                                                      <div className="flex items-center gap-2">
                                                        {getTipoIcon(parcela.tipo_item)}
                                                        <span className="capitalize font-medium text-base">{parcela.tipo_item}</span>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-base font-semibold">{calcularNumeroPorTipo(aluno.parcelas, parcela)}</TableCell>
                                                    <TableCell className="font-bold py-4 text-base text-green-700">{formatCurrency(parcela.valor)}</TableCell>
                                                    <TableCell className="py-4 text-base capitalize">
                                                      {formaPagamento}
                                                    </TableCell>
                                                    <TableCell className="py-4 max-w-xs">
                                                      <div className="text-sm text-gray-600">
                                                        {parcela.descricao_item ? (
                                                          <div className="truncate" title={parcela.descricao_item}>
                                                            {parcela.descricao_item}
                                                          </div>
                                                        ) : (
                                                          <span className="text-gray-400 italic">Sem descrição</span>
                                                        )}
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-base">{formatDate(parcela.data_vencimento)}</TableCell>
                                                    <TableCell className="py-4 text-base">
                                                      {parcela.data_pagamento ? formatDate(parcela.data_pagamento) : '-'}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                      <motion.div whileHover={{ scale: 1.05 }}>
                                                        <Badge className={`${getStatusColor(parcela.status_pagamento)} flex items-center gap-1 w-fit`}>
                                                          {getStatusIcon(parcela.status_pagamento)}
                                                          {parcela.status_pagamento.charAt(0).toUpperCase() + parcela.status_pagamento.slice(1)}
                                                        </Badge>
                                                      </motion.div>
                                                    </TableCell>
                                                    <TableCell className="py-4 max-w-xs">
                                                      <div className="text-sm text-gray-600">
                                                        {parcela.observacoes ? (
                                                          <div className="truncate" title={parcela.observacoes}>
                                                            {parcela.observacoes}
                                                          </div>
                                                        ) : (
                                                          <span className="text-gray-400 italic">Sem observações</span>
                                                        )}
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                      <div className="flex gap-2 justify-center">
                                                        {/* Botão Marcar como Pago - só aparece se não estiver pago ou cancelado */}
                                                        {parcela.status_pagamento !== 'pago' && parcela.status_pagamento !== 'cancelado' && (
                                                          <motion.div
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                          >
                                                            <Button
                                                              size="sm"
                                                              onClick={(e) => handleButtonClick(async () => {
                                                                try {
                                                                  // Verificar se é registro migrado
                                                                  if (aluno.migrado === 'sim') {
                                                                    await marcarComoPageMigrado(
                                                                      parcela.id, 
                                                                      parcela.registro_financeiro_id,
                                                                      carregarDados
                                                                    );
                                                                  } else {
                                                                    // Comportamento normal para registros ativos
                                                                    await marcarComoPago(parcela.id);
                                                                    await carregarDados();
                                                                  }
                                                                } catch (error) {
                                                                  console.error('Erro ao marcar como pago:', error);
                                                                }
                                                              }, e)}
                                                              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                                                              title="Marcar como Pago"
                                                              disabled={loadingPreview}
                                                            >
                                                              <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                          </motion.div>
                                                        )}
                                                        
                                                        {/* Botão Editar */}
                                                        <motion.div
                                                          whileHover={{ scale: 1.1 }}
                                                          whileTap={{ scale: 0.9 }}
                                                        >
                                                          <Button
                                                            size="sm"
                                                            onClick={(e) => handleButtonClick(() => abrirModalEditarParcela(parcela), e)}
                                                            className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white"
                                                            title="Editar Parcela"
                                                          >
                                                            <Edit className="h-4 w-4" />
                                                          </Button>
                                                        </motion.div>
                                                        
                                                        {/* Botão Excluir */}
                                                        <motion.div
                                                          whileHover={{ scale: 1.1 }}
                                                          whileTap={{ scale: 0.9 }}
                                                        >
                                                          <Button
                                                            size="sm"
                                                            onClick={(e) => handleButtonClick(() => abrirConfirmacaoExclusao(parcela), e)}
                                                            className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white"
                                                            title="Excluir Parcela"
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </Button>
                                                        </motion.div>
                                                      </div>
                                                    </TableCell>
                                                  </motion.tr>
                                                  
                                                  {/* Linha da prévia da próxima parcela - só aparece após a última parcela */}
                                                  {shouldShowPreview && (
                                                    <motion.tr
                                                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                      animate={{ opacity: 0.7, y: 0, scale: 1 }}
                                                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                                      transition={{ duration: 0.4, ease: "easeOut" }}
                                                      className="border-b-2 border-dashed border-red-300 bg-gradient-to-r from-red-50 via-red-25 to-gray-50 hover:from-red-100 hover:to-gray-100 transition-all duration-300"
                                                    >
                                                      <TableCell className="py-4">
                                                        <motion.div 
                                                          className="flex items-center gap-2"
                                                          initial={{ x: -10 }}
                                                          animate={{ x: 0 }}
                                                          transition={{ delay: 0.2 }}
                                                        >
                                                          <motion.div
                                                            animate={{ 
                                                              scale: [1, 1.1, 1],
                                                              rotate: [0, 5, -5, 0]
                                                            }}
                                                            transition={{ 
                                                              duration: 2, 
                                                              repeat: Infinity,
                                                              ease: "easeInOut"
                                                            }}
                                                          >
                                                            {getTipoIcon(parcelaPreview.tipo_item)}
                                                          </motion.div>
                                                          <span className="capitalize font-semibold text-base bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent">
                                                            {parcelaPreview.tipo_item}
                                                          </span>
                                                          <motion.div
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                                          >
                                                            <Badge className="bg-gradient-to-r from-red-100 to-gray-100 text-red-800 text-xs border border-red-200 shadow-sm">
                                                              <motion.span
                                                                animate={{ opacity: [0.7, 1, 0.7] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                              >
                                                                ✨ Prévia
                                                              </motion.span>
                                                            </Badge>
                                                          </motion.div>
                                                        </motion.div>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.span 
                                                          className="text-base font-bold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent"
                                                          initial={{ scale: 0.8 }}
                                                          animate={{ scale: 1 }}
                                                          transition={{ delay: 0.1, type: "spring" }}
                                                        >
                                                          {parcelaPreview.numero_parcela}
                                                        </motion.span>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.span 
                                                          className="font-bold text-base bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent"
                                                          initial={{ scale: 0.8 }}
                                                          animate={{ scale: 1 }}
                                                          transition={{ delay: 0.15, type: "spring" }}
                                                        >
                                                          {formatCurrency(parcelaPreview.valor)}
                                                        </motion.span>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.span 
                                                          className="text-base capitalize bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent font-medium"
                                                          initial={{ opacity: 0 }}
                                                          animate={{ opacity: 1 }}
                                                          transition={{ delay: 0.2 }}
                                                        >
                                                          {parcelaPreview.forma_pagamento || 'boleto'}
                                                        </motion.span>
                                                      </TableCell>
                                                      <TableCell className="py-4 max-w-xs">
                                                        <motion.div 
                                                          className="text-sm"
                                                          initial={{ opacity: 0, x: 10 }}
                                                          animate={{ opacity: 1, x: 0 }}
                                                          transition={{ delay: 0.25 }}
                                                        >
                                                          {parcelaPreview.descricao_item ? (
                                                            <div className="truncate text-red-600 font-medium" title={parcelaPreview.descricao_item}>
                                                              {parcelaPreview.descricao_item}
                                                            </div>
                                                          ) : (
                                                            <span className="text-red-400 italic">Sem descrição</span>
                                                          )}
                                                        </motion.div>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.span 
                                                          className="text-base font-semibold bg-gradient-to-r from-red-700 to-gray-700 bg-clip-text text-transparent"
                                                          initial={{ opacity: 0 }}
                                                          animate={{ opacity: 1 }}
                                                          transition={{ delay: 0.3 }}
                                                        >
                                                          {formatDate(parcelaPreview.data_vencimento)}
                                                        </motion.span>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.span 
                                                          className="text-base text-red-400 font-medium"
                                                          initial={{ opacity: 0 }}
                                                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                                                          transition={{ duration: 2, repeat: Infinity }}
                                                        >
                                                          -
                                                        </motion.span>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.div
                                                          initial={{ scale: 0 }}
                                                          animate={{ scale: 1 }}
                                                          transition={{ delay: 0.35, type: "spring", stiffness: 150 }}
                                                        >
                                                          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 flex items-center gap-1 w-fit border border-yellow-200 shadow-sm">
                                                            <motion.div
                                                              animate={{ 
                                                                scale: [1, 1.2, 1],
                                                                opacity: [0.7, 1, 0.7]
                                                              }}
                                                              transition={{ 
                                                                duration: 2, 
                                                                repeat: Infinity, 
                                                                ease: "easeInOut" 
                                                              }}
                                                            >
                                                              <Clock className="h-3 w-3" />
                                                            </motion.div>
                                                            <span className="font-medium">Pendente (prévia)</span>
                                                          </Badge>
                                                        </motion.div>
                                                      </TableCell>
                                                      <TableCell className="py-4 max-w-xs">
                                                        <motion.span 
                                                          className="text-red-500 italic text-sm font-medium"
                                                          initial={{ opacity: 0, y: 5 }}
                                                          animate={{ 
                                                            opacity: [0.6, 1, 0.6], 
                                                            y: 0,
                                                            scale: [1, 1.05, 1]
                                                          }}
                                                          transition={{ 
                                                            opacity: { duration: 2, repeat: Infinity },
                                                            scale: { duration: 2, repeat: Infinity },
                                                            y: { delay: 0.4 }
                                                          }}
                                                        >
                                                          ✨ Será criada automaticamente
                                                        </motion.span>
                                                      </TableCell>
                                                      <TableCell className="py-4">
                                                        <motion.div 
                                                          className="flex gap-2 justify-center"
                                                          initial={{ opacity: 0, scale: 0.8 }}
                                                          animate={{ opacity: 1, scale: 1 }}
                                                          transition={{ delay: 0.5, type: "spring" }}
                                                        >
                                                          <motion.div
                                                            whileHover={{ 
                                                              scale: 1.15,
                                                              boxShadow: "0 8px 25px rgba(239, 68, 68, 0.3)"
                                                            }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                          >
                                                            <Button
                                                              size="sm"
                                                              onClick={async () => {
                                                                console.log('Botão criar parcela clicado');
                                                                try {
                                                                  const result = await criarProximaParcela();
                                                                  console.log('Resultado da criação:', result);
                                                                  if (result) {
                                                                    await carregarDados();
                                                                  }
                                                                } catch (error) {
                                                                  console.error('Erro no botão criar parcela:', error);
                                                                }
                                                              }}
                                                              disabled={loadingPreview}
                                                              className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white transition-all duration-300 shadow-lg border-0 relative overflow-hidden"
                                                              title="Criar Parcela"
                                                            >
                                                              <motion.div
                                                                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                                                                initial={{ x: "-100%" }}
                                                                whileHover={{ x: "100%" }}
                                                                transition={{ duration: 0.6 }}
                                                              />
                                                              <motion.div
                                                                animate={{ 
                                                                  scale: [1, 1.1, 1],
                                                                  opacity: [0.8, 1, 0.8]
                                                                }}
                                                                transition={{ 
                                                                  duration: 2, 
                                                                  repeat: Infinity, 
                                                                  ease: "easeInOut" 
                                                                }}
                                                              >
                                                                <Plus className="h-4 w-4 relative z-10" />
                                                              </motion.div>
                                                            </Button>
                                                          </motion.div>
                                                          
                                                          <motion.div
                                                            whileHover={{ 
                                                              scale: 1.15,
                                                              boxShadow: "0 8px 25px rgba(107, 114, 128, 0.3)"
                                                            }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                          >
                                                            <Button
                                                              size="sm"
                                                              variant="outline"
                                                              onClick={cancelarPreview}
                                                              className="text-gray-600 border-2 border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 transition-all duration-300 shadow-md relative overflow-hidden"
                                                              title="Cancelar"
                                                            >
                                                              <motion.div
                                                                className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent"
                                                                initial={{ x: "-100%" }}
                                                                whileHover={{ x: "100%" }}
                                                                transition={{ duration: 0.6 }}
                                                              />
                                                              <motion.div
                                                                animate={{ 
                                                                  scale: [1, 1.1, 1],
                                                                  opacity: [0.7, 1, 0.7]
                                                                }}
                                                                transition={{ 
                                                                  duration: 2, 
                                                                  repeat: Infinity, 
                                                                  ease: "easeInOut" 
                                                                }}
                                                              >
                                                                <X className="h-4 w-4 relative z-10" />
                                                              </motion.div>
                                                            </Button>
                                                          </motion.div>
                                                        </motion.div>
                                                      </TableCell>
                                                    </motion.tr>
                                                  )}
                                                </React.Fragment>
                                              );
                                            })
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={10} className="py-16">
                                              <motion.div 
                                                className="flex flex-col items-center justify-center space-y-4"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5 }}
                                              >
                                                <div className="relative">
                                                  <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-gray-200 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="h-10 w-10 text-red-400" />
                                                  </div>
                                                  <motion.div
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                  >
                                                    <EyeOff className="h-4 w-4 text-white" />
                                                  </motion.div>
                                                </div>
                                                
                                                <div className="text-center space-y-2">
                                                  <h3 className="text-lg font-semibold text-gray-900">
                                                    Nenhum registro financeiro
                                                  </h3>
                                                  <p className="text-gray-500 max-w-md">
                                                    Este aluno ainda não possui parcelas cadastradas.
                                                  </p>
                                                  <p className="text-sm text-gray-400">
                                                    Clique em "Nova Parcela" para adicionar o primeiro registro.
                                                  </p>
                                                </div>
                                              </motion.div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                  
                                  {aluno.parcelas.length > 0 && (
                                    <motion.div 
                                      className="mt-4 text-center"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-gray-800 text-white rounded-full px-4 py-2 shadow-sm border-0">
                                        <span className="text-sm font-medium">
                                          Total de {aluno.parcelas.length} parcela{aluno.parcelas.length !== 1 ? 's' : ''} cadastrada{aluno.parcelas.length !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
            
            {currentStudents.length === 0 && (
              <motion.div 
                className="flex flex-col items-center justify-center py-20 space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <motion.div 
                    className="w-32 h-32 bg-gradient-to-r from-red-100 to-gray-200 rounded-full flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0.4)',
                        '0 0 0 20px rgba(239, 68, 68, 0)',
                        '0 0 0 0 rgba(239, 68, 68, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="h-16 w-16 text-red-400" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-red-500 to-gray-800 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                  </h3>
                  <p className="text-gray-500 max-w-lg">
                    {searchTerm 
                      ? `Não encontramos alunos que correspondam à busca "${searchTerm}". Tente ajustar os termos da pesquisa.`
                      : 'Ainda não há alunos com registros financeiros cadastrados no sistema.'
                    }
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchTerm('')}
                      className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-6 py-3 rounded-lg transition-all duration-200 mt-4"
                    >
                      Limpar busca
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Controles de Paginação */}
            {filteredAlunos.length > 0 && (
              <div className="p-6 bg-gray-50 border-t space-y-4">
                {/* Contador de alunos */}
                <div className="text-sm text-gray-600 text-center">
                  Mostrando {startItem} a {endItem} de {filteredAlunos.length} alunos
                </div>
                
                {/* Indicador de página atual */}
                <div className="text-sm text-gray-500 text-center">
                  Página {currentPage} de {totalPages}
                </div>
                
                {/* Controles de navegação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    {/* Botão Anterior */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Anterior
                    </Button>
                    
                    {/* Números das páginas */}
                    <div className="flex space-x-1">
                      {visiblePages.map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] ${
                            currentPage === page 
                              ? "bg-red-600 text-white hover:bg-red-700" 
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Botão Próxima */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Próxima
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>



      {/* Modal Ver Histórico */}
      <HistoricoParcelasModal
        isOpen={isVerHistoricoModalOpen}
        onClose={() => setIsVerHistoricoModalOpen(false)}
        aluno={alunoHistorico}
      />

      {/* Modal Mover para Histórico */}
      <MoverParaHistoricoModal
        isOpen={isMoverHistoricoModalOpen}
        onClose={() => setIsMoverHistoricoModalOpen(false)}
        aluno={alunoParaArquivar}
        onSuccess={carregarDados}
      />

      {/* Modal Visualizar Plano de Pagamento */}
      <Dialog open={isVisualizarPlanoModalOpen} onOpenChange={setIsVisualizarPlanoModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-2xl">
              <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-2">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <span>Plano de Pagamento - {alunoPlanoDetalhes?.nome}</span>
            </DialogTitle>
          </DialogHeader>
          
          {alunoPlanoDetalhes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Verificar se é registro migrado */}
              {alunoPlanoDetalhes.migrado === 'sim' ? (
                <>
                  {/* Aviso para registros migrados */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-2">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-800">Registro Migrado</h3>
                        <p className="text-amber-700 mt-1">
                          Este registro foi importado de um sistema anterior e não possui informações de valor total nem número de parcelas originais. 
                          As informações disponíveis são baseadas apenas nas parcelas individuais cadastradas.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Cards por Tipo de Item - Versão simplificada para registros migrados */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Plano */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <CreditCard className="h-5 w-5" />
                          <h3 className="font-bold text-lg">Plano</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Parcelas Pagas</p>
                          <p className="text-3xl font-bold text-green-600">
                            {alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'plano' && p.status_pagamento === 'pago').length}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Material */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl border border-purple-200 shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <Calendar className="h-5 w-5" />
                          <h3 className="font-bold text-lg">Material</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Parcelas Pagas</p>
                          <p className="text-3xl font-bold text-green-600">
                            {alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'material' && p.status_pagamento === 'pago').length}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Matrícula */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <CheckCircle className="h-5 w-5" />
                          <h3 className="font-bold text-lg">Matrícula</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Parcelas Pagas</p>
                          <p className="text-3xl font-bold text-green-600">
                            {alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'matrícula' && p.status_pagamento === 'pago').length}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Resumo Final - Contadores gerais para registros migrados */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-red-50 to-gray-100 p-6 rounded-xl border border-red-200 shadow-lg"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>Resumo Geral</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Parcelas Pagas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {alunoPlanoDetalhes.parcelas.filter(p => p.status_pagamento === 'pago').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parcelas Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {alunoPlanoDetalhes.parcelas.filter(p => p.status_pagamento === 'pendente').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parcelas Vencidas</p>
                        <p className="text-2xl font-bold text-red-600">
                          {alunoPlanoDetalhes.parcelas.filter(p => p.status_pagamento === 'vencido').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor Pago</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            alunoPlanoDetalhes.parcelas
                              .filter(p => p.status_pagamento === 'pago')
                              .reduce((sum, p) => sum + p.valor, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Cards de Resumo Financeiro - Apenas para registros ativos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-red-50 to-gray-100 p-6 rounded-xl border border-red-200 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Valor Total</p>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(alunoPlanoDetalhes.valor_total)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-3">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-red-50 to-gray-100 p-6 rounded-xl border border-red-200 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total de Parcelas</p>
                          <p className="text-2xl font-bold text-gray-900">{alunoPlanoDetalhes.parcelas.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-3">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Detalhamento por Tipo de Item - Apenas para registros ativos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Plano */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <CreditCard className="h-5 w-5" />
                          <h3 className="font-bold text-lg">Plano</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor Total:</span>
                          <span className="font-bold text-blue-700">{formatCurrency(alunoPlanoDetalhes.valor_plano || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Parcelas:</span>
                          <span className="font-semibold">{alunoPlanoDetalhes.numero_parcelas_plano || alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'plano').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pagas:</span>
                          <span className="font-semibold text-green-600">{alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'plano' && p.status_pagamento === 'pago').length}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Material */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl border border-purple-200 shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <Calendar className="h-5 w-5" />
                          <h3 className="font-bold text-lg">Material</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor Total:</span>
                          <span className="font-bold text-purple-700">{formatCurrency(alunoPlanoDetalhes.valor_material || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Parcelas:</span>
                          <span className="font-semibold">{alunoPlanoDetalhes.numero_parcelas_material || alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'material').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pagas:</span>
                          <span className="font-semibold text-green-600">{alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'material' && p.status_pagamento === 'pago').length}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Matrícula */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
                        <div className="flex items-center space-x-2 text-white">
                          <CheckCircle className="h-5 w-5" />
                          <h3 className="font-bold text-lg">Matrícula</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor Total:</span>
                          <span className="font-bold text-green-700">{formatCurrency(alunoPlanoDetalhes.valor_matricula || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Parcelas:</span>
                          <span className="font-semibold">{alunoPlanoDetalhes.numero_parcelas_matricula || alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'matrícula').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pagas:</span>
                          <span className="font-semibold text-green-600">{alunoPlanoDetalhes.parcelas.filter(p => p.tipo_item === 'matrícula' && p.status_pagamento === 'pago').length}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Resumo Final - Para registros ativos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-red-50 to-gray-100 p-6 rounded-xl border border-red-200 shadow-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Parcelas Pagas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {alunoPlanoDetalhes.parcelas.filter(p => p.status_pagamento === 'pago').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parcelas Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {alunoPlanoDetalhes.parcelas.filter(p => p.status_pagamento === 'pendente').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parcelas Vencidas</p>
                        <p className="text-2xl font-bold text-red-600">
                          {alunoPlanoDetalhes.parcelas.filter(p => p.status_pagamento === 'vencido').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor Pago</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            alunoPlanoDetalhes.parcelas
                              .filter(p => p.status_pagamento === 'pago')
                              .reduce((sum, p) => sum + p.valor, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Excluir Registro */}
      <ExcluirRegistroModal
        aluno={selectedAluno}
        registroId={selectedRegistroId}
        isOpen={excluirModalOpen}
        onClose={() => {
          setExcluirModalOpen(false);
          setSelectedAluno(null);
          setSelectedRegistroId(null);
        }}
        onSuccess={() => {
          setExcluirModalOpen(false);
          setSelectedAluno(null);
          setSelectedRegistroId(null);
          if (onRefresh) {
            onRefresh();
          } else {
            carregarDados();
          }
        }}
      />

      {/* Modal Tornar Ativo */}
      <TornarAtivoModal
        isOpen={isTornarAtivoModalOpen}
        onClose={() => {
          setIsTornarAtivoModalOpen(false);
          setAlunoParaTornarAtivo(null);
        }}
        aluno={alunoParaTornarAtivo}
        onSuccess={() => {
          setIsTornarAtivoModalOpen(false);
          setAlunoParaTornarAtivo(null);
          onRefresh?.();
        }}
      />

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirmar Exclusão</span>
            </DialogTitle>
          </DialogHeader>
          {parcelaParaExcluir && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-2">
                      Atenção! Esta ação não pode ser desfeita.
                    </h3>
                    <p className="text-red-700 text-sm mb-3">
                      Você está prestes a excluir permanentemente a seguinte parcela:
                    </p>
                    <div className="bg-white rounded-md p-3 border border-red-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Parcela:</span>
                          <span className="ml-2 font-bold text-red-600">#{parcelaParaExcluir.numero}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Valor:</span>
                          <span className="ml-2 font-bold text-green-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(parcelaParaExcluir.valor)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-yellow-800 text-sm font-medium">
                    Esta ação removerá a parcela permanentemente do sistema.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={cancelarExclusao}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={() => excluirParcela(parcelaParaExcluir.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Exclusão
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>



      {/* Modal Múltiplas Parcelas */}
      <MultipleParcelasModal
        isOpen={isMultipleParcelasModalOpen}
        onClose={() => {
          setIsMultipleParcelasModalOpen(false);
          setSelectedAlunoForMultipleParcelas(null);
        }}
        registroFinanceiroId={selectedAlunoForMultipleParcelas?.registro_financeiro_id || ''}
        idiomaRegistro={selectedAlunoForMultipleParcelas?.parcelas[0]?.idioma_registro || 'Inglês'}
        onSuccess={() => {
          setIsMultipleParcelasModalOpen(false);
          setSelectedAlunoForMultipleParcelas(null);
          if (onRefresh) {
            onRefresh();
          } else {
            carregarDados();
          }
        }}
      />

      {/* Modal Criar Plano de Pagamento */}
      <FinancialPlanDialog
        isOpen={isFinancialPlanDialogOpen}
        onOpenChange={setIsFinancialPlanDialogOpen}
        selectedStudent={selectedStudentForPlan}
        onSuccess={handlePlanSuccess}
      />
    </motion.div>
  );
};

export default StudentGroupingView;