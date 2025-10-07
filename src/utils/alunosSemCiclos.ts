import { supabase } from '@/integrations/supabase/client';

interface AlunoSemCiclo {
  id: string;
  nome: string;
  financeiro_id?: string | null;
}

/**
 * Busca todos os alunos que não possuem ciclos ativos
 * Inclui:
 * 1. Alunos que não têm registros em alunos_financeiro
 * 2. Alunos que têm parcelas mas sem inicio_ciclo e final_ciclo definidos
 */
export const buscarAlunosSemCiclos = async (): Promise<AlunoSemCiclo[]> => {
  try {
    // Primeiro, buscar todos os alunos ativos
    const { data: todosAlunos, error: errorAlunos } = await supabase
      .from('alunos')
      .select('id, nome')
      .eq('status', 'Ativo');

    if (errorAlunos) {
      console.error('Erro ao buscar alunos:', errorAlunos);
      return [];
    }

    if (!todosAlunos || todosAlunos.length === 0) {
      return [];
    }

    // Buscar alunos ativos que têm parcelas com ciclos definidos (parcelas ativas em ciclos)
    const { data: alunosComCiclos, error: errorCiclos } = await supabase
      .from('alunos_parcelas')
      .select(`
        alunos_financeiro_id,
        alunos_financeiro!inner (
          aluno_id,
          alunos!inner (
            id,
            status
          )
        )
      `)
      .not('inicio_ciclo', 'is', null)
      .not('final_ciclo', 'is', null)
      .eq('historico', false)
      .eq('alunos_financeiro.alunos.status', 'Ativo');

    if (errorCiclos) {
      console.error('Erro ao buscar alunos com ciclos:', errorCiclos);
      return [];
    }

    // Extrair IDs dos alunos ativos que têm ciclos ativos
    const idsAlunosComCiclos = new Set(
      alunosComCiclos?.map(item => item.alunos_financeiro?.aluno_id).filter(Boolean) || []
    );

    // Buscar alunos que têm parcelas mas sem ciclos (parcelas disponíveis para formar ciclos)
    const { data: alunosComParcelasSemCiclos, error: errorParcelasSemCiclos } = await supabase
      .from('alunos_parcelas')
      .select(`
        alunos_financeiro_id,
        alunos_financeiro!inner (
          aluno_id,
          alunos!inner (
            id,
            status
          )
        )
      `)
      .is('inicio_ciclo', null)
      .is('final_ciclo', null)
      .eq('historico', false)
      .neq('tipo_item', 'avulso')
      .eq('alunos_financeiro.alunos.status', 'Ativo');

    if (errorParcelasSemCiclos) {
      console.error('Erro ao buscar alunos com parcelas sem ciclos:', errorParcelasSemCiclos);
      return [];
    }

    // Extrair IDs dos alunos que têm parcelas disponíveis para ciclos
    const idsAlunosComParcelasSemCiclos = new Set(
      alunosComParcelasSemCiclos?.map(item => item.alunos_financeiro?.aluno_id).filter(Boolean) || []
    );

    // Filtrar alunos que:
    // 1. Não têm ciclos ativos OU
    // 2. Têm parcelas disponíveis para formar novos ciclos
    const alunosSemCiclos = todosAlunos.filter(aluno => 
      !idsAlunosComCiclos.has(aluno.id) || idsAlunosComParcelasSemCiclos.has(aluno.id)
    );

    console.log(`Total de alunos ativos: ${todosAlunos.length}`);
    console.log(`Alunos ativos com ciclos: ${idsAlunosComCiclos.size}`);
    console.log(`Alunos com parcelas sem ciclos: ${idsAlunosComParcelasSemCiclos.size}`);
    console.log(`Alunos sem ciclos (total): ${alunosSemCiclos.length}`);

    // Buscar os IDs financeiros para os alunos sem ciclos
    const alunosComFinanceiroIds = await Promise.all(
      alunosSemCiclos.map(async (aluno) => {
        const { data: financeiroData } = await supabase
          .from('alunos_financeiro')
          .select('id')
          .eq('aluno_id', aluno.id)
          .single();
        
        return {
          id: aluno.id,
          nome: aluno.nome,
          financeiro_id: financeiroData?.id || null
        };
      })
    );

    // Retornar TODOS os alunos sem ciclos, incluindo os que não têm registro financeiro
    // Alunos sem registro financeiro também são "alunos sem ciclos" por definição
    return alunosComFinanceiroIds;

  } catch (error) {
    console.error('Erro ao buscar alunos sem ciclos:', error);
    return [];
  }
};