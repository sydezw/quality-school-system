/**
 * Utilitários para manipulação segura de datas
 * Resolve problemas comuns com cálculos de datas, especialmente com dias 31 e 1
 */

/**
 * Adiciona meses a uma data de forma segura, mantendo o dia correto
 * Resolve problemas com dias 31 e transições de mês
 * 
 * @param dataBase - Data base para o cálculo
 * @param mesesParaAdicionar - Número de meses para adicionar (pode ser negativo)
 * @returns Nova data com os meses adicionados
 * 
 * @example
 * // Para uma data 31/01/2024, adicionar 1 mês resultará em 29/02/2024 (ano bissexto)
 * const data = new Date(2024, 0, 31); // 31 de janeiro de 2024
 * const novaData = adicionarMesesSeguro(data, 1); // 29 de fevereiro de 2024
 * 
 * @example
 * // Para uma data 01/09/2024, adicionar 1 mês resultará em 01/10/2024
 * const data = new Date(2024, 8, 1); // 1 de setembro de 2024
 * const novaData = adicionarMesesSeguro(data, 1); // 1 de outubro de 2024
 */
export const adicionarMesesSeguro = (dataBase: Date, mesesParaAdicionar: number): Date => {
  const diaOriginal = dataBase.getDate();
  const mesOriginal = dataBase.getMonth();
  const anoOriginal = dataBase.getFullYear();
  
  // Calcular o novo mês e ano
  let novoMes = mesOriginal + mesesParaAdicionar;
  let novoAno = anoOriginal;
  
  // Ajustar ano se necessário
  while (novoMes > 11) {
    novoMes -= 12;
    novoAno++;
  }
  while (novoMes < 0) {
    novoMes += 12;
    novoAno--;
  }
  
  // Verificar se o dia original existe no novo mês
  const ultimoDiaDoNovoMes = new Date(novoAno, novoMes + 1, 0).getDate();
  const diaFinal = Math.min(diaOriginal, ultimoDiaDoNovoMes);
  
  return new Date(novoAno, novoMes, diaFinal);
};

/**
 * Calcula a diferença em meses entre duas datas
 * 
 * @param dataInicio - Data de início
 * @param dataFim - Data de fim
 * @returns Número de meses de diferença
 */
export const calcularDiferencaEmMeses = (dataInicio: Date, dataFim: Date): number => {
  return (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
         (dataFim.getMonth() - dataInicio.getMonth());
};

/**
 * Verifica se uma data é válida
 * 
 * @param data - Data para verificar
 * @returns true se a data for válida, false caso contrário
 */
export const isDataValida = (data: Date): boolean => {
  return data instanceof Date && !isNaN(data.getTime());
};

/**
 * Formata uma data para string no formato YYYY-MM-DD
 * 
 * @param data - Data para formatar
 * @returns String no formato YYYY-MM-DD
 */
export const formatarDataParaISO = (data: Date): string => {
  if (!isDataValida(data)) {
    throw new Error('Data inválida fornecida');
  }
  return data.toISOString().split('T')[0];
};

/**
 * Cria uma data a partir de uma string no formato YYYY-MM-DD
 * Evita problemas de timezone
 * 
 * @param dataString - String no formato YYYY-MM-DD
 * @returns Nova instância de Date
 */
export const criarDataDeString = (dataString: string): Date => {
  const [ano, mes, dia] = dataString.split('-').map(Number);
  return new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
};