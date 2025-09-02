import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Aula = Tables<'aulas'>;
type Turma = Tables<'turmas'>;
type Usuario = Tables<'usuarios'>;

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
  }, [toast]);

  /**
   * Carrega dados para os filtros (turmas e professores)
   */
  const carregarDadosFiltros = useCallback(async () => {
    try {
      // Carregar turmas
      const { data: turmasData, error: turmasError } = await supabase
        .from('turmas')
        .select('*')
        .order('nome');

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
  }, [toast]);

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