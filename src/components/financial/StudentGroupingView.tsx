import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  User, 
  Globe, 
  CreditCard, 
  Calendar, 
  BarChart3, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Receipt, 
  History, 
  Archive, 
  DollarSign, 
  FileText, 
  Smartphone, 
  Building2,
  RefreshCw,
  Users,
  X,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { criarNovaParcela } from '@/utils/parcelaNumbering';
import { useParcelas } from '@/hooks/useParcelas';
import { ExcluirRegistroModal } from './modals/ExcluirRegistroModal';
import { TornarAtivoModal } from './modals/TornarAtivoModal';
import { MultipleParcelasModal } from './MultipleParcelasModal';
import FinancialPlanDialog from './FinancialPlanDialog';

interface Aluno {
  id: string;
  nome: string;
  migrado: 'sim' | 'nao';
  plano_id?: string;
  valor_total: number;
  valor_plano?: number;
  valor_matricula?: number;
  valor_material?: number;
  desconto_total?: number;
  status_geral: string;
  data_primeiro_vencimento: string;
  forma_pagamento_plano?: string;
  forma_pagamento_material?: string;
  forma_pagamento_matricula?: string;
  numero_parcelas_plano?: number;
  numero_parcelas_material?: number;
  numero_parcelas_matricula?: number;
  plano?: {
    id: string;
    nome: string;
    valor_total: number;
  } | null;
  parcelas: Parcela[];
  registro_financeiro_id: string;
}

interface Parcela {
  id: number;
  tipo_item: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  observacoes?: string;
  forma_pagamento?: string;
  descricao_item?: string;
  idioma_registro?: string;
  registro_financeiro_id: string;
  comprovante?: string;
}

interface NovaParcela {
  registro_financeiro_id: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  status_pagamento: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  observacoes?: string;
  forma_pagamento?: string;
  descricao_item?: string;
  idioma_registro?: string;
}

interface StudentGroupingViewProps {
  onRefresh?: () => void;
}

const StudentGroupingView: React.FC<StudentGroupingViewProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const { marcarComoPago } = useParcelas();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>(['pago', 'pendente', 'vencido', 'cancelado']);
  const [tipoFilters, setTipoFilters] = useState<string[]>(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
  const [idiomaFilter, setIdiomaFilter] = useState('todos');
  const [formaPagamentoFilter, setFormaPagamentoFilter] = useState('todos');
  const [dataVencimentoInicio, setDataVencimentoInicio] = useState('');
  const [dataVencimentoFim, setDataVencimentoFim] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [tipoRegistro, setTipoRegistro] = useState<'ativos' | 'migrados'>('ativos');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [totalParcelasCarregadas, setTotalParcelasCarregadas] = useState(0);
  
  // Estados para modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novaParcela, setNovaParcela] = useState<NovaParcela | null>(null);
  const [editandoParcela, setEditandoParcela] = useState<Parcela | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [parcelaParaExcluir, setParcelaParaExcluir] = useState<{id: number, numero: number, valor: number} | null>(null);
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<string | null>(null);
  const [selectedRegistroId, setSelectedRegistroId] = useState<string | null>(null);
  const [isTornarAtivoModalOpen, setIsTornarAtivoModalOpen] = useState(false);
  const [alunoParaTornarAtivo, setAlunoParaTornarAtivo] = useState<Aluno | null>(null);
  const [isMultipleParcelasModalOpen, setIsMultipleParcelasModalOpen] = useState(false);
  const [selectedAlunoForMultipleParcelas, setSelectedAlunoForMultipleParcelas] = useState<Aluno | null>(null);
  const [isFinancialPlanDialogOpen, setIsFinancialPlanDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<any>(null);
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [alunoPlanoDetalhes, setAlunoPlanoDetalhes] = useState<Aluno | null>(null);
  const [parcelaPreview, setParcelaPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Função para aplicar cores baseadas no tipo de item
  const getItemTypeColor = (tipo: string) => {
    const colors = {
      plano: 'text-[#D90429]',
      material: 'text-blue-600',
      matrícula: 'text-green-600',
      cancelamento: 'text-orange-600',
      outros: 'text-[#6B7280]'
    };
    return colors[tipo as keyof typeof colors] || 'text-[#6B7280]';
  };

  // Função para aplicar cores baseadas no status de pagamento
  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pago: 'bg-green-100 text-green-800 border-green-200',
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      vencido: 'bg-[#D90429] bg-opacity-10 text-[#D90429] border-[#D90429] border-opacity-30',
      cancelado: 'bg-[#6B7280] bg-opacity-10 text-[#6B7280] border-[#6B7280] border-opacity-30'
    };
    return colors[status as keyof typeof colors] || 'bg-[#F9FAFB] text-[#6B7280] border-[#6B7280] border-opacity-30';
  };

  // Função para ordenar parcelas por tipo e número
  const ordenarParcelasPorTipoENumero = (parcelas: any[]) => {
    const ordemTipos = ['plano', 'material', 'matrícula', 'cancelamento', 'outros'];
    
    return parcelas.sort((a, b) => {
      const tipoA = ordemTipos.indexOf(a.tipo_item);
      const tipoB = ordemTipos.indexOf(b.tipo_item);
      
      if (tipoA !== tipoB) {
        return tipoA - tipoB;
      }
      
      return a.numero_parcela - b.numero_parcela;
    });
  };

  // Função para carregar dados
  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const migradoValue = tipoRegistro === 'migrados' ? 'sim' : 'nao';
      
      const { data: alunosData, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          id,
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
            nome
          ),
          planos (
            id,
            nome,
            valor_total
          ),
          parcelas_alunos (
            id,
            tipo_item,
            numero_parcela,
            valor,
            data_vencimento,
            data_pagamento,
            status_pagamento,
            idioma_registro,
            descricao_item,
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
        parcelas: ordenarParcelasPorTipoENumero(registro.parcelas_alunos || []),
        registro_financeiro_id: registro.id
      })) || [];

      setAlunos(alunosFormatados);
      
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

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular progresso total
  const calcularProgressoTotal = (aluno: Aluno) => {
    const totalParcelas = aluno.parcelas.length;
    const parcelasPagas = aluno.parcelas.filter(p => p.status_pagamento === 'pago').length;
    const percentual = totalParcelas > 0 ? Math.round((parcelasPagas / totalParcelas) * 100) : 0;
    
    return {
      pagas: parcelasPagas,
      total: totalParcelas,
      percentual
    };
  };

  // Função para obter forma de pagamento da parcela
  const getFormaPagamentoParcela = (parcela: Parcela, aluno: Aluno) => {
    if (parcela.forma_pagamento) {
      return parcela.forma_pagamento;
    }
    
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
  };

  // Filtros aplicados
  const alunosFiltrados = useMemo(() => {
    return alunos.filter(aluno => {
      const nomeMatch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = aluno.parcelas.some(parcela => 
        statusFilters.includes(parcela.status_pagamento)
      );
      
      const tipoMatch = aluno.parcelas.some(parcela => 
        tipoFilters.includes(parcela.tipo_item)
      );
      
      const idiomaMatch = idiomaFilter === 'todos' || 
        aluno.parcelas.some(parcela => parcela.idioma_registro === idiomaFilter);
      
      const formaPagamentoMatch = formaPagamentoFilter === 'todos' || 
        aluno.parcelas.some(parcela => {
          const formaPagamento = getFormaPagamentoParcela(parcela, aluno);
          return formaPagamento === formaPagamentoFilter;
        });
      
      const dataMatch = (!dataVencimentoInicio && !dataVencimentoFim) || 
        aluno.parcelas.some(parcela => {
          const dataVencimento = new Date(parcela.data_vencimento);
          const inicio = dataVencimentoInicio ? new Date(dataVencimentoInicio) : null;
          const fim = dataVencimentoFim ? new Date(dataVencimentoFim) : null;
          
          if (inicio && fim) {
            return dataVencimento >= inicio && dataVencimento <= fim;
          } else if (inicio) {
            return dataVencimento >= inicio;
          } else if (fim) {
            return dataVencimento <= fim;
          }
          return true;
        });
      
      return nomeMatch && statusMatch && tipoMatch && idiomaMatch && formaPagamentoMatch && dataMatch;
    });
  }, [alunos, searchTerm, statusFilters, tipoFilters, idiomaFilter, formaPagamentoFilter, dataVencimentoInicio, dataVencimentoFim]);

  // Paginação
  const totalPages = Math.ceil(alunosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const alunosPaginados = alunosFiltrados.slice(startIndex, endIndex);

  // Handlers para filtros
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setStatusFilters(prev => 
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  const handleTipoFilterChange = (tipo: string, checked: boolean) => {
    setTipoFilters(prev => 
      checked ? [...prev, tipo] : prev.filter(t => t !== tipo)
    );
  };

  const handleIdiomaChange = (value: string) => {
    setIdiomaFilter(value);
  };

  const handleFormaPagamentoChange = (value: string) => {
    setFormaPagamentoFilter(value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilters(['pago', 'pendente', 'vencido', 'cancelado']);
    setTipoFilters(['plano', 'material', 'matrícula', 'cancelamento', 'outros']);
    setIdiomaFilter('todos');
    setFormaPagamentoFilter('todos');
    setDataVencimentoInicio('');
    setDataVencimentoFim('');
  };

  const toggleRowExpansion = (alunoId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alunoId)) {
        newSet.delete(alunoId);
      } else {
        newSet.add(alunoId);
      }
      return newSet;
    });
  };

  // Função para abrir modal de criar parcela
  const abrirModalCriarParcela = (alunoId: string, alunoNome: string, registroFinanceiroId: string, tipo: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros') => {
    const aluno = alunos.find(a => a.id === alunoId);
    const proximoNumero = aluno ? Math.max(...aluno.parcelas.filter(p => p.tipo_item === tipo).map(p => p.numero_parcela), 0) + 1 : 1;
    const idiomaRegistro = aluno?.parcelas[0]?.idioma_registro || 'Inglês';
    
    setNovaParcela({
      registro_financeiro_id: registroFinanceiroId,
      tipo_item: tipo,
      numero_parcela: proximoNumero,
      valor: 0,
      data_vencimento: '',
      status_pagamento: 'pendente',
      idioma_registro: idiomaRegistro
    });
    setIsCreateModalOpen(true);
  };

  // Função para abrir modal de editar parcela
  const abrirModalEditarParcela = (parcela: Parcela) => {
    setEditandoParcela(parcela);
    setIsEditModalOpen(true);
  };

  // Função para abrir confirmação de exclusão
  const abrirConfirmacaoExclusao = (parcela: Parcela) => {
    setParcelaParaExcluir({
      id: parcela.id,
      numero: parcela.numero_parcela,
      valor: parcela.valor
    });
    setIsConfirmDeleteModalOpen(true);
  };

  // Função para abrir modal de excluir registro
  const abrirModalExcluirRegistro = (alunoId: string, alunoNome: string, registroId: string) => {
    setSelectedAluno(alunoNome);
    setSelectedRegistroId(registroId);
    setExcluirModalOpen(true);
  };

  // Função para abrir modal de tornar ativo
  const abrirModalTornarAtivo = (aluno: Aluno) => {
    setAlunoParaTornarAtivo(aluno);
    setIsTornarAtivoModalOpen(true);
  };

  // Função para abrir modal de múltiplas parcelas
  const abrirModalMultiplasParcelas = (aluno: Aluno) => {
    setSelectedAlunoForMultipleParcelas(aluno);
    setIsMultipleParcelasModalOpen(true);
  };

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

  // Função para excluir parcela
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

  // Função para verificar se registro está arquivado
  const isRegistroArquivado = (aluno: Aluno) => {
    return aluno.parcelas.length === 0;
  };

  // Função para obter ícone do tipo
  const getTipoIcon = (tipo: string) => {
    const icons = {
      plano: <CreditCard className="h-4 w-4" />,
      material: <Calendar className="h-4 w-4" />,
      matrícula: <CheckCircle className="h-4 w-4" />,
      cancelamento: <XCircle className="h-4 w-4" />,
      outros: <FileText className="h-4 w-4" />
    };
    return icons[tipo as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  // Função para lidar com cliques em botões
  const handleButtonClick = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  // Função para abrir modal de visualizar plano
  const abrirModalVisualizarPlano = (aluno: Aluno) => {
    setAlunoPlanoDetalhes(aluno);
    setIsPlanoModalOpen(true);
  };

  // Função para criar plano para estudante
  const handleCreatePlanForStudent = (aluno: Aluno) => {
    setSelectedStudentForPlan({
      id: aluno.id,
      nome: aluno.nome
    });
    setIsFinancialPlanDialogOpen(true);
  };

  // Função para criar plano
  const handleCreatePlan = () => {
    setIsFinancialPlanDialogOpen(true);
  };

  // Função para sucesso do plano
  const handlePlanSuccess = () => {
    setIsFinancialPlanDialogOpen(false);
    setSelectedStudentForPlan(null);
    carregarDados();
  };

  // Função para abrir modal de ver histórico
  const abrirModalVerHistorico = (alunoId: string, alunoNome: string) => {
    // Implementar lógica do histórico
    console.log('Ver histórico para:', alunoNome);
  };

  // Função para abrir modal de mover para histórico
  const abrirModalMoverParaHistorico = (alunoId: string, alunoNome: string, parcelas: Parcela[]) => {
    // Implementar lógica de mover para histórico
    console.log('Mover para histórico:', alunoNome);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        className="space-y-6 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header com estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-[#F9FAFB]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-[#D90429] rounded-full p-3">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-[#1F2937]">
                      {tipoRegistro === 'ativos' ? 'Registros Ativos' : 'Registros Migrados'}
                    </CardTitle>
                    <p className="text-[#6B7280] mt-1">
                      Gestão financeira de alunos
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  className="grid grid-cols-2 gap-6 text-center"
                  initial={{ x: 20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div>
                    <div className="text-3xl font-bold text-[#D90429]">
                      {alunosFiltrados.length}
                    </div>
                    <p className="text-sm text-[#6B7280] font-medium">
                      Alunos {tipoRegistro === 'ativos' ? 'Ativos' : 'Migrados'}
                    </p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1F2937]">
                      {totalParcelasCarregadas}
                    </div>
                    <p className="text-sm text-[#6B7280] font-medium">
                      Total de Parcelas
                    </p>
                  </div>
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Record Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-[#6B7280] bg-opacity-10 p-1 rounded-lg flex shadow-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTipoRegistro('ativos')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                tipoRegistro === 'ativos'
                  ? 'bg-[#F9FAFB] text-[#D90429] shadow-md'
                  : 'text-[#6B7280] hover:text-[#1F2937]'
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
                  ? 'bg-[#F9FAFB] text-orange-600 shadow-md'
                  : 'text-[#6B7280] hover:text-[#1F2937]'
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
          <Card className="shadow-lg border-0 bg-[#F9FAFB]">
            <CardHeader 
              className="pb-4 cursor-pointer"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            >
              <CardTitle className="flex items-center justify-between text-[#D90429]">
                <div className="flex items-center gap-3">
                  <Filter className="h-6 w-6" />
                  Filtros Avançados
                </div>
                <div className="flex items-center gap-4">
                  {tipoRegistro === 'ativos' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleCreatePlan}
                        size="sm"
                        className="bg-[#D90429] hover:bg-[#1F2937] text-white border-0 shadow-md transition-all duration-300"
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
                      <Label htmlFor="search" className="text-sm font-medium text-[#6B7280] mb-2 block">
                        Buscar por nome do aluno
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] h-4 w-4" />
                        <Input
                          id="search"
                          type="text"
                          placeholder="Digite o nome do aluno..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                        />
                      </div>
                    </div>

                    {/* Status Filters */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium text-[#6B7280] mb-3 block">
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
                                  : 'bg-[#F9FAFB] border-[#6B7280] border-opacity-20 text-[#6B7280] hover:border-[#6B7280] hover:border-opacity-30'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{label}</span>
                            </motion.button>
                          );
                        })}
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
                          className="text-[#D90429] border-[#D90429] border-opacity-30 hover:bg-[#D90429] hover:bg-opacity-10 hover:border-[#D90429] transition-colors"
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

        {/* Tabela */}
        <motion.div 
          className="bg-[#F9FAFB] rounded-xl border border-[#6B7280] border-opacity-20 overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-[#D90429] hover:bg-[#1F2937]">
                <TableHead className="font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nome do Aluno</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Idioma</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Status das Parcelas</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Primeiro Vencimento</span>
                  </div>
                </TableHead>
                {tipoRegistro === 'ativos' && (
                  <TableHead className="font-semibold text-white">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Progresso</span>
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunosPaginados.map((aluno, index) => {
                const isExpanded = expandedRows.has(aluno.id);
                const shouldShowPreview = parcelaPreview && 
                                         parcelaPreview.registro_financeiro_id === aluno.registro_financeiro_id && 
                                         aluno.migrado === 'sim';
                
                return (
                  <React.Fragment key={aluno.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-[#F9FAFB] hover:bg-opacity-50 cursor-pointer transition-colors"
                      onClick={() => toggleRowExpansion(aluno.id)}
                    >
                      <TableCell className="font-medium text-base py-4">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                          </motion.div>
                          <span className="font-semibold text-[#1F2937]">{aluno.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-base py-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {aluno.parcelas[0]?.idioma_registro || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-base py-4">
                        <div className="flex flex-wrap gap-2">
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
                                <Badge className="bg-[#D90429] bg-opacity-10 text-[#D90429] text-xs border border-[#D90429] border-opacity-30 flex items-center gap-1 px-1 py-0.5 min-w-[30px] justify-center cursor-help">
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
                                <Badge className="bg-[#6B7280] bg-opacity-10 text-[#6B7280] text-xs border border-[#6B7280] border-opacity-30 flex items-center gap-1 px-1 py-0.5 min-w-[30px] justify-center cursor-help">
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
                        <span className="font-semibold text-[#6B7280]">{formatDate(aluno.data_primeiro_vencimento)}</span>
                      </TableCell>
                      {tipoRegistro === 'ativos' && (
                        <TableCell className="text-base py-4">
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            {(() => {
                              const progresso = calcularProgressoTotal(aluno);
                              return (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-[#1F2937]">
                                      {progresso.pagas}/{progresso.total}
                                    </span>
                                    <span className="text-xs text-[#6B7280]">
                                      {progresso.percentual}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#6B7280] bg-opacity-20 rounded-full h-5">
                                    <div 
                                      className="h-5 rounded-full transition-all duration-300 bg-[#D90429]"
                                      style={{ width: `${progresso.percentual}%` }}
                                    ></div>
                                  </div>
                                </>
                              );
                            })()} 
                          </div>
                        </TableCell>
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
                              className="bg-[#F9FAFB] p-6 border-l-4 border-[#D90429]"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-[#D90429] rounded-full p-2">
                                    <Eye className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xl text-[#1F2937]">
                                      Parcelas de {aluno.nome}
                                    </h4>
                                    <p className="text-[#6B7280]">Detalhamento completo dos registros financeiros</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleButtonClick(() => abrirModalVisualizarPlano(aluno), e)}
                                    className="bg-[#D90429] hover:bg-[#1F2937] hover:shadow-lg text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
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
                                        className="bg-[#D90429] hover:bg-[#1F2937] hover:shadow-lg text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                      >
                                        <History className="h-4 w-4" />
                                        <span>Ver Histórico</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleButtonClick(() => abrirModalMoverParaHistorico(aluno.id, aluno.nome, aluno.parcelas), e)}
                                        className="bg-[#D90429] hover:bg-[#1F2937] hover:shadow-lg text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                      >
                                        <Archive className="h-4 w-4" />
                                        <span>Mover para Histórico</span>
                                      </motion.button>
                                    </>
                                  ) : null}
                                  
                                  {/* Botão Excluir Registro */}
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => handleButtonClick(() => abrirModalExcluirRegistro(aluno.id, aluno.nome, aluno.registro_financeiro_id), e)}
                                    className="bg-[#D90429] hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg border border-[#D90429]"
                                    title="Excluir registro financeiro permanentemente"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Excluir Registro</span>
                                  </motion.button>
                                </div>
                              </div>
                              
                              {/* Renderização condicional baseada no status arquivado */}
                              {isRegistroArquivado(aluno) ? (
                                <div className="rounded-xl border border-[#6B7280] border-opacity-20 overflow-hidden shadow-lg bg-[#F9FAFB] p-8">
                                  <div className="text-center">
                                    <div className="flex justify-center mb-4">
                                      <Archive className="h-16 w-16 text-[#6B7280]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#6B7280] mb-2">
                                      Nenhum Registro Financeiro Ativo
                                    </h3>
                                    <p className="text-[#6B7280] mb-6">
                                      Este aluno não possui registros financeiros ativos no momento.
                                    </p>
                                    <motion.button
                                       whileHover={{ scale: 1.05 }}
                                       whileTap={{ scale: 0.95 }}
                                       onClick={() => handleCreatePlanForStudent(aluno)}
                                       className="bg-[#D90429] hover:bg-[#1F2937] text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                     >
                                       <Plus className="h-5 w-5" />
                                       <span>Criar Plano Financeiro</span>
                                     </motion.button>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="rounded-xl border border-[#6B7280] border-opacity-20 overflow-hidden shadow-lg bg-[#F9FAFB]">
                                   <Table>
                                     <TableHeader>
                                       <TableRow className="bg-[#D90429] hover:bg-[#1F2937]">
                                         <TableHead className="font-semibold text-white">
                                           <div className="flex items-center space-x-2">
                                             <FileText className="h-4 w-4" />
                                             <span>Tipo</span>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-semibold text-white">
                                           <div className="flex items-center space-x-2">
                                             <span>#</span>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-semibold text-white">
                                           <div className="flex items-center space-x-2">
                                             <DollarSign className="h-4 w-4" />
                                             <span>Valor</span>
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
                                             <CheckCircle className="h-4 w-4" />
                                             <span>Status</span>
                                           </div>
                                         </TableHead>
                                         <TableHead className="font-semibold text-white">
                                           <div className="flex items-center space-x-2">
                                             <CreditCard className="h-4 w-4" />
                                             <span>Forma de Pagamento</span>
                                           </div>
                                         </TableHead>
                                         {tipoRegistro === 'ativos' && (
                                           <TableHead className="font-semibold text-white">
                                             <div className="flex items-center space-x-2">
                                               <span>Ações</span>
                                             </div>
                                           </TableHead>
                                         )}
                                       </TableRow>
                                     </TableHeader>
                                     <TableBody>
                                       {aluno.parcelas.map((parcela, parcelaIndex) => (
                                         <motion.tr
                                           key={parcela.id}
                                           initial={{ opacity: 0, x: -20 }}
                                           animate={{ opacity: 1, x: 0 }}
                                           transition={{ duration: 0.3, delay: parcelaIndex * 0.05 }}
                                           className="hover:bg-[#F9FAFB] hover:bg-opacity-50 transition-colors"
                                         >
                                           <TableCell className="py-3">
                                             <div className="flex items-center space-x-2">
                                               <div className={getItemTypeColor(parcela.tipo_item)}>
                                                 {getTipoIcon(parcela.tipo_item)}
                                               </div>
                                               <span className={`font-medium capitalize ${getItemTypeColor(parcela.tipo_item)}`}>
                                                 {parcela.tipo_item}
                                               </span>
                                             </div>
                                           </TableCell>
                                           <TableCell className="py-3">
                                             <Badge className="bg-[#6B7280] bg-opacity-10 text-[#6B7280] border-[#6B7280] border-opacity-30">
                                               {parcela.numero_parcela}
                                             </Badge>
                                           </TableCell>
                                           <TableCell className="py-3">
                                             <span className="font-semibold text-[#1F2937]">
                                               {formatCurrency(parcela.valor)}
                                             </span>
                                           </TableCell>
                                           <TableCell className="py-3">
                                             <span className="text-[#6B7280]">
                                               {formatDate(parcela.data_vencimento)}
                                             </span>
                                           </TableCell>
                                           <TableCell className="py-3">
                                             <Badge className={getPaymentStatusColor(parcela.status_pagamento)}>
                                               {parcela.status_pagamento === 'pago' && <CheckCircle className="h-3 w-3 mr-1" />}
                                               {parcela.status_pagamento === 'pendente' && <Clock className="h-3 w-3 mr-1" />}
                                               {parcela.status_pagamento === 'vencido' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                               {parcela.status_pagamento === 'cancelado' && <XCircle className="h-3 w-3 mr-1" />}
                                               <span className="capitalize font-medium">{parcela.status_pagamento}</span>
                                             </Badge>
                                           </TableCell>
                                           <TableCell className="py-3">
                                             <div className="flex items-center space-x-2">
                                               {getFormaPagamentoParcela(parcela, aluno) === 'pix' && <Smartphone className="h-4 w-4 text-green-600" />}
                                               {getFormaPagamentoParcela(parcela, aluno) === 'cartao' && <CreditCard className="h-4 w-4 text-blue-600" />}
                                               {getFormaPagamentoParcela(parcela, aluno) === 'boleto' && <FileText className="h-4 w-4 text-orange-600" />}
                                               {getFormaPagamentoParcela(parcela, aluno) === 'dinheiro' && <DollarSign className="h-4 w-4 text-green-600" />}
                                               <span className="text-[#6B7280] capitalize">
                                                 {getFormaPagamentoParcela(parcela, aluno)}
                                               </span>
                                             </div>
                                           </TableCell>
                                           {tipoRegistro === 'ativos' && (
                                             <TableCell className="py-3">
                                               <div className="flex items-center space-x-2">
                                                 {parcela.status_pagamento !== 'pago' && (
                                                   <Tooltip>
                                                     <TooltipTrigger asChild>
                                                       <motion.button
                                                         whileHover={{ scale: 1.1 }}
                                                         whileTap={{ scale: 0.9 }}
                                                         onClick={(e) => {
                                                           e.stopPropagation();
                                                           marcarComoPago(parcela.id, carregarDados, toast);
                                                         }}
                                                         className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                       >
                                                         <CheckCircle className="h-4 w-4" />
                                                       </motion.button>
                                                     </TooltipTrigger>
                                                     <TooltipContent>
                                                       <p>Marcar como Pago</p>
                                                     </TooltipContent>
                                                   </Tooltip>
                                                 )}
                                                 
                                                 <Tooltip>
                                                   <TooltipTrigger asChild>
                                                     <motion.button
                                                       whileHover={{ scale: 1.1 }}
                                                       whileTap={{ scale: 0.9 }}
                                                       onClick={(e) => handleButtonClick(() => abrirModalEditarParcela(parcela), e)}
                                                       className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                     >
                                                       <Edit className="h-4 w-4" />
                                                     </motion.button>
                                                   </TooltipTrigger>
                                                   <TooltipContent>
                                                     <p>Editar Parcela</p>
                                                   </TooltipContent>
                                                 </Tooltip>
                                                 
                                                 <Tooltip>
                                                   <TooltipTrigger asChild>
                                                     <motion.button
                                                       whileHover={{ scale: 1.1 }}
                                                       whileTap={{ scale: 0.9 }}
                                                       onClick={(e) => handleButtonClick(() => abrirConfirmacaoExclusao(parcela), e)}
                                                       className="p-2 rounded-lg bg-[#D90429] bg-opacity-10 text-[#D90429] hover:bg-[#D90429] hover:bg-opacity-20 transition-colors"
                                                     >
                                                       <Trash2 className="h-4 w-4" />
                                                     </motion.button>
                                                   </TooltipTrigger>
                                                   <TooltipContent>
                                                     <p>Excluir Parcela</p>
                                                   </TooltipContent>
                                                 </Tooltip>
                                               </div>
                                             </TableCell>
                                           )}
                                         </motion.tr>
                                       ))}
                                     </TableBody>
                                   </Table>
                                   
                                   {/* Botões de ação para adicionar parcelas */}
                                   {tipoRegistro === 'ativos' && (
                                     <div className="p-6 bg-[#F9FAFB] border-t border-[#6B7280] border-opacity-20">
                                       <div className="flex flex-wrap gap-3">
                                         {['plano', 'material', 'matrícula', 'cancelamento', 'outros'].map((tipo) => (
                                           <motion.button
                                             key={tipo}
                                             whileHover={{ scale: 1.05 }}
                                             whileTap={{ scale: 0.95 }}
                                             onClick={() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id, tipo as any)}
                                             className="bg-[#D90429] hover:bg-[#1F2937] text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                                           >
                                             {getTipoIcon(tipo)}
                                             <span className="capitalize">+ {tipo}</span>
                                           </motion.button>
                                         ))}
                                         
                                         <motion.button
                                           whileHover={{ scale: 1.05 }}
                                           whileTap={{ scale: 0.95 }}
                                           onClick={() => abrirModalMultiplasParcelas(aluno)}
                                           className="bg-[#D90429] hover:bg-[#1F2937] text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                                         >
                                           <Plus className="h-4 w-4" />
                                           <span>Múltiplas Parcelas</span>
                                         </motion.button>
                                       </div>
                                     </div>
                                   )}
                                   
                                   {/* Botão para tornar ativo (apenas para registros migrados) */}
                                   {aluno.migrado === 'sim' && (
                                     <div className="p-6 bg-[#F9FAFB] border-t border-[#6B7280] border-opacity-20">
                                       <motion.button
                                         whileHover={{ scale: 1.05 }}
                                         whileTap={{ scale: 0.95 }}
                                         onClick={() => abrirModalTornarAtivo(aluno)}
                                         className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                       >
                                         <CheckCircle className="h-5 w-5" />
                                         <span>Tornar Ativo</span>
                                       </motion.button>
                                     </div>
                                   )}
                                 </div>
                               )}
                             </motion.div>
                           </TableCell>
                         </motion.tr>
                       )}
                     </AnimatePresence>
                   </React.Fragment>
                 );
               })}
             </TableBody>
           </Table>
         </motion.div>

         {/* Paginação */}
         {totalPages > 1 && (
           <motion.div 
             className="flex justify-center items-center space-x-4 mt-6"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
           >
             <Button
               variant="outline"
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="text-[#D90429] border-[#D90429] border-opacity-30 hover:bg-[#D90429] hover:bg-opacity-10 hover:border-[#D90429]"
             >
               Anterior
             </Button>
             
             <div className="flex items-center space-x-2">
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                 return (
                   <Button
                     key={pageNumber}
                     variant={currentPage === pageNumber ? "default" : "outline"}
                     onClick={() => setCurrentPage(pageNumber)}
                     className={currentPage === pageNumber 
                       ? "bg-[#D90429] text-white" 
                       : "text-[#D90429] border-[#D90429] border-opacity-30 hover:bg-[#D90429] hover:bg-opacity-10 hover:border-[#D90429]"
                     }
                   >
                     {pageNumber}
                   </Button>
                 );
               })}
             </div>
             
             <Button
               variant="outline"
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="text-[#D90429] border-[#D90429] border-opacity-30 hover:bg-[#D90429] hover:bg-opacity-10 hover:border-[#D90429]"
             >
               Próxima
             </Button>
           </motion.div>
         )}

         {/* Modais */}
         {/* Modal de Criar Parcela */}
         <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle className="text-[#1F2937]">Criar Nova Parcela</DialogTitle>
             </DialogHeader>
             {novaParcela && (
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="tipo" className="text-[#6B7280]">Tipo de Item</Label>
                   <Select
                     value={novaParcela.tipo_item}
                     onValueChange={(value) => setNovaParcela({...novaParcela, tipo_item: value as any})}
                   >
                     <SelectTrigger className="border-[#6B7280] border-opacity-30 focus:border-[#D90429]">
                       <SelectValue />
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
                   <Label htmlFor="valor" className="text-[#6B7280]">Valor</Label>
                   <Input
                     id="valor"
                     type="number"
                     step="0.01"
                     value={novaParcela.valor}
                     onChange={(e) => setNovaParcela({...novaParcela, valor: parseFloat(e.target.value) || 0})}
                     className="border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                   />
                 </div>
                 
                 <div>
                   <Label htmlFor="data_vencimento" className="text-[#6B7280]">Data de Vencimento</Label>
                   <Input
                     id="data_vencimento"
                     type="date"
                     value={novaParcela.data_vencimento}
                     onChange={(e) => setNovaParcela({...novaParcela, data_vencimento: e.target.value})}
                     className="border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                   />
                 </div>
                 
                 <div>
                   <Label htmlFor="descricao" className="text-[#6B7280]">Descrição (Opcional)</Label>
                   <Input
                     id="descricao"
                     value={novaParcela.descricao_item || ''}
                     onChange={(e) => setNovaParcela({...novaParcela, descricao_item: e.target.value})}
                     className="border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                   />
                 </div>
                 
                 <div className="flex justify-end space-x-3 pt-4">
                   <Button
                     variant="outline"
                     onClick={() => setIsCreateModalOpen(false)}
                     className="text-[#6B7280] border-[#6B7280] border-opacity-30 hover:bg-[#6B7280] hover:bg-opacity-10"
                   >
                     Cancelar
                   </Button>
                   <Button
                     onClick={criarParcela}
                     className="bg-[#D90429] hover:bg-[#1F2937] text-white"
                   >
                     Criar Parcela
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Modal de Editar Parcela */}
         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle className="text-[#1F2937]">Editar Parcela</DialogTitle>
             </DialogHeader>
             {editandoParcela && (
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="edit_valor" className="text-[#6B7280]">Valor</Label>
                   <Input
                     id="edit_valor"
                     type="number"
                     step="0.01"
                     value={editandoParcela.valor}
                     onChange={(e) => setEditandoParcela({...editandoParcela, valor: parseFloat(e.target.value) || 0})}
                     className="border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                   />
                 </div>
                 
                 <div>
                   <Label htmlFor="edit_data_vencimento" className="text-[#6B7280]">Data de Vencimento</Label>
                   <Input
                     id="edit_data_vencimento"
                     type="date"
                     value={editandoParcela.data_vencimento.split('T')[0]}
                     onChange={(e) => setEditandoParcela({...editandoParcela, data_vencimento: e.target.value})}
                     className="border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                   />
                 </div>
                 
                 <div>
                   <Label htmlFor="edit_status" className="text-[#6B7280]">Status</Label>
                   <Select
                     value={editandoParcela.status_pagamento}
                     onValueChange={(value) => setEditandoParcela({...editandoParcela, status_pagamento: value as any})}
                   >
                     <SelectTrigger className="border-[#6B7280] border-opacity-30 focus:border-[#D90429]">
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
                   <Label htmlFor="edit_observacoes" className="text-[#6B7280]">Observações</Label>
                   <Input
                     id="edit_observacoes"
                     value={editandoParcela.observacoes || ''}
                     onChange={(e) => setEditandoParcela({...editandoParcela, observacoes: e.target.value})}
                     className="border-[#6B7280] border-opacity-30 focus:border-[#D90429] focus:ring-[#D90429]"
                   />
                 </div>
                 
                 <div className="flex justify-end space-x-3 pt-4">
                   <Button
                     variant="outline"
                     onClick={() => setIsEditModalOpen(false)}
                     className="text-[#6B7280] border-[#6B7280] border-opacity-30 hover:bg-[#6B7280] hover:bg-opacity-10"
                   >
                     Cancelar
                   </Button>
                   <Button
                     onClick={salvarEdicaoParcela}
                     className="bg-[#D90429] hover:bg-[#1F2937] text-white"
                   >
                     Salvar Alterações
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Modal de Confirmação de Exclusão */}
         <Dialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle className="text-[#D90429]">Confirmar Exclusão</DialogTitle>
             </DialogHeader>
             {parcelaParaExcluir && (
               <div className="space-y-4">
                 <p className="text-[#6B7280]">
                   Tem certeza que deseja excluir a parcela #{parcelaParaExcluir.numero} no valor de {formatCurrency(parcelaParaExcluir.valor)}?
                 </p>
                 <p className="text-sm text-[#D90429] font-medium">
                   Esta ação não pode ser desfeita.
                 </p>
                 
                 <div className="flex justify-end space-x-3 pt-4">
                   <Button
                     variant="outline"
                     onClick={cancelarExclusao}
                     className="text-[#6B7280] border-[#6B7280] border-opacity-30 hover:bg-[#6B7280] hover:bg-opacity-10"
                   >
                     Cancelar
                   </Button>
                   <Button
                     onClick={() => excluirParcela(parcelaParaExcluir.id)}
                     className="bg-[#D90429] hover:bg-red-800 text-white"
                   >
                     Excluir Parcela
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Modal de Visualizar Plano */}
         <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
           <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle className="text-[#1F2937] flex items-center space-x-2">
                 <Receipt className="h-5 w-5 text-[#D90429]" />
                 <span>Plano de Pagamento - {alunoPlanoDetalhes?.nome}</span>
               </DialogTitle>
             </DialogHeader>
             {alunoPlanoDetalhes && (
               <div className="space-y-6">
                 {/* Informações do Plano */}
                 <div className="grid grid-cols-2 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                   <div>
                     <Label className="text-[#6B7280] text-sm">Plano Selecionado</Label>
                     <p className="font-semibold text-[#1F2937]">{alunoPlanoDetalhes.plano?.nome || 'N/A'}</p>
                   </div>
                   <div>
                     <Label className="text-[#6B7280] text-sm">Valor Total</Label>
                     <p className="font-semibold text-[#1F2937]">{formatCurrency(alunoPlanoDetalhes.valor_total)}</p>
                   </div>
                   <div>
                     <Label className="text-[#6B7280] text-sm">Primeiro Vencimento</Label>
                     <p className="font-semibold text-[#1F2937]">{formatDate(alunoPlanoDetalhes.data_primeiro_vencimento)}</p>
                   </div>
                   <div>
                     <Label className="text-[#6B7280] text-sm">Status Geral</Label>
                     <Badge className={getPaymentStatusColor(alunoPlanoDetalhes.status_geral)}>
                       {alunoPlanoDetalhes.status_geral}
                     </Badge>
                   </div>
                 </div>

                 {/* Detalhamento por Tipo */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {alunoPlanoDetalhes.valor_plano && (
                     <div className="p-4 border border-[#6B7280] border-opacity-20 rounded-lg">
                       <h4 className="font-semibold text-[#D90429] mb-2">Plano</h4>
                       <p className="text-[#6B7280] text-sm">Valor: {formatCurrency(alunoPlanoDetalhes.valor_plano)}</p>
                       <p className="text-[#6B7280] text-sm">Parcelas: {alunoPlanoDetalhes.numero_parcelas_plano || 1}</p>
                       <p className="text-[#6B7280] text-sm">Forma: {alunoPlanoDetalhes.forma_pagamento_plano || 'boleto'}</p>
                     </div>
                   )}
                   
                   {alunoPlanoDetalhes.valor_material && (
                     <div className="p-4 border border-[#6B7280] border-opacity-20 rounded-lg">
                       <h4 className="font-semibold text-blue-600 mb-2">Material</h4>
                       <p className="text-[#6B7280] text-sm">Valor: {formatCurrency(alunoPlanoDetalhes.valor_material)}</p>
                       <p className="text-[#6B7280] text-sm">Parcelas: {alunoPlanoDetalhes.numero_parcelas_material || 1}</p>
                       <p className="text-[#6B7280] text-sm">Forma: {alunoPlanoDetalhes.forma_pagamento_material || 'boleto'}</p>
                     </div>
                   )}
                   
                   {alunoPlanoDetalhes.valor_matricula && (
                     <div className="p-4 border border-[#6B7280] border-opacity-20 rounded-lg">
                       <h4 className="font-semibold text-green-600 mb-2">Matrícula</h4>
                       <p className="text-[#6B7280] text-sm">Valor: {formatCurrency(alunoPlanoDetalhes.valor_matricula)}</p>
                       <p className="text-[#6B7280] text-sm">Parcelas: {alunoPlanoDetalhes.numero_parcelas_matricula || 1}</p>
                       <p className="text-[#6B7280] text-sm">Forma: {alunoPlanoDetalhes.forma_pagamento_matricula || 'boleto'}</p>
                     </div>
                   )}
                 </div>

                 {/* Tabela de Parcelas */}
                 <div className="border border-[#6B7280] border-opacity-20 rounded-lg overflow-hidden">
                   <Table>
                     <TableHeader>
                       <TableRow className="bg-[#D90429]">
                         <TableHead className="text-white">Tipo</TableHead>
                         <TableHead className="text-white">#</TableHead>
                         <TableHead className="text-white">Valor</TableHead>
                         <TableHead className="text-white">Vencimento</TableHead>
                         <TableHead className="text-white">Status</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {alunoPlanoDetalhes.parcelas.map((parcela) => (
                         <TableRow key={parcela.id}>
                           <TableCell>
                             <div className="flex items-center space-x-2">
                               <div className={getItemTypeColor(parcela.tipo_item)}>
                                 {getTipoIcon(parcela.tipo_item)}
                               </div>
                               <span className={`capitalize ${getItemTypeColor(parcela.tipo_item)}`}>
                                 {parcela.tipo_item}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell>{parcela.numero_parcela}</TableCell>
                           <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                           <TableCell>{formatDate(parcela.data_vencimento)}</TableCell>
                           <TableCell>
                             <Badge className={getPaymentStatusColor(parcela.status_pagamento)}>
                               {parcela.status_pagamento}
                             </Badge>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Outros Modais */}
         <ExcluirRegistroModal
           isOpen={excluirModalOpen}
           onClose={() => setExcluirModalOpen(false)}
           alunoNome={selectedAluno}
           registroId={selectedRegistroId}
           onSuccess={carregarDados}
         />

         <TornarAtivoModal
           isOpen={isTornarAtivoModalOpen}
           onClose={() => setIsTornarAtivoModalOpen(false)}
           aluno={alunoParaTornarAtivo}
           onSuccess={carregarDados}
         />

         <MultipleParcelasModal
           isOpen={isMultipleParcelasModalOpen}
           onClose={() => setIsMultipleParcelasModalOpen(false)}
           aluno={selectedAlunoForMultipleParcelas}
           onSuccess={carregarDados}
         />

         <FinancialPlanDialog
           isOpen={isFinancialPlanDialogOpen}
           onClose={() => setIsFinancialPlanDialogOpen(false)}
           selectedStudent={selectedStudentForPlan}
           onSuccess={handlePlanSuccess}
         />
       </motion.div>
     </TooltipProvider>
   );
 };

 export default StudentGroupingView;