import { supabase } from '@/integrations/supabase/client';

export type TipoItem = 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';

export interface ParcelaData {
  registro_financeiro_id: string;
  valor: number;
  data_vencimento: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  tipo_item: TipoItem;
  descricao_item?: string;
  forma_pagamento?: string;
  idioma_registro: 'Inglês' | 'Japonês';
}

export interface ParcelaComNumero extends ParcelaData {
  numero_parcela: number;
}

/**
 * Busca o próximo número de parcela para um tipo específico de item
 */
export const getProximoNumeroParcela = async (
  registroFinanceiroId: string,
  tipoItem: TipoItem
): Promise<number> => {
  try {
    const { data: parcelas, error } = await supabase
      .from('parcelas_alunos')
      .select('numero_parcela')
      .eq('registro_financeiro_id', registroFinanceiroId)
      .eq('tipo_item', tipoItem)
      .order('numero_parcela', { ascending: false })
      .limit(1);

    if (error) throw error;

    // Se não há parcelas deste tipo, começa do 1
    if (!parcelas || parcelas.length === 0) {
      return 1;
    }

    // Retorna o próximo número
    return parcelas[0].numero_parcela + 1;
  } catch (error) {
    console.error('Erro ao buscar próximo número de parcela:', error);
    return 1; // Fallback para 1 em caso de erro
  }
};

/**
 * Cria parcelas com numeração correta por tipo de item
 */
export const criarParcelasComNumeracaoCorreta = async (
  registroFinanceiroId: string,
  parcelasData: {
    plano?: { valor: number; numParcelas: number; dataBase: Date; formaPagamento?: string; descricao?: string };
    matricula?: { valor: number; numParcelas: number; dataBase: Date; formaPagamento?: string; descricao?: string };
    material?: { valor: number; numParcelas: number; dataBase: Date; formaPagamento?: string; descricao?: string };
  },
  idiomaRegistro: 'Inglês' | 'Japonês' = 'Inglês'
): Promise<ParcelaComNumero[]> => {
  const parcelas: ParcelaComNumero[] = [];

  // Ordem de criação: matrícula, material, plano (conforme solicitado)
  const tiposOrdenados: Array<{ tipo: TipoItem; dados: any; descricaoPadrao: string }> = [
    { tipo: 'matrícula', dados: parcelasData.matricula, descricaoPadrao: 'Taxa de matrícula' },
    { tipo: 'material', dados: parcelasData.material, descricaoPadrao: 'Material didático' },
    { tipo: 'plano', dados: parcelasData.plano, descricaoPadrao: 'Plano de aulas' }
  ];

  for (const { tipo, dados, descricaoPadrao } of tiposOrdenados) {
    if (!dados || dados.valor <= 0) continue;

    // Buscar o próximo número para este tipo específico
    const proximoNumero = await getProximoNumeroParcela(registroFinanceiroId, tipo);
    const valorParcela = dados.valor / dados.numParcelas;

    for (let i = 0; i < dados.numParcelas; i++) {
      const dataVencimento = new Date(dados.dataBase);
      dataVencimento.setMonth(dataVencimento.getMonth() + i);

      parcelas.push({
        registro_financeiro_id: registroFinanceiroId,
        numero_parcela: proximoNumero + i, // Numeração específica por tipo
        valor: valorParcela,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status_pagamento: 'pendente',
        tipo_item: tipo,
        descricao_item: dados.descricao || descricaoPadrao,
        forma_pagamento: dados.formaPagamento,
        idioma_registro: idiomaRegistro
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
export const buscarParcelasOrdenadas = async (registroFinanceiroId: string): Promise<any[]> => {
  try {
    const { data: parcelas, error } = await supabase
      .from('parcelas_alunos')
      .select('*')
      .eq('registro_financeiro_id', registroFinanceiroId);

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
  registroFinanceiroId: string,
  tipoItem: TipoItem,
  dadosParcela: Omit<ParcelaData, 'registro_financeiro_id' | 'tipo_item'>
): Promise<ParcelaComNumero | null> => {
  try {
    const proximoNumero = await getProximoNumeroParcela(registroFinanceiroId, tipoItem);
    
    const novaParcela: ParcelaComNumero = {
      ...dadosParcela,
      registro_financeiro_id: registroFinanceiroId,
      tipo_item: tipoItem,
      numero_parcela: proximoNumero
    };

    const { data, error } = await supabase
      .from('parcelas_alunos')
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