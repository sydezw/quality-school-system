import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Search, Plus, Edit, Trash2, Users, AlertCircle, DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, RefreshCw, Filter, Eye, EyeOff, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Archive, History, Receipt, Banknote, Smartphone, Building2, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MoverParaHistoricoModal } from './modals/MoverParaHistoricoModal';
import { HistoricoParcelasModal } from './modals/HistoricoParcelasModal';
import { ExcluirRegistroModal } from './modals/ExcluirRegistroModal';
import FinancialPlanDialog from './FinancialPlanDialog';

interface AlunoFinanceiro {
  id: string;
  nome: string;
  // Dados do financeiro_alunos
  valor_total: number;
  valor_plano: number;
  valor_material: number;
  valor_matricula: number;
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
}

interface ParcelaAluno {
  id: number;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  tipo_item: 'plano' | 'material' | 'matrícula';
  comprovante?: string;
  observacoes?: string | null;
  forma_pagamento?: string;
}

interface NovaParcelaForm {
  registro_financeiro_id: string;
  tipo_item: 'plano' | 'material' | 'matrícula';
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  observacoes?: string;
  forma_pagamento?: string;
}

interface StudentGroupingViewProps {
  alunosFinanceiros?: AlunoFinanceiro[];
  onRefresh?: () => void;
}

const StudentGroupingView = ({ alunosFinanceiros, onRefresh }: StudentGroupingViewProps = {}) => {
  const [alunos, setAlunos] = useState<AlunoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<{id: string, nome: string} | null>(null);
  const [selectedRegistroId, setSelectedRegistroId] = useState<string | null>(null);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para filtrar alunos
  const filteredAlunos = useMemo(() => {
    return alunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alunos, searchTerm]);

  // Função para formatar moeda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Função para formatar data
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  // Função para ícones de tipo
  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'plano':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'material':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'matrícula':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  }, []);

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
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-colors';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
    }
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

  // Função para abrir modal de criar parcela
  const abrirModalCriarParcela = useCallback((alunoId: string, nomeAluno: string, registroFinanceiroId: string) => {
    setNovaParcela({
      registro_financeiro_id: registroFinanceiroId,
      tipo_item: 'plano',
      numero_parcela: 1,
      valor: 0,
      data_vencimento: '',
      observacoes: '',
      forma_pagamento: 'boleto'
    });
    setIsCreateModalOpen(true);
  }, []);

  // Função para abrir modal de editar parcela
  const abrirModalEditarParcela = useCallback((parcela: ParcelaAluno) => {
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



  // Função para carregar dados
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Buscar dados consolidados de financeiro_alunos
      const { data: financialData, error: financialError } = await supabase
        .from('financeiro_alunos')
        .select(`
          id,
          aluno_id,
          valor_total,
          valor_plano,
          valor_material,
          valor_matricula,
          status_geral,
          data_primeiro_vencimento,
          numero_parcelas_plano,
          numero_parcelas_material,
          numero_parcelas_matricula,
          forma_pagamento_plano,
          forma_pagamento_material,
          forma_pagamento_matricula,
          alunos!inner(id, nome)
        `)
        .eq('alunos.status', 'Ativo');

      if (financialError) throw financialError;

      // 2. Buscar todas as parcelas relacionadas
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('parcelas_alunos')
        .select('*, observacoes');

      if (parcelasError) throw parcelasError;

      // 3. Agrupar dados por aluno
      const alunosFinanceiros: AlunoFinanceiro[] = (financialData || []).map(registro => {
        const parcelasAluno = (parcelasData || []).filter(
          p => p.registro_financeiro_id === registro.id
        );

        return {
          id: registro.aluno_id,
          nome: registro.alunos.nome,
          valor_total: registro.valor_total,
          valor_plano: registro.valor_plano,
          valor_material: registro.valor_material,
          valor_matricula: registro.valor_matricula,
          status_geral: registro.status_geral,
          data_primeiro_vencimento: registro.data_primeiro_vencimento,
          parcelas: parcelasAluno,
          registro_financeiro_id: registro.id,
          numero_parcelas_plano: registro.numero_parcelas_plano,
          numero_parcelas_material: registro.numero_parcelas_material,
          numero_parcelas_matricula: registro.numero_parcelas_matricula,
          forma_pagamento_plano: registro.forma_pagamento_plano,
          forma_pagamento_material: registro.forma_pagamento_material,
          forma_pagamento_matricula: registro.forma_pagamento_matricula
        };
      });

      setAlunos(alunosFinanceiros);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Função para criar parcela
  const criarParcela = useCallback(async () => {
    if (!novaParcela) return;

    if (!novaParcela.registro_financeiro_id || !novaParcela.tipo_item || !novaParcela.numero_parcela || !novaParcela.valor || !novaParcela.data_vencimento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('parcelas_alunos')
        .insert({
          registro_financeiro_id: novaParcela.registro_financeiro_id,
          tipo_item: novaParcela.tipo_item,
          numero_parcela: novaParcela.numero_parcela,
          valor: novaParcela.valor,
          data_vencimento: novaParcela.data_vencimento,
          status_pagamento: 'pendente',
          idioma_registro: 'Inglês',
          observacoes: novaParcela.observacoes || null,
          forma_pagamento: novaParcela.forma_pagamento || 'boleto'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela criada com sucesso!"
      });

      setIsCreateModalOpen(false);
      setNovaParcela(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar parcela",
        variant: "destructive"
      });
    }
  }, [novaParcela, toast, carregarDados]);

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
          forma_pagamento: editandoParcela.forma_pagamento || 'boleto'
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



  // Carregar dados ao montar o componente
  useEffect(() => {
    if (alunosFinanceiros) {
      setAlunos(alunosFinanceiros);
      setLoading(false);
    } else {
      carregarDados();
    }
  }, [alunosFinanceiros, carregarDados]);

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
                    <CardTitle className="text-2xl font-bold">Agrupamento por Aluno</CardTitle>
                    <p className="text-red-100 mt-1">Visão detalhada dos registros financeiros</p>
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

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-md border-0 bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-[800px]">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Filter className="h-5 w-5" />
                  <span className="font-medium">Filtros:</span>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome do aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                  />
                </div>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchTerm('')}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    Limpar
                  </motion.button>
                )}
              </div>
              
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
            </div>
          </CardContent>
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
                  onValueChange={(value) => setNovaParcela(prev => prev ? {...prev, tipo_item: value as 'plano' | 'material' | 'matrícula'} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano">Plano</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="matrícula">Matrícula</SelectItem>
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
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
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
                    saveScrollPosition();
                    setIsCreateModalOpen(false);
                    restoreScrollPosition();
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
          {editandoParcela && (
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
                  onValueChange={(value) => setEditandoParcela(prev => prev ? {...prev, tipo_item: value as 'plano' | 'material' | 'matrícula'} : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano">Plano</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="matrícula">Matrícula</SelectItem>
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
                  onValueChange={(value: 'pago' | 'pendente' | 'vencido' | 'cancelado') => setEditandoParcela(prev => prev ? {...prev, status_pagamento: value} : null)}
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
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
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
                  <CardTitle className="text-xl text-gray-800">Alunos Cadastrados</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{filteredAlunos.length} aluno{filteredAlunos.length !== 1 ? 's' : ''} encontrado{filteredAlunos.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800 px-3 py-1">
                {filteredAlunos.length} registros
              </Badge>
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
                      <span>Valor Total</span>
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
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>Status Geral</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAlunos.map((aluno, index) => {
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
                              <span>{aluno.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-base py-4">
                            <span className="font-semibold text-gray-800">{formatCurrency(aluno.valor_total)}</span>
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
                              <TableCell colSpan={6} className="p-0">
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
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleButtonClick(() => abrirModalCriarParcela(aluno.id, aluno.nome, aluno.registro_financeiro_id), e)}
                                        className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                      >
                                        <Plus className="h-4 w-4" />
                                        <span>Nova Parcela</span>
                                      </motion.button>
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
                                          aluno.parcelas
                                            .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
                                            .map((parcela, parcelaIndex) => {
                                              const formaPagamento = getFormaPagamentoParcela(parcela, aluno);
                                              return (
                                                <motion.tr
                                                  key={parcela.id}
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
                                                  <TableCell className="py-4 text-base font-semibold">{parcela.numero_parcela}</TableCell>
                                                  <TableCell className="font-bold py-4 text-base text-green-700">{formatCurrency(parcela.valor)}</TableCell>
                                                  <TableCell className="py-4 text-base capitalize">
                                                    {formaPagamento}
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
                                                      <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                      >
                                                        <Button
                                                          size="sm"
                                                          onClick={(e) => handleButtonClick(() => abrirModalEditarParcela(parcela), e)}
                                                          className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white"
                                                        >
                                                          <Edit className="h-4 w-4" />
                                                        </Button>
                                                      </motion.div>
                                                      <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                      >
                                                        <Button
                                                          size="sm"
                                                          onClick={(e) => handleButtonClick(() => excluirParcela(parcela.id), e)}
                                                          className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white"
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      </motion.div>
                                                    </div>
                                                  </TableCell>
                                                </motion.tr>
                                              );
                                            })
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={9} className="py-16">
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
            
            {filteredAlunos.length === 0 && (
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
              {/* Cards de Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-red-50 to-gray-100 p-6 rounded-xl border border-red-200 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status Geral</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusGeralIcon(alunoPlanoDetalhes.status_geral)}
                        <span className="text-lg font-semibold capitalize">{alunoPlanoDetalhes.status_geral}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-3">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Detalhamento por Tipo de Item */}
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



              {/* Resumo Final */}
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