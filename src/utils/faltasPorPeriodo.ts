import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para estatísticas de faltas por período
 */
export interface FaltasPorPeriodo {
  totalFaltas: number;
  faltasRepostas: number;
  faltasNaoRepostas: number;
  percentualPresenca: number;
  totalAulasRealizadas: number;
  periodoInicio: string | null;
  periodoFim: string | null;
  periodoConfigurado: boolean;
  mensagemStatus: string;
}

/**
 * Interface para dados da turma necessários para o cálculo
 */
interface DadosTurma {
  id: string;
  nome: string;
  data_inicio: string | null;
  data_fim: string | null;
  total_aulas: number | null;
  aulas_por_semana: number | null;
}

/**
 * Calcula as faltas de um aluno em uma turma específica
 * baseado no período configurado da turma
 * 
 * @param alunoId - ID do aluno
 * @param turmaId - ID da turma
 * @returns Estatísticas de faltas por período
 */
export async function calcularFaltasPorPeriodo(
  alunoId: string, 
  turmaId: string
): Promise<FaltasPorPeriodo> {
  try {
    // 1. Buscar dados da turma
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('id, nome, data_inicio, data_fim, total_aulas, aulas_por_semana')
      .eq('id', turmaId)
      .single();

    if (turmaError) throw turmaError;

    const dadosTurma = turma as DadosTurma;

    // 2. Verificar se a turma tem período configurado
    if (!dadosTurma.data_inicio || !dadosTurma.data_fim) {
      return {
        totalFaltas: 0,
        faltasRepostas: 0,
        faltasNaoRepostas: 0,
        percentualPresenca: 0,
        totalAulasRealizadas: 0,
        periodoInicio: null,
        periodoFim: null,
        periodoConfigurado: false,
        mensagemStatus: 'Período da turma não configurado'
      };
    }

    // 3. Buscar presenças do aluno no período da turma
    const { data: presencas, error: presencasError } = await supabase
      .from('presencas')
      .select(`
        id,
        status,
        aula_id,
        aluno_id,
        aulas!inner (
          id,
          data,
          turma_id,
          status
        )
      `)
      .eq('aluno_id', alunoId)
      .eq('aulas.turma_id', turmaId)
      .gte('aulas.data', dadosTurma.data_inicio)
      .lte('aulas.data', dadosTurma.data_fim)
      .eq('aulas.status', 'concluida'); // Apenas aulas concluídas

    if (presencasError) throw presencasError;

    // 4. Calcular estatísticas
    const totalAulasRealizadas = presencas?.length || 0;
    const faltas = presencas?.filter(p => p.status === 'Falta') || [];
    const faltasRepostas = presencas?.filter(p => p.status === 'Reposta') || [];
    const presentes = presencas?.filter(p => p.status === 'Presente') || [];

    const totalFaltas = faltas.length;
    const faltasRepostasCount = faltasRepostas.length;
    const faltasNaoRepostas = totalFaltas - faltasRepostasCount;
    
    // Calcular percentual de presença
    const percentualPresenca = totalAulasRealizadas > 0 
      ? ((presentes.length + faltasRepostasCount) / totalAulasRealizadas) * 100 
      : 0;

    // 5. Formatar período para exibição
    const periodoInicio = dadosTurma.data_inicio;
    const periodoFim = dadosTurma.data_fim;
    const dataInicioFormatada = new Date(periodoInicio).toLocaleDateString('pt-BR');
    const dataFimFormatada = new Date(periodoFim).toLocaleDateString('pt-BR');

    return {
      totalFaltas,
      faltasRepostas: faltasRepostasCount,
      faltasNaoRepostas,
      percentualPresenca: Math.round(percentualPresenca * 100) / 100,
      totalAulasRealizadas,
      periodoInicio,
      periodoFim,
      periodoConfigurado: true,
      mensagemStatus: `Faltas do semestre (${dataInicioFormatada} - ${dataFimFormatada})`
    };

  } catch (error) {
    console.error('Erro ao calcular faltas por período:', error);
    return {
      totalFaltas: 0,
      faltasRepostas: 0,
      faltasNaoRepostas: 0,
      percentualPresenca: 0,
      totalAulasRealizadas: 0,
      periodoInicio: null,
      periodoFim: null,
      periodoConfigurado: false,
      mensagemStatus: 'Erro ao calcular faltas'
    };
  }
}

/**
 * Calcula as faltas de um aluno considerando todas as suas turmas
 * 
 * @param alunoId - ID do aluno
 * @returns Array com estatísticas de faltas por turma
 */
export async function calcularFaltasTodasTurmas(alunoId: string): Promise<FaltasPorPeriodo[]> {
  try {
    // Buscar todas as turmas do aluno
    const { data: matriculas, error: matriculasError } = await supabase
      .from('aluno_turma')
      .select(`
        turma_id,
        turmas (
          id,
          nome,
          data_inicio,
          data_fim,
          total_aulas,
          aulas_por_semana
        )
      `)
      .eq('aluno_id', alunoId);

    if (matriculasError) throw matriculasError;

    // Calcular faltas para cada turma
    const resultados: FaltasPorPeriodo[] = [];
    
    for (const matricula of matriculas || []) {
      if (matricula.turmas) {
        const faltasTurma = await calcularFaltasPorPeriodo(alunoId, matricula.turmas.id);
        resultados.push(faltasTurma);
      }
    }

    return resultados;

  } catch (error) {
    console.error('Erro ao calcular faltas de todas as turmas:', error);
    return [];
  }
}

/**
 * Verifica se uma turma tem período configurado
 * 
 * @param turmaId - ID da turma
 * @returns Boolean indicando se o período está configurado
 */
export async function verificarPeriodoTurma(turmaId: string): Promise<boolean> {
  try {
    const { data: turma, error } = await supabase
      .from('turmas')
      .select('data_inicio, data_fim')
      .eq('id', turmaId)
      .single();

    if (error) throw error;

    return !!(turma?.data_inicio && turma?.data_fim);
  } catch (error) {
    console.error('Erro ao verificar período da turma:', error);
    return false;
  }
}

/**
 * Formata a mensagem de status das faltas para exibição
 * 
 * @param faltasPeriodo - Dados das faltas por período
 * @returns String formatada para exibição
 */
export function formatarMensagemFaltas(faltasPeriodo: FaltasPorPeriodo): string {
  if (!faltasPeriodo.periodoConfigurado) {
    return faltasPeriodo.mensagemStatus;
  }

  const { totalFaltas, mensagemStatus } = faltasPeriodo;
  return `${mensagemStatus}: ${totalFaltas} falta${totalFaltas !== 1 ? 's' : ''}`;
}