import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Calendar, BookOpen, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Tipos para estatísticas
interface AulaStats {
  total: number;
  agendadas: number;
  concluidas: number;
  canceladas: number;
  emAndamento: number;
}

interface TurmaStats {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
  cor_calendario: string;
  totalAulas: number;
  aulasRealizadas: number;
  percentualConclusao: number;
  mediaPresenca: number;
  totalAlunos: number;
}

interface PresencaStats {
  totalPresencas: number;
  presencasConfirmadas: number;
  faltas: number;
  faltasRepostas: number;
  percentualPresenca: number;
}

interface CompetenciaProgress {
  competencia: string;
  totalAvaliacoes: number;
  mediaNotas: number;
  progressoGeral: number;
}

/**
 * Componente de Estatísticas das Aulas
 * 
 * Funcionalidades:
 * - Visão geral das aulas (total, status, etc.)
 * - Estatísticas por turma
 * - Análise de presença
 * - Progresso de competências
 * - Gráficos e métricas visuais
 * - Filtros por período
 */
const ClassesStats = () => {
  // Estados principais
  const [aulaStats, setAulaStats] = useState<AulaStats>({
    total: 0,
    agendadas: 0,
    concluidas: 0,
    canceladas: 0,
    emAndamento: 0
  });
  
  const [turmaStats, setTurmaStats] = useState<TurmaStats[]>([]);
  const [presencaStats, setPresencaStats] = useState<PresencaStats>({
    totalPresencas: 0,
    presencasConfirmadas: 0,
    faltas: 0,
    faltasRepostas: 0,
    percentualPresenca: 0
  });
  
  const [competenciaProgress, setCompetenciaProgress] = useState<CompetenciaProgress[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    turmaId: '',
    idioma: ''
  });

  const { toast } = useToast();

  /**
   * Carrega estatísticas gerais das aulas
   */
  const loadAulaStats = async () => {
    try {
      let query = supabase.from('aulas').select('status');
      
      // Aplicar filtros de data se definidos
      if (filters.dataInicio) {
        query = query.gte('data', filters.dataInicio);
      }
      if (filters.dataFim) {
        query = query.lte('data', filters.dataFim);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;

      const stats = data.reduce((acc, aula) => {
        acc.total++;
        switch (aula.status) {
          case 'agendada':
            acc.agendadas++;
            break;
          case 'concluida':
            acc.concluidas++;
            break;
          case 'cancelada':
            acc.canceladas++;
            break;
          case 'em_andamento':
            acc.emAndamento++;
            break;
        }
        return acc;
      }, {
        total: 0,
        agendadas: 0,
        concluidas: 0,
        canceladas: 0,
        emAndamento: 0
      });

      setAulaStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas das aulas:', error);
    }
  };

  /**
   * Carrega estatísticas por turma
   */
  const loadTurmaStats = async () => {
    try {
      let aulaQuery = supabase
        .from('aulas')
        .select(`
          turma_id,
          status,
          turmas (
            id,
            nome,
            idioma,
            nivel,
            cor_calendario
          )
        `);

      // Aplicar filtros
      if (filters.dataInicio) {
        aulaQuery = aulaQuery.gte('data', filters.dataInicio);
      }
      if (filters.dataFim) {
        aulaQuery = aulaQuery.lte('data', filters.dataFim);
      }
      if (filters.turmaId) {
        aulaQuery = aulaQuery.eq('turma_id', filters.turmaId);
      }

      const { data: aulasData, error: aulasError } = await aulaQuery;
      if (aulasError) throw aulasError;

      // Carregar dados de alunos por turma
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('turma_id')
        .not('turma_id', 'is', null);
      
      if (alunosError) throw alunosError;

      // Carregar dados de presença
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas')
        .select(`
          aula_id,
          status,
          aulas (
            turma_id
          )
        `);
      
      if (presencasError) throw presencasError;

      // Processar estatísticas por turma
      const turmaStatsMap = new Map<string, TurmaStats>();

      // Inicializar com dados das aulas
      aulasData?.forEach(aula => {
        if (!aula.turmas) return;
        
        const turmaId = aula.turma_id;
        if (!turmaStatsMap.has(turmaId)) {
          turmaStatsMap.set(turmaId, {
            id: turmaId,
            nome: aula.turmas.nome,
            idioma: aula.turmas.idioma,
            nivel: aula.turmas.nivel,
            cor_calendario: aula.turmas.cor_calendario || '#6B7280',
            totalAulas: 0,
            aulasRealizadas: 0,
            percentualConclusao: 0,
            mediaPresenca: 0,
            totalAlunos: 0
          });
        }

        const stats = turmaStatsMap.get(turmaId)!;
        stats.totalAulas++;
        if (aula.status === 'concluida') {
          stats.aulasRealizadas++;
        }
      });

      // Adicionar dados de alunos
      alunosData?.forEach(aluno => {
        if (aluno.turma_id && turmaStatsMap.has(aluno.turma_id)) {
          turmaStatsMap.get(aluno.turma_id)!.totalAlunos++;
        }
      });

      // Calcular percentuais e médias
      turmaStatsMap.forEach(stats => {
        stats.percentualConclusao = stats.totalAulas > 0 
          ? (stats.aulasRealizadas / stats.totalAulas) * 100 
          : 0;

        // Calcular média de presença para esta turma
        const presencasTurma = presencasData?.filter(p => 
          p.aulas?.turma_id === stats.id
        ) || [];
        
        const presencasConfirmadas = presencasTurma.filter(p => 
          p.status === 'Presente'
        ).length;
        
        stats.mediaPresenca = presencasTurma.length > 0 
          ? (presencasConfirmadas / presencasTurma.length) * 100 
          : 0;
      });

      setTurmaStats(Array.from(turmaStatsMap.values()));
    } catch (error) {
      console.error('Erro ao carregar estatísticas das turmas:', error);
    }
  };

  /**
   * Carrega estatísticas de presença
   */
  const loadPresencaStats = async () => {
    try {
      let query = supabase
        .from('presencas')
        .select(`
          status,
          aulas (
            data,
            turma_id
          )
        `);

      const { data, error } = await query;
      if (error) throw error;

      // Filtrar por data se necessário
      const filteredData = data?.filter(presenca => {
        if (!presenca.aulas?.data) return false;
        
        const aulaData = presenca.aulas.data;
        const matchesDataInicio = !filters.dataInicio || aulaData >= filters.dataInicio;
        const matchesDataFim = !filters.dataFim || aulaData <= filters.dataFim;
        
        return matchesDataInicio && matchesDataFim;
      }) || [];

      const stats = filteredData.reduce((acc, presenca) => {
        acc.totalPresencas++;
        
        switch (presenca.status) {
          case 'Presente':
            acc.presencasConfirmadas++;
            break;
          case 'Falta':
            acc.faltas++;
            break;
          case 'Reposta':
            acc.faltasRepostas++;
            break;
        }
        
        return acc;
      }, {
        totalPresencas: 0,
        presencasConfirmadas: 0,
        faltas: 0,
        faltasRepostas: 0,
        percentualPresenca: 0
      });

      stats.percentualPresenca = stats.totalPresencas > 0 
        ? (stats.presencasConfirmadas / stats.totalPresencas) * 100 
        : 0;

      setPresencaStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de presença:', error);
    }
  };

  /**
   * Carrega progresso de competências
   */
  const loadCompetenciaProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes_competencia')
        .select(`
          competencia,
          nota,
          alunos (
            turma_id
          )
        `);

      if (error) throw error;

      // Agrupar por competência
      const competenciaMap = new Map<string, { notas: number[], count: number }>();

      data?.forEach(avaliacao => {
        const competencia = avaliacao.competencia;
        if (!competenciaMap.has(competencia)) {
          competenciaMap.set(competencia, { notas: [], count: 0 });
        }
        
        const comp = competenciaMap.get(competencia)!;
        comp.notas.push(avaliacao.nota);
        comp.count++;
      });

      // Calcular estatísticas
      const progressData: CompetenciaProgress[] = Array.from(competenciaMap.entries()).map(
        ([competencia, data]) => {
          const mediaNotas = data.notas.reduce((sum, nota) => sum + nota, 0) / data.notas.length;
          const progressoGeral = (mediaNotas / 10) * 100; // Assumindo escala de 0-10
          
          return {
            competencia,
            totalAvaliacoes: data.count,
            mediaNotas,
            progressoGeral
          };
        }
      );

      setCompetenciaProgress(progressData);
    } catch (error) {
      console.error('Erro ao carregar progresso de competências:', error);
    }
  };

  /**
   * Carrega todas as estatísticas
   */
  const loadAllStats = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAulaStats(),
        loadTurmaStats(),
        loadPresencaStats(),
        loadCompetenciaProgress()
      ]);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as estatísticas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados iniciais e quando filtros mudam
  useEffect(() => {
    loadAllStats();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BarChart3 className="h-5 w-5" style={{ color: '#D90429' }} />
        <h2 className="text-xl font-semibold text-gray-900">Estatísticas das Aulas</h2>
      </motion.div>

      {/* Filtros de período */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Filtros de Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                   type="date"
                   value={filters.dataInicio}
                   onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                 />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                   type="date"
                   value={filters.dataFim}
                   onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                   value={filters.idioma}
                   onChange={(e) => setFilters(prev => ({ ...prev, idioma: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                 >
                  <option value="">Todos</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Japonês">Japonês</option>
                  <option value="Inglês/Japonês">Inglês/Japonês</option>
                  <option value="particular">Particular</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ dataInicio: '', dataFim: '', turmaId: '', idioma: '' })}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: '#D90429', borderColor: '#D90429' }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cards de estatísticas gerais */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Aulas</p>
                  <p className="text-2xl font-bold text-gray-900">{aulaStats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{aulaStats.concluidas}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendadas</p>
                  <p className="text-2xl font-bold text-blue-600">{aulaStats.agendadas}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-yellow-600">{aulaStats.emAndamento}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold" style={{ color: '#D90429' }}>{aulaStats.canceladas}</p>
                </div>
                <Target className="h-8 w-8" style={{ color: '#D90429' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Gráficos de Status das Aulas */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Distribuição de Status das Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Concluídas', value: aulaStats.concluidas, color: '#10B981' },
                      { name: 'Agendadas', value: aulaStats.agendadas, color: '#3B82F6' },
                      { name: 'Em Andamento', value: aulaStats.emAndamento, color: '#F59E0B' },
                      { name: 'Canceladas', value: aulaStats.canceladas, color: '#D90429' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Concluídas', value: aulaStats.concluidas, color: '#10B981' },
                      { name: 'Agendadas', value: aulaStats.agendadas, color: '#3B82F6' },
                      { name: 'Em Andamento', value: aulaStats.emAndamento, color: '#F59E0B' },
                      { name: 'Canceladas', value: aulaStats.canceladas, color: '#D90429' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Desempenho por Turma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={turmaStats.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentualConclusao" fill="#3B82F6" name="% Conclusão" />
                  <Bar dataKey="mediaPresenca" fill="#10B981" name="% Presença" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Estatísticas de presença */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estatísticas de Presença
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {presencaStats.percentualPresenca.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Taxa de Presença</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {presencaStats.presencasConfirmadas}
                </p>
                <p className="text-sm text-gray-600">Presenças Confirmadas</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {presencaStats.faltas}
                </p>
                <p className="text-sm text-gray-600">Faltas</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {presencaStats.faltasRepostas}
                </p>
                <p className="text-sm text-gray-600">Faltas Repostas</p>
              </div>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Presenças', value: presencaStats.presencasConfirmadas, color: '#10B981' },
                      { name: 'Faltas', value: presencaStats.faltas, color: '#EF4444' },
                      { name: 'Faltas Repostas', value: presencaStats.faltasRepostas, color: '#F59E0B' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Presenças', value: presencaStats.presencasConfirmadas, color: '#10B981' },
                      { name: 'Faltas', value: presencaStats.faltas, color: '#EF4444' },
                      { name: 'Faltas Repostas', value: presencaStats.faltasRepostas, color: '#F59E0B' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Estatísticas por turma */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Desempenho por Turma</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {turmaStats.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma turma encontrada para o período selecionado.
              </p>
            ) : (
              turmaStats.map(turma => (
                <div key={turma.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: turma.cor_calendario }}
                      ></div>
                      <h4 className="font-medium text-gray-900">{turma.nome}</h4>
                      <Badge variant="outline">
                        {turma.idioma} - {turma.nivel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {turma.totalAlunos} aluno{turma.totalAlunos !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Conclusão de Aulas</span>
                        <span>{turma.percentualConclusao.toFixed(1)}%</span>
                      </div>
                      <Progress value={turma.percentualConclusao} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {turma.aulasRealizadas} de {turma.totalAulas} aulas
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Presença Média</span>
                        <span>{turma.mediaPresenca.toFixed(1)}%</span>
                      </div>
                      <Progress value={turma.mediaPresenca} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {turma.totalAulas}
                        </p>
                        <p className="text-xs text-gray-600">Total de Aulas</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Progresso de competências */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Progresso de Competências
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competenciaProgress.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma avaliação de competência encontrada.
              </p>
            ) : (
              competenciaProgress.map(comp => (
                <div key={comp.competencia} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{comp.competencia}</h4>
                    <Badge variant="outline">
                      {comp.totalAvaliacoes} avaliação{comp.totalAvaliacoes !== 1 ? 'ões' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso Geral</span>
                        <span>{comp.progressoGeral.toFixed(1)}%</span>
                      </div>
                      <Progress value={comp.progressoGeral} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {comp.mediaNotas.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-600">Média das Notas</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
};

export default ClassesStats;