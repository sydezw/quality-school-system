import { adicionarMesesSeguro, calcularDiferencaEmMeses, criarDataDeString, formatarDataParaISO } from '@/utils/dateUtils';

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
export const encontrarPrimeiraParcela = (parcelas: any[]): Date | null => {
  if (!parcelas || parcelas.length === 0) return null;
  
  // Ordenar por data de vencimento (mais antiga primeiro)
  const parcelasOrdenadas = [...parcelas].sort((a, b) => 
    criarDataDeString(a.data_vencimento).getTime() - criarDataDeString(b.data_vencimento).getTime()
  );
  
  return criarDataDeString(parcelasOrdenadas[0].data_vencimento);
};