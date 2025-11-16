import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { adicionarMesesSeguro } from '@/utils/dateUtils';

type ParcelaInsert = Database['public']['Tables']['alunos_parcelas']['Insert'];
export type TipoItem = Database['public']['Enums']['tipo_item'];

export interface ParcelaData {
  alunos_financeiro_id: string;
  valor: number;
  data_vencimento: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  tipo_item: TipoItem;
  descricao_item?: string;
  forma_pagamento?: string;
  idioma_registro: 'Inglês' | 'Japonês';
  observacoes?: string;
}

export interface ParcelaComNumero extends ParcelaData {
  numero_parcela: number;
  nome_aluno?: string | null;
  observacoes?: string;
}

// Função utilitária para converter ID de financeiro_alunos para alunos_financeiro
const converterParaAlunosFinanceiroId = async (id: string): Promise<string> => {
  // Verificar se o ID é da tabela financeiro_alunos e converter
  const { data: registroFinanceiroAlunos } = await supabase
    .from('financeiro_alunos')
    .select('aluno_id')
    .eq('id', id)
    .single();
  
  if (registroFinanceiroAlunos) {
    // Buscar o ID correspondente na alunos_financeiro (pegando o mais recente e não arquivado)
    const { data: alunosFinanceiroList, error: alunosFinanceiroError } = await supabase
      .from('alunos_financeiro')
      .select('id, status_geral, created_at')
      .eq('aluno_id', registroFinanceiroAlunos.aluno_id)
      .neq('status_geral', 'Arquivado')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (alunosFinanceiroError) {
      console.error('Erro ao buscar alunos_financeiro:', alunosFinanceiroError);
    }
    const alunosFinanceiro = Array.isArray(alunosFinanceiroList) && alunosFinanceiroList.length > 0 ? alunosFinanceiroList[0] : null;
    if (alunosFinanceiro) {
      return alunosFinanceiro.id as string;
    }
  }
  
  // Se não encontrou conversão, retorna o ID original
  return id;
};

/**
 * Busca o próximo número de parcela para um tipo específico de item
 */
export const getProximoNumeroParcela = async (
  alunosFinanceiroId: string,
  tipoItem: TipoItem
): Promise<number> => {
  try {
    // Validar se o alunosFinanceiroId é válido
    if (!alunosFinanceiroId || alunosFinanceiroId === 'undefined' || alunosFinanceiroId.trim() === '') {
      throw new Error('ID do alunos_financeiro é obrigatório e não pode estar vazio');
    }
    
    // Converter o ID se necessário (de financeiro_alunos para alunos_financeiro)
    const alunosFinanceiroIdCorreto = await converterParaAlunosFinanceiroId(alunosFinanceiroId);
    
    console.log('Buscando próximo número para:', { alunosFinanceiroId: alunosFinanceiroIdCorreto, tipoItem });
    
    const { data: parcelas, error } = await supabase
      .from('alunos_parcelas')
      .select('numero_parcela')
      .eq('alunos_financeiro_id', alunosFinanceiroIdCorreto)
      .eq('tipo_item', tipoItem)
      .order('numero_parcela', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro na query getProximoNumeroParcela:', error);
      throw error;
    }

    console.log('Resultado da query:', parcelas);

    // Se não há parcelas deste tipo, começa do 1
    if (!parcelas || parcelas.length === 0) {
      console.log('Nenhuma parcela encontrada, retornando 1');
      return 1;
    }

    // Retorna o próximo número
    const proximoNumero = parcelas[0].numero_parcela + 1;
    console.log('Próximo número calculado:', proximoNumero);
    return proximoNumero;
  } catch (error) {
    console.error('Erro ao buscar próximo número de parcela:', error);
    return 1; // Fallback para 1 em caso de erro
  }
};

/**
 * Cria parcelas com numeração correta por tipo de item
 */
export const criarParcelasComNumeracaoCorreta = async (
  alunosFinanceiroId: string,
  parcelasData: {
    plano?: { valor: number; numParcelas: number; dataBase: Date; formaPagamento?: string; descricao?: string; observacoes?: string };
    matricula?: { valor: number; numParcelas: number; dataBase: Date; formaPagamento?: string; descricao?: string; observacoes?: string };
    material?: { valor: number; numParcelas: number; dataBase: Date; formaPagamento?: string; descricao?: string; observacoes?: string };
  },
  idiomaRegistro: 'Inglês' | 'Japonês' = 'Inglês'
): Promise<ParcelaComNumero[]> => {
  const parcelas: ParcelaComNumero[] = [];
  
  // Converter o ID se necessário (de financeiro_alunos para alunos_financeiro)
  let alunosFinanceiroIdCorreto = alunosFinanceiroId;
  let nomeAluno = null;
  
  // Tentar buscar na tabela financeiro_alunos primeiro (caso comum)
  const { data: registroFinanceiroAlunos, error: errorFinanceiroAlunos } = await supabase
    .from('financeiro_alunos')
    .select(`
      aluno_id,
      alunos!inner(nome)
    `)
    .eq('id', alunosFinanceiroId)
    .single();
  
  if (registroFinanceiroAlunos && !errorFinanceiroAlunos) {
    // Se encontrou na financeiro_alunos, buscar o ID correspondente na alunos_financeiro (pegando o mais recente e não arquivado)
    const { data: alunosFinanceiroList, error: errorAlunosFinanceiro } = await supabase
      .from('alunos_financeiro')
      .select('id, status_geral, created_at')
      .eq('aluno_id', registroFinanceiroAlunos.aluno_id)
      .neq('status_geral', 'Arquivado')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const alunosFinanceiro = Array.isArray(alunosFinanceiroList) && alunosFinanceiroList.length > 0 ? alunosFinanceiroList[0] : null;
    if (alunosFinanceiro && !errorAlunosFinanceiro) {
      alunosFinanceiroIdCorreto = (alunosFinanceiro.id as string);
      nomeAluno = registroFinanceiroAlunos.alunos?.nome || null;
    }
  } else {
    // Se não encontrou na financeiro_alunos, tentar buscar diretamente na alunos_financeiro
    const { data: registroAlunosFinanceiro, error: errorAlunosFinanceiro } = await supabase
      .from('alunos_financeiro')
      .select(`
        alunos!inner(nome)
      `)
      .eq('id', alunosFinanceiroId)
      .single();
    
    if (registroAlunosFinanceiro && !errorAlunosFinanceiro) {
      nomeAluno = registroAlunosFinanceiro.alunos?.nome || null;
    }
  }

  // Ordem de criação: matrícula, material, plano (conforme solicitado)
  const tiposOrdenados: Array<{ tipo: TipoItem; dados: any; descricaoPadrao: string }> = [
    { tipo: 'matrícula', dados: parcelasData.matricula, descricaoPadrao: 'Taxa de matrícula' },
    { tipo: 'material', dados: parcelasData.material, descricaoPadrao: 'Material didático' },
    { tipo: 'plano', dados: parcelasData.plano, descricaoPadrao: 'Plano de aulas' }
  ];

  for (const { tipo, dados, descricaoPadrao } of tiposOrdenados) {
    if (!dados || dados.valor <= 0) continue;

    // Buscar o próximo número para este tipo específico
    const proximoNumero = await getProximoNumeroParcela(alunosFinanceiroIdCorreto, tipo);
    const valorParcela = dados.valor / dados.numParcelas;

    for (let i = 0; i < dados.numParcelas; i++) {
      // Função segura para adicionar meses mantendo o dia correto
      const dataVencimento = adicionarMesesSeguro(dados.dataBase, i);

      parcelas.push({
        alunos_financeiro_id: alunosFinanceiroIdCorreto,
        numero_parcela: proximoNumero + i, // Numeração específica por tipo
        valor: valorParcela,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status_pagamento: 'pendente',
        tipo_item: tipo,
        descricao_item: dados.descricao || descricaoPadrao,
        forma_pagamento: dados.formaPagamento,
        idioma_registro: idiomaRegistro,
        nome_aluno: nomeAluno,
        observacoes: dados.observacoes
      });
    }
  }

  return parcelas;
};

/**
 * Ordena parcelas por tipo (matrícula, material, plano) e depois por número da parcela
 */
export const ordenarParcelasPorTipoENumero = (parcelas: any[]): any[] => {
  const ordemTipos: Record<TipoItem, number> = {
    'matrícula': 1,
    'material': 2,
    'plano': 3,
    'cancelamento': 4,
    'outros': 5
  };

  return parcelas.sort((a, b) => {
    // Primeiro ordena por tipo
    const ordemA = ordemTipos[a.tipo_item] || 999;
    const ordemB = ordemTipos[b.tipo_item] || 999;
    
    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }
    
    // Depois ordena por número da parcela
    return a.numero_parcela - b.numero_parcela;
  });
};

/**
 * Busca todas as parcelas de um registro e as ordena corretamente
 */
export const buscarParcelasOrdenadas = async (alunosFinanceiroId: string): Promise<any[]> => {
  try {
    // Converter o ID se necessário (de financeiro_alunos para alunos_financeiro)
    const alunosFinanceiroIdCorreto = await converterParaAlunosFinanceiroId(alunosFinanceiroId);
    
    const { data: parcelas, error } = await supabase
      .from('alunos_parcelas')
      .select('*')
      .eq('alunos_financeiro_id', alunosFinanceiroIdCorreto);

    if (error) throw error;

    return ordenarParcelasPorTipoENumero(parcelas || []);
  } catch (error) {
    console.error('Erro ao buscar parcelas ordenadas:', error);
    return [];
  }
};

/**
 * Cria uma nova parcela com numeração correta para o tipo específico
 */
export const criarNovaParcela = async (
  alunosFinanceiroId: string,
  tipoItem: TipoItem,
  dadosParcela: Omit<ParcelaData, 'alunos_financeiro_id' | 'tipo_item'>
): Promise<ParcelaComNumero | null> => {
  try {
    // Primeiro, verificar se o ID fornecido é da tabela financeiro_alunos e converter para alunos_financeiro
    let alunosFinanceiroIdCorreto = alunosFinanceiroId;
    let nomeAluno = null;
    
    // Tentar buscar na tabela financeiro_alunos primeiro (caso comum)
    const { data: registroFinanceiroAlunos, error: errorFinanceiroAlunos } = await supabase
      .from('financeiro_alunos')
      .select(`
        aluno_id,
        alunos!inner(nome)
      `)
      .eq('id', alunosFinanceiroId)
      .single();
    
    if (registroFinanceiroAlunos && !errorFinanceiroAlunos) {
      // Se encontrou na financeiro_alunos, buscar o ID correspondente na alunos_financeiro (pegando o mais recente e não arquivado)
      const { data: alunosFinanceiroList, error: errorAlunosFinanceiro } = await supabase
        .from('alunos_financeiro')
        .select('id, status_geral, created_at')
        .eq('aluno_id', registroFinanceiroAlunos.aluno_id)
        .neq('status_geral', 'Arquivado')
        .order('created_at', { ascending: false })
        .limit(1);
      
      const alunosFinanceiro = Array.isArray(alunosFinanceiroList) && alunosFinanceiroList.length > 0 ? alunosFinanceiroList[0] : null;
      if (alunosFinanceiro && !errorAlunosFinanceiro) {
        alunosFinanceiroIdCorreto = (alunosFinanceiro.id as string);
        nomeAluno = registroFinanceiroAlunos.alunos?.nome || null;
      } else {
        console.error('Erro ao buscar ID na tabela alunos_financeiro:', errorAlunosFinanceiro);
        throw new Error('Registro financeiro não encontrado na tabela alunos_financeiro');
      }
    } else {
      // Se não encontrou na financeiro_alunos, tentar buscar diretamente na alunos_financeiro
      const { data: registroAlunosFinanceiro, error: errorAlunosFinanceiro } = await supabase
        .from('alunos_financeiro')
        .select(`
          alunos!inner(nome)
        `)
        .eq('id', alunosFinanceiroId)
        .single();
      
      if (registroAlunosFinanceiro && !errorAlunosFinanceiro) {
        nomeAluno = registroAlunosFinanceiro.alunos?.nome || null;
      } else {
        console.error('Erro ao buscar registro financeiro:', errorAlunosFinanceiro);
        throw new Error('Registro financeiro não encontrado em nenhuma das tabelas');
      }
    }
    
    const proximoNumero = await getProximoNumeroParcela(alunosFinanceiroIdCorreto, tipoItem);
    
    const novaParcela: ParcelaComNumero = {
      ...dadosParcela,
      alunos_financeiro_id: alunosFinanceiroIdCorreto,
      tipo_item: tipoItem,
      numero_parcela: proximoNumero,
      nome_aluno: nomeAluno
    };

    const { data, error } = await supabase
      .from('alunos_parcelas')
      .insert(novaParcela)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erro ao criar nova parcela:', error);
    return null;
  }
};