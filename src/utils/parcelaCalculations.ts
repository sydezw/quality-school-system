import { adicionarMesesSeguro, calcularDiferencaEmMeses, criarDataDeString, formatarDataParaISO } from '@/utils/dateUtils';

/**
 * Interface para representar uma parcela básica
 */
export interface ParcelaBasica {
  id: number | string;
  tipo_item: string;
  registro_financeiro_id: string;
  data_vencimento: string;
  valor: number;
  status_pagamento: string;
}

/**
 * Calcula o número sequencial da parcela por tipo de item
 * Esta função é usada para determinar se uma parcela é "1/3", "2/3", etc.
 */
export const calcularNumeroPorTipo = <T extends ParcelaBasica>(
  parcelaAtual: T, 
  todasParcelas: T[]
): number => {
  // Filtrar parcelas do mesmo tipo de item e mesmo registro financeiro
  const parcelasMesmoTipo = todasParcelas.filter(p => 
    p.tipo_item === parcelaAtual.tipo_item && 
    p.registro_financeiro_id === parcelaAtual.registro_financeiro_id
  );
  
  // Ordenar por data de vencimento e depois por ID
  const parcelasOrdenadas = parcelasMesmoTipo.sort((a, b) => {
    const dataA = criarDataDeString(a.data_vencimento);
    const dataB = criarDataDeString(b.data_vencimento);
    if (dataA.getTime() !== dataB.getTime()) {
      return dataA.getTime() - dataB.getTime();
    }
    // Converter IDs para número para comparação consistente
    const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
    const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
    return idA - idB;
  });
  
  // Encontrar a posição da parcela atual na lista ordenada
  const posicao = parcelasOrdenadas.findIndex(p => p.id === parcelaAtual.id);
  return posicao + 1; // +1 porque queremos começar de 1, não de 0
};

/**
 * Calcula a próxima data de vencimento baseada na primeira parcela
 * Mantém o mesmo dia da primeira parcela, ajustando para dias inexistentes no mês
 */
export const calcularProximaDataVencimento = (primeiraParcela: Date, parcelaAtual: Date): string => {
  // Calcular quantos meses se passaram desde a primeira parcela
  const mesesDiferenca = calcularDiferencaEmMeses(primeiraParcela, parcelaAtual);
  
  // Adicionar um mês à diferença atual
  const proximaData = adicionarMesesSeguro(primeiraParcela, mesesDiferenca + 1);
  
  return formatarDataParaISO(proximaData);
};

/**
 * Encontra a primeira parcela de um registro financeiro para usar como referência
 */
export const encontrarPrimeiraParcela = <T extends ParcelaBasica>(parcelas: T[]): Date | null => {
  if (!parcelas || parcelas.length === 0) return null;
  
  // Ordenar por data de vencimento (mais antiga primeiro)
  const parcelasOrdenadas = [...parcelas].sort((a, b) => 
    criarDataDeString(a.data_vencimento).getTime() - criarDataDeString(b.data_vencimento).getTime()
  );
  
  return criarDataDeString(parcelasOrdenadas[0].data_vencimento);
};

/**
 * Calcula métricas financeiras de um conjunto de parcelas
 */
export const calcularMetricasParcelas = <T extends ParcelaBasica>(parcelas: T[]) => {
  const hoje = new Date();
  
  const parcelasPagas = parcelas.filter(p => p.status_pagamento === 'pago');
  const parcelasPendentes = parcelas.filter(p => p.status_pagamento === 'pendente');
  const parcelasVencidas = parcelas.filter(p => {
    const dataVencimento = criarDataDeString(p.data_vencimento);
    return dataVencimento < hoje && p.status_pagamento !== 'pago';
  });
  
  const valorTotal = parcelas.reduce((total, p) => total + p.valor, 0);
  const valorPago = parcelasPagas.reduce((total, p) => total + p.valor, 0);
  const valorPendente = parcelasPendentes.reduce((total, p) => total + p.valor, 0);
  const valorEmAtraso = parcelasVencidas.reduce((total, p) => total + p.valor, 0);
  
  const progresso = parcelas.length > 0 ? (parcelasPagas.length / parcelas.length) * 100 : 0;
  
  return {
    totalParcelas: parcelas.length,
    parcelasPagas: parcelasPagas.length,
    parcelasPendentes: parcelasPendentes.length,
    parcelasVencidas: parcelasVencidas.length,
    valorTotal,
    valorPago,
    valorPendente,
    valorEmAtraso,
    progresso
  };
};

/**
 * Calcula próximos vencimentos dentro de um período específico
 */
export const calcularProximosVencimentos = <T extends ParcelaBasica>(
  parcelas: T[], 
  diasAdiante: number = 30
) => {
  const hoje = new Date();
  const dataLimite = new Date();
  dataLimite.setDate(hoje.getDate() + diasAdiante);
  
  return parcelas
    .filter(parcela => {
      const dataVencimento = criarDataDeString(parcela.data_vencimento);
      return (
        parcela.status_pagamento !== 'pago' &&
        dataVencimento >= hoje &&
        dataVencimento <= dataLimite
      );
    })
    .map(parcela => {
      const dataVencimento = criarDataDeString(parcela.data_vencimento);
      const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...parcela,
        diasRestantes
      };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
};

/**
 * Verifica se uma parcela é a última do mesmo tipo em um registro financeiro
 */
export const isUltimaParcelaMesmoTipo = <T extends ParcelaBasica>(
  parcelaAtual: T,
  todasParcelas: T[]
): boolean => {
  const parcelasMesmoTipo = todasParcelas.filter(p => 
    p.tipo_item === parcelaAtual.tipo_item && 
    p.registro_financeiro_id === parcelaAtual.registro_financeiro_id
  );
  
  // Ordenar por data de vencimento (mais recente primeiro)
  const parcelasOrdenadas = parcelasMesmoTipo.sort((a, b) => 
    criarDataDeString(b.data_vencimento).getTime() - criarDataDeString(a.data_vencimento).getTime()
  );
  
  return parcelasOrdenadas[0]?.id === parcelaAtual.id;
};