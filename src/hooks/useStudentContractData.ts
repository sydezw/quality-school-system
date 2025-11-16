export interface Turma {
  id: string;
  nome: string;
  idioma?: string | null;
  nivel?: string | null;
  horario?: string | null;
  dias_da_semana?: string | null;
  tipo_turma?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  total_aulas?: number | null;
}

export interface Plano {
  id: string;
  nome: string;
  descricao?: string | null;
  valor_total?: number | null;
  idioma?: string | null;
  numero_aulas?: number | null;
  tipo_valor?: string | null;
  observacao?: string | null;
  observacoes?: string | null;
}

export interface FinanceiroAluno {
  id: string;
  aluno_id: string;
  // Compatibilidade antiga e nova nomenclatura
  plano_id?: string | null;      // antigo
  planos_id?: string | null;     // novo (alunos_financeiro)
  valor_plano: number | null;
  valor_material?: number | null;
  valor_matricula?: number | null;
  valor_total?: number | null;
  numero_parcelas_plano?: number | null;
  data_primeiro_vencimento?: string | null;
  ativo_ou_encerrado?: string | null; // antigo
  status?: string | null;             // legado em alguns ambientes
  status_geral?: string | null;       // atual no alunos_financeiro
  planos?: Plano | null;
  parcelas_alunos?: {
    id: string;
    numero_parcela: number;
    valor: number;
    data_vencimento?: string | null;
  }[] | null;
}

export interface Contrato {
  id: string;
  aluno_id: string | null;
  plano_id: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  valor_mensalidade: number | null;
  status_contrato: string | null;
  idioma_contrato: string | null;
  observacao: string | null;
  planos?: Plano | null;
}

export const getStudentTurmas = async (
  supabaseClient: any,
  alunoId: string
): Promise<{ turma_regular: Turma | null; turma_particular: Turma | null }> => {
  const { data, error } = await supabaseClient
    .from('alunos')
    .select(`
      id,
      turma_id,
      turma_particular_id,
      turma_regular:turmas!turma_id ( id, nome, idioma, nivel, horario, dias_da_semana, tipo_turma, data_inicio, data_fim, total_aulas ),
      turma_particular:turmas!turma_particular_id ( id, nome, idioma, nivel, horario, dias_da_semana, tipo_turma, data_inicio, data_fim, total_aulas )
    `)
    .eq('id', alunoId)
    .single();

  if (error) {
    console.error('Erro ao buscar turmas do aluno:', error);
    return { turma_regular: null, turma_particular: null };
  }

  return {
    turma_regular: (data as any)?.turma_regular || null,
    turma_particular: (data as any)?.turma_particular || null,
  };
};

export const getActiveContractWithPlan = async (
  supabaseClient: any,
  alunoId: string
): Promise<{ contractData: Contrato | null; planData: Plano | null }> => {
  const { data, error } = await supabaseClient
    .from('contratos')
    .select(`
      *,
      planos ( id, nome, descricao, valor_total, idioma, numero_aulas, tipo_valor, observacoes )
    `)
    .eq('aluno_id', alunoId)
    .in('status_contrato', ['Ativo', 'Agendado'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Erro ao buscar contrato do aluno:', error);
    return { contractData: null, planData: null };
  }

  const contrato = data && data.length > 0 ? (data[0] as any) : null;
  const plano = contrato?.planos || null;
  return { contractData: contrato, planData: plano };
};

export const getFinanceiroAluno = async (
  supabaseClient: any,
  alunoId: string
): Promise<{ financialData: FinanceiroAluno | null; planData: Plano | null }> => {
  const { data, error } = await supabaseClient
    .from('alunos_financeiro')
    .select(`
      *,
      planos ( id, nome, descricao, valor_total, idioma, numero_aulas, tipo_valor, observacoes ),
      parcelas_alunos:alunos_parcelas ( id, numero_parcela, valor, data_vencimento )
    `)
    .eq('aluno_id', alunoId)
    .neq('status_geral', 'Arquivado')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Erro ao buscar financeiro do aluno:', error);
    return { financialData: null, planData: null };
  }

  const record = Array.isArray(data) && data.length > 0 ? (data[0] as any) : null;
  const plano = record?.planos || null;
  return { financialData: record || null, planData: plano };
};

export const buildContractStudentData = async (student: any, supabaseClient: any) => {
  const alunoId = student?.id;
  if (!alunoId) return student;

  const [
    { turma_regular, turma_particular },
    { contractData, planData },
    { financialData, planData: planFromFinance },
  ] = await Promise.all([
    getStudentTurmas(supabaseClient, alunoId),
    getActiveContractWithPlan(supabaseClient, alunoId),
    getFinanceiroAluno(supabaseClient, alunoId),
  ]);

  return {
    ...student,
    turma_regular,
    turma_particular,
    contractData,
    planData: planData || planFromFinance || student?.planData || student?.plano || null,
    financialData: financialData || student?.financialData || student?.financeiro || null,
  };
};