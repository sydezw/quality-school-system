import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type Aula = Tables<'aulas'>;
type Turma = Tables<'turmas'>;
type Usuario = Tables<'usuarios'>;

type TipoAula = 'normal' | 'avaliativa' | 'prova_final' | null;
interface AulaRowMin {
  id: string;
  turma_id: string;
  data: string;
  tipo_aula: TipoAula;
}

type PFRow = {
  id?: string;
  aula_id: string;
  turma_id: string;
  aluno_id: string;
  data_prova: string;
  total_questoes: number;
  acertos: number;
  observacao: string | null;
  aprovacao_status: 'aprovado' | 'reprovado';
  aprovacao_manual: boolean;
};
type DatabaseExt = Database & {
  public: {
    Tables: Database['public']['Tables'] & {
      avaliacoes_prova_final: {
        Row: PFRow;
        Insert: PFRow;
        Update: Partial<PFRow>;
      };
    };
  };
};

interface TurmaComProfessor {
  id: string;
  nome: string;
  idioma: "Inglês" | "Japonês" | "Inglês/Japonês" | "particular";
  nivel: "Book 1" | "Book 2" | "Book 3" | "Book 4" | "Book 5" | "Book 6" | "Book 7" | "Book 8" | "Book 9" | "Book 10";
  cor_calendario: string | null;
  professor_id: string | null;
  status: string | null;
  total_aulas: number | null;
  professores: {
    id: string;
    nome: string;
    email: string;
  } | null;
}

interface AulaComDetalhes extends Aula {
  turmas: TurmaComProfessor | null;
}

interface FiltrosAulas {
  termo?: string;
  turmaId?: string;
  professorId?: string;
  idioma?: string;
  nivel?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

interface UseAulasReturn {
  aulas: AulaComDetalhes[];
  turmas: Turma[];
  professores: Usuario[];
  loading: boolean;
  error: string | null;
  totalAulas: number;
  recarregarAulas: () => Promise<void>;
  excluirAula: (id: string) => Promise<void>;
  excluirMultiplasAulas: (ids: string[]) => Promise<void>;
  buscarAulas: (filtros?: FiltrosAulas) => Promise<void>;
  carregarDadosFiltros: () => Promise<void>;
}

export const useAulas = (): UseAulasReturn => {
  const [aulas, setAulas] = useState<AulaComDetalhes[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAulas, setTotalAulas] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const isProfessor = user?.cargo === 'Professor';

  /**
   * Busca aulas com filtros opcionais
   */
  const buscarAulas = useCallback(async (filtros: FiltrosAulas = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('aulas')
        .select(`
          *,
          turmas (
            id,
            nome,
            idioma,
            nivel,
            cor_calendario,
            professor_id,
            status,
            total_aulas,
            professores (
              id,
              nome,
              email
            )
          )
        `)
        .order('data', { ascending: false })
        .order('horario_inicio', { ascending: true });

      if (isProfessor && user?.id) {
        const { data: minhasTurmas } = await supabase
          .from('turmas')
          .select('id')
          .eq('professor_id', user.id);
        const turmaIds = (minhasTurmas || []).map(t => t.id);
        if (turmaIds.length === 0) {
          setAulas([]);
          setTotalAulas(0);
          setLoading(false);
          return;
        }
        query = query.in('turma_id', turmaIds);
      }

      // Aplicar filtros
      if (filtros.turmaId) {
        query = query.eq('turma_id', filtros.turmaId);
      }

      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      if (filtros.dataInicio) {
        query = query.gte('data', filtros.dataInicio);
      }

      if (filtros.dataFim) {
        query = query.lte('data', filtros.dataFim);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      let aulasProcessadas = data || [];

      // Aplicar filtros adicionais no frontend (para campos relacionados)
      if (filtros.termo) {
        const termo = filtros.termo.toLowerCase();
        aulasProcessadas = aulasProcessadas.filter(aula => 
          aula.titulo?.toLowerCase().includes(termo) ||
          aula.descricao?.toLowerCase().includes(termo) ||
          aula.turmas?.nome?.toLowerCase().includes(termo)
        );
      }

      if (filtros.professorId) {
        aulasProcessadas = aulasProcessadas.filter(aula => 
          aula.turmas?.professor_id === filtros.professorId
        );
      }

      if (isProfessor && user?.id) {
        aulasProcessadas = aulasProcessadas.filter(aula => aula.turmas?.professor_id === user.id);
      }

      if (filtros.idioma) {
        aulasProcessadas = aulasProcessadas.filter(aula => 
          aula.turmas?.idioma === filtros.idioma
        );
      }

      if (filtros.nivel) {
        aulasProcessadas = aulasProcessadas.filter(aula => 
          aula.turmas?.nivel === filtros.nivel
        );
      }

      setAulas(aulasProcessadas);
      setTotalAulas(aulasProcessadas.length);

    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      setError('Erro ao carregar aulas');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as aulas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user?.id, user?.cargo]);

  /**
   * Carrega dados para os filtros (turmas e professores)
   */
  const carregarDadosFiltros = useCallback(async () => {
    try {
      // Carregar turmas
      let turmasQuery = supabase
        .from('turmas')
        .select('*')
        .order('nome');

      if (isProfessor && user?.id) {
        turmasQuery = turmasQuery.eq('professor_id', user.id);
      }

      const { data: turmasData, error: turmasError } = await turmasQuery;

      if (turmasError) throw turmasError;
      setTurmas(turmasData || []);

      // Carregar professores
      const { data: professoresData, error: professoresError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cargo', 'Professor')
        .order('nome');

      if (professoresError) throw professoresError;
      setProfessores(professoresData || []);

    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados dos filtros.',
        variant: 'destructive',
      });
    }
  }, [toast, user?.id, user?.cargo]);

  /**
   * Recarrega a lista de aulas
   */
  const recarregarAulas = useCallback(async () => {
    await buscarAulas();
  }, [buscarAulas]);

  /**
   * Exclui uma aula individual
   */
  const excluirAula = useCallback(async (id: string) => {
    try {
      const { data: aulaRow, error: aulaError } = await supabase
        .from('aulas')
        .select('id, turma_id, data, tipo_aula')
        .eq('id', id)
        .single();
      if (aulaError) throw aulaError;

      const { turma_id: turmaId, data: dataAula, tipo_aula: tipoAula } = aulaRow as AulaRowMin;

      await supabase
        .from('presencas')
        .delete()
        .eq('aula_id', id);

      if (tipoAula === 'avaliativa' && turmaId && dataAula) {
        await supabase
          .from('avaliacoes_competencia')
          .delete()
          .eq('turma_id', turmaId)
          .eq('data', dataAula);
      }

      if (tipoAula === 'prova_final') {
        const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
        await sp
          .from('avaliacoes_prova_final')
          .delete()
          .eq('aula_id', id);
        if (turmaId && dataAula) {
          await sp
            .from('avaliacoes_prova_final')
            .delete()
            .eq('turma_id', turmaId)
            .eq('data_prova', dataAula);
        }
      }

      const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Aula excluída com sucesso.',
      });

      // Recarregar a lista
      await recarregarAulas();

    } catch (error) {
      console.error('Erro ao excluir aula:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir aula.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, recarregarAulas]);

  /**
   * Exclui múltiplas aulas
   */
  const excluirMultiplasAulas = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const { data: aulasRows, error: aulasSelError } = await supabase
        .from('aulas')
        .select('id, turma_id, data, tipo_aula')
        .in('id', ids);
      if (aulasSelError) throw aulasSelError;

      await supabase
        .from('presencas')
        .delete()
        .in('aula_id', ids);

      const avaliativas = (aulasRows || []).filter((a) => (a as AulaRowMin).tipo_aula === 'avaliativa');
      for (const a of avaliativas as AulaRowMin[]) {
        const turmaId = a.turma_id;
        const dataAula = a.data;
        if (turmaId && dataAula) {
          await supabase
            .from('avaliacoes_competencia')
            .delete()
            .eq('turma_id', turmaId)
            .eq('data', dataAula);
        }
      }

      const provas = (aulasRows || []).filter((a) => (a as AulaRowMin).tipo_aula === 'prova_final') as AulaRowMin[];
      if (provas.length > 0) {
        const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
        await sp
          .from('avaliacoes_prova_final')
          .delete()
          .in('aula_id', provas.map((p) => p.id));
        for (const p of provas) {
          const turmaId = p.turma_id;
          const dataAula = p.data;
          if (turmaId && dataAula) {
            await sp
              .from('avaliacoes_prova_final')
              .delete()
              .eq('turma_id', turmaId)
              .eq('data_prova', dataAula);
          }
        }
      }

      const { error } = await supabase
        .from('aulas')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `${ids.length} aula${ids.length > 1 ? 's' : ''} excluída${ids.length > 1 ? 's' : ''} com sucesso.`,
      });

      // Recarregar a lista
      await recarregarAulas();

    } catch (error) {
      console.error('Erro ao excluir aulas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir aulas selecionadas.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast, recarregarAulas]);

  // Carrega dados iniciais
  useEffect(() => {
    buscarAulas();
    carregarDadosFiltros();
  }, [buscarAulas, carregarDadosFiltros]);

  return {
    aulas,
    turmas,
    professores,
    loading,
    error,
    totalAulas,
    recarregarAulas,
    excluirAula,
    excluirMultiplasAulas,
    buscarAulas,
    carregarDadosFiltros,
  };
};
