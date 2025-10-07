import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Archive, 
  Calculator, 
  CreditCard,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Search,
  X,
  DollarSign
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ParcelaDetalhada {
  id: number;
  alunos_financeiro_id: string | null;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'avulso' | 'outros';
  descricao_item?: string | null;
  idioma_registro: 'Inglês' | 'Japonês';
  aluno_nome?: string;
  plano_nome?: string;
  forma_pagamento?: string;
  observacoes?: string | null;
  fonte?: 'alunos_parcelas' | 'parcelas_migracao_raw';
}

interface StudentGroupingViewProps {
  onRefresh?: () => void;
}

const StudentGroupingView: React.FC<StudentGroupingViewProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const [tipoRegistro, setTipoRegistro] = useState<'ativos' | 'migrados'>('ativos');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isGeneratingParcelas, setIsGeneratingParcelas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parcelasMigradas, setParcelasMigradas] = useState<ParcelaDetalhada[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    nomeAluno: '',
    statusPagamento: 'all',
    idioma: 'all',
    tipoItem: 'all',
    valorMin: '',
    valorMax: '',
    dataVencimentoInicio: '',
    dataVencimentoFim: ''
  });

  // Função para aplicar filtros
  const parcelasFiltradas = useMemo(() => {
    return parcelasMigradas.filter(parcela => {
      // Filtro por nome do aluno
      if (filtros.nomeAluno && !parcela.aluno_nome?.toLowerCase().includes(filtros.nomeAluno.toLowerCase())) {
        return false;
      }
      
      // Filtro por status de pagamento
      if (filtros.statusPagamento && filtros.statusPagamento !== 'all' && parcela.status_pagamento !== filtros.statusPagamento) {
        return false;
      }
      
      // Filtro por idioma
      if (filtros.idioma && filtros.idioma !== 'all' && parcela.idioma_registro !== filtros.idioma) {
        return false;
      }
      
      // Filtro por tipo de item
      if (filtros.tipoItem && filtros.tipoItem !== 'all' && parcela.tipo_item !== filtros.tipoItem) {
        return false;
      }
      
      // Filtro por valor mínimo
      if (filtros.valorMin && parcela.valor < parseFloat(filtros.valorMin)) {
        return false;
      }
      
      // Filtro por valor máximo
      if (filtros.valorMax && parcela.valor > parseFloat(filtros.valorMax)) {
        return false;
      }
      
      // Filtro por data de vencimento início
      if (filtros.dataVencimentoInicio && parcela.data_vencimento < filtros.dataVencimentoInicio) {
        return false;
      }
      
      // Filtro por data de vencimento fim
      if (filtros.dataVencimentoFim && parcela.data_vencimento > filtros.dataVencimentoFim) {
        return false;
      }
      
      return true;
    });
  }, [parcelasMigradas, filtros]);

  const parcelasAgrupadas = useMemo(() => {
    const grupos: { [key: string]: ParcelaDetalhada[] } = {};
    
    parcelasFiltradas.forEach(parcela => {
      const nomeAluno = parcela.aluno_nome || 'Aluno não identificado';
      if (!grupos[nomeAluno]) {
        grupos[nomeAluno] = [];
      }
      grupos[nomeAluno].push(parcela);
    });
    
    console.log('Grupos criados:', Object.keys(grupos).length, 'alunos');
    
    return grupos;
  }, [parcelasFiltradas]);

  const carregarDadosMigrados = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Carregar todos os dados usando paginação
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('parcelas_migracao_raw')
          .select('*')
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Erro Supabase:', error);
          throw error;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += pageSize;
          hasMore = data.length === pageSize;
          console.log(`Carregados ${allData.length} registros até agora...`);
        } else {
          hasMore = false;
        }
      }

      console.log('Total de dados carregados:', allData.length);
      if (!allData || allData.length === 0) return;

      const parcelasFormatadas: ParcelaDetalhada[] = allData.map((parcela, index) => ({
        id: parcela.id || index,
        alunos_financeiro_id: null,
        numero_parcela: index + 1,
        valor: Number(parcela.valor) || 0,
        data_vencimento: parcela.data_vencimento || new Date().toISOString(),
        data_pagamento: parcela.data_pagamento,
        status_pagamento: parcela.status_pagamento || 'pendente',
        tipo_item: parcela.tipo_item || 'outros',
        descricao_item: parcela.descricao_item,
        idioma_registro: (parcela.idioma || 'Inglês') as 'Inglês' | 'Japonês',
        aluno_nome: parcela.aluno_nome || 'Aluno não identificado',
        plano_nome: parcela.descricao_item || 'Plano Migrado',
        forma_pagamento: parcela.forma_pagamento,
        observacoes: parcela.observacoes,
        fonte: 'parcelas_migracao_raw' as const
      }));
      
      console.log('Parcelas formatadas:', parcelasFormatadas.length);
      setParcelasMigradas(parcelasFormatadas);
      toast({
        title: "Dados carregados",
        description: `${parcelasFormatadas.length} registros migrados carregados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao carregar dados migrados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados migrados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tipoRegistro === 'migrados') {
      carregarDadosMigrados();
    }
  }, [tipoRegistro]);

  const handleCreatePlan = () => {
    console.log('Criar plano');
  };

  const handleClonarDadosAtivos = () => {
    console.log('Clonar dados ativos');
  };

  const handleGerarParcelas = () => {
    console.log('Gerar parcelas');
  };

  // Funções para gerenciar filtros
  const limparFiltros = () => {
    setFiltros({
      nomeAluno: '',
      statusPagamento: 'all',
      idioma: 'all',
      tipoItem: 'all',
      valorMin: '',
      valorMax: '',
      dataVencimentoInicio: '',
      dataVencimentoFim: ''
    });
  };

  const atualizarFiltro = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const temFiltrosAtivos = filtros.nomeAluno !== '' || 
    (filtros.statusPagamento !== '' && filtros.statusPagamento !== 'all') ||
    (filtros.idioma !== '' && filtros.idioma !== 'all') ||
    (filtros.tipoItem !== '' && filtros.tipoItem !== 'all') ||
    filtros.valorMin !== '' || filtros.valorMax !== '' ||
    filtros.dataVencimentoInicio !== '' || filtros.dataVencimentoFim !== '';

  const toggleGroup = (nomeAluno: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(nomeAluno)) {
      newExpanded.delete(nomeAluno);
    } else {
      newExpanded.add(nomeAluno);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-200';
      case 'não pago':
      case 'nao pago':
      case 'atrasado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getTipoItemColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'plano': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'material': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'matrícula': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelamento': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalStudents = Object.keys(parcelasAgrupadas).length;
  const totalParcels = parcelasFiltradas.length;
  const totalValue = parcelasFiltradas.reduce((sum, parcela) => sum + parcela.valor, 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D90429] to-[#1F2937] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agrupamento de Alunos</h1>
              <p className="text-gray-600">Visualize e gerencie registros ativos e migrados</p>
            </div>
          </div>
          
          {/* Modern Tab Navigation */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTipoRegistro('ativos')}
              className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                tipoRegistro === 'ativos'
                  ? 'bg-white text-[#D90429] shadow-sm'
                  : 'text-gray-600 hover:text-[#D90429] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  tipoRegistro === 'ativos' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                Registros Ativos
              </div>
              {tipoRegistro === 'ativos' && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTipoRegistro('migrados')}
              className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                tipoRegistro === 'migrados'
                  ? 'bg-white text-[#D90429] shadow-sm'
                  : 'text-gray-600 hover:text-[#D90429] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Archive className={`h-4 w-4 transition-colors duration-300 ${
                  tipoRegistro === 'migrados' ? 'text-[#D90429]' : 'text-gray-400'
                }`} />
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  tipoRegistro === 'migrados' ? 'bg-orange-500' : 'bg-gray-400'
                }`}></div>
                Registros Migrados
              </div>
              {tipoRegistro === 'migrados' && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </Button>
          </div>
        </div>
      </motion.div>



      {/* Sistema de Filtros Simplificado */}
      {tipoRegistro === 'migrados' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
        >
          {/* Botão de Toggle dos Filtros */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isFiltersExpanded ? 'Ocultar' : 'Mostrar'} Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${
                  isFiltersExpanded ? 'rotate-180' : ''
                }`} />
              </Button>
              {temFiltrosAtivos && (
                <Button
                  onClick={limparFiltros}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>

          {/* Painel de Filtros */}
          {isFiltersExpanded && (
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Nome do Aluno */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Buscar Aluno
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Nome do aluno..."
                      value={filtros.nomeAluno}
                      onChange={(e) => atualizarFiltro('nomeAluno', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status de Pagamento */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <Select
                    value={filtros.statusPagamento}
                    onValueChange={(value) => atualizarFiltro('statusPagamento', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Idioma */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Idioma
                  </label>
                  <Select
                    value={filtros.idioma}
                    onValueChange={(value) => atualizarFiltro('idioma', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Inglês">Inglês</SelectItem>
                      <SelectItem value="Japonês">Japonês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Item */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tipo
                  </label>
                  <Select
                    value={filtros.tipoItem}
                    onValueChange={(value) => atualizarFiltro('tipoItem', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="plano">Plano</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="matrícula">Matrícula</SelectItem>
                      <SelectItem value="avulso">Avulso</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Botões de Ação para Registros Ativos */}
      {tipoRegistro === 'ativos' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ações Disponíveis</h3>
                <p className="text-sm text-gray-600">Gerencie registros ativos</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 flex-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleGerarParcelas}
                  disabled={isGeneratingParcelas}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  <CreditCard className="h-4 w-4 mr-1" />
                  {isGeneratingParcelas ? 'Gerando...' : 'Gerar Parcelas'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        {tipoRegistro === 'ativos' ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Registros Ativos</h3>
            <p className="text-gray-500">Visualização de registros ativos em desenvolvimento...</p>
          </div>
        ) : (
          <div>
            {isLoading ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429] mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Carregando registros migrados...</p>
                <p className="text-sm text-gray-500 mt-1">Aguarde enquanto processamos os dados</p>
              </motion.div>
            ) : parcelasMigradas.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum registro migrado encontrado</h3>
                <p className="text-gray-500 mb-6">Não há dados de migração disponíveis no momento</p>
                <Button
                  onClick={carregarDadosMigrados}
                  variant="outline"
                  className="border-[#D90429] text-[#D90429] hover:bg-[#D90429] hover:text-white transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </motion.div>
            ) : (
              <div>
                {/* Enhanced Header with Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Registros Migrados</h2>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">{totalStudents} estudantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600">{totalParcels} parcelas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={carregarDadosMigrados}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </motion.div>

                {/* Enhanced Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">
                        <TableHead className="font-semibold text-gray-700 py-4">Aluno</TableHead>
                        <TableHead className="font-semibold text-gray-700">Parcelas</TableHead>
                        <TableHead className="font-semibold text-gray-700">Total</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(parcelasAgrupadas).map(([nomeAluno, parcelas]) => {
                        const isExpanded = expandedGroups.has(nomeAluno);
                        const totalGrupo = parcelas.reduce((sum, p) => sum + p.valor, 0);
                        const statusCounts = parcelas.reduce((acc, p) => {
                          acc[p.status_pagamento] = (acc[p.status_pagamento] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        return (
                          <React.Fragment key={nomeAluno}>
                            {/* Group Header */}
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer border-b-2 border-blue-200 transition-all duration-300"
                              onClick={() => toggleGroup(nomeAluno)}
                            >
                              <TableCell className="font-semibold text-gray-900 py-4">
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight className="h-4 w-4 text-blue-600" />
                                  </motion.div>
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-lg">{nomeAluno}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                                  {parcelas.length} parcelas
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-green-700">
                                R$ {totalGrupo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(statusCounts).map(([status, count]) => (
                                    <Badge key={status} className={`text-xs ${getStatusColor(status)}`}>
                                      {status}: {count}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Eye className="h-4 w-4 text-gray-400 mx-auto" />
                              </TableCell>
                            </motion.tr>

                            {/* Individual Parcels */}
                            <AnimatePresence>
                              {isExpanded && parcelas.map((parcela, index) => (
                                <motion.tr
                                  key={`${nomeAluno}-${parcela.id}`}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border-l-4 border-blue-200 transition-all duration-300"
                                >
                                  <TableCell className="pl-16">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                        {parcela.numero_parcela}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{parcela.plano_nome}</p>
                                        <p className="text-sm text-gray-500">{parcela.idioma_registro}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-semibold text-gray-900">
                                      R$ {parcela.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <span className="text-gray-600">Venc: {formatDate(parcela.data_vencimento)}</span>
                                      </div>
                                      {parcela.data_pagamento && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Clock className="h-3 w-3 text-green-500" />
                                          <span className="text-green-600">Pago: {formatDate(parcela.data_pagamento)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge className={getStatusColor(parcela.status_pagamento)}>
                                        {parcela.status_pagamento}
                                      </Badge>
                                      <Badge className={getTipoItemColor(parcela.tipo_item)}>
                                        {parcela.tipo_item}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Eye className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" />
                                      {parcela.observacoes && (
                                        <div className="w-2 h-2 bg-orange-400 rounded-full" title="Possui observações" />
                                      )}
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentGroupingView;