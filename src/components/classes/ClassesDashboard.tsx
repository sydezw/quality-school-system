import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { NewLessonDialog } from './NewLessonDialog';

// Tipos
type Aula = Tables<'aulas'>;
type Turma = Tables<'turmas'>;

interface AulaComTurma extends Aula {
  turmas: {
    id: string;
    nome: string;
    idioma: string;
    nivel: string;
    cor_calendario: string;
  } | null;
}

interface DashboardStats {
  totalAulas: number;
  aulasHoje: number;
  aulasSemana: number;
  turmasAtivas: number;
  proximasAulas: AulaComTurma[];
}

/**
 * Componente Dashboard das Aulas
 * 
 * Funcionalidades:
 * - Estatísticas gerais das aulas
 * - Próximas aulas do dia/semana
 * - Acesso rápido para ações principais
 * - Visão geral do calendário
 */
const ClassesDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAulas: 0,
    aulasHoje: 0,
    aulasSemana: 0,
    turmasAtivas: 0,
    proximasAulas: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  /**
   * Carrega as estatísticas do dashboard
   */
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      const hoje = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);

      // Buscar todas as aulas
      const { data: todasAulas, error: aulasError } = await supabase
        .from('aulas')
        .select(`
          *,
          turmas (
            id,
            nome,
            idioma,
            nivel,
            cor_calendario
          )
        `)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (aulasError) throw aulasError;

      // Buscar turmas ativas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('id')
        .eq('status', 'ativo');

      if (turmasError) throw turmasError;

      // Calcular estatísticas
      const aulasHoje = todasAulas?.filter(aula => aula.data === hoje).length || 0;
      
      const aulasSemana = todasAulas?.filter(aula => {
        const dataAula = new Date(aula.data);
        return dataAula >= inicioSemana && dataAula <= fimSemana;
      }).length || 0;

      // Próximas aulas (próximos 7 dias)
      const proximaData = new Date();
      const proximasAulas = todasAulas?.filter(aula => {
        const dataAula = new Date(aula.data);
        const diffTime = dataAula.getTime() - proximaData.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).slice(0, 5) || [];

      setStats({
        totalAulas: todasAulas?.length || 0,
        aulasHoje,
        aulasSemana,
        turmasAtivas: turmas?.length || 0,
        proximasAulas: proximasAulas as AulaComTurma[]
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as estatísticas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  /**
   * Formata a data para exibição
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  /**
   * Formata o horário para exibição
   */
  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  /**
   * Retorna a cor do status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-green-100 text-green-800';
      case 'concluida': return 'bg-gray-100 text-gray-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900">Dashboard de Aulas</h2>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Aulas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAulas}</div>
            <p className="text-xs text-muted-foreground">
              Todas as aulas cadastradas
            </p>
          </CardContent>
        </Card>

        {/* Aulas Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.aulasHoje}</div>
            <p className="text-xs text-muted-foreground">
              Aulas programadas para hoje
            </p>
          </CardContent>
        </Card>

        {/* Aulas desta Semana */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aulasSemana}</div>
            <p className="text-xs text-muted-foreground">
              Aulas desta semana
            </p>
          </CardContent>
        </Card>

        {/* Turmas Ativas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.turmasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Turmas em funcionamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Aulas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Próximas Aulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.proximasAulas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma aula programada para os próximos dias</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.proximasAulas.map(aula => (
                <div
                  key={aula.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{
                    borderLeftColor: aula.turmas?.cor_calendario || '#6B7280',
                    borderLeftWidth: '4px'
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {aula.titulo || aula.turmas?.nome || 'Aula sem título'}
                      </h4>
                      <Badge className={getStatusColor(aula.status || 'agendada')}>
                        {aula.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(aula.data)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(aula.horario_inicio)} - {formatTime(aula.horario_fim)}
                      </span>
                      <span>
                        {aula.turmas?.idioma} - {aula.turmas?.nivel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NewLessonDialog onSuccess={loadDashboardStats}>
              <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
                <Calendar className="h-6 w-6" />
                <span>Nova Aula</span>
              </Button>
            </NewLessonDialog>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>Controlar Presença</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Ver Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassesDashboard;