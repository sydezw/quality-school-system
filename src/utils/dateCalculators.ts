/**
 * Calcula a próxima data de vencimento baseada na primeira parcela
 * Mantém o mesmo dia da primeira parcela, ajustando para dias inexistentes no mês
 */
export const calcularProximaDataVencimento = (primeiraParcela: Date, parcelaAtual: Date): string => {
  const diaPrimeiraParcela = primeiraParcela.getDate();
  const mesAtual = parcelaAtual.getMonth();
  const anoAtual = parcelaAtual.getFullYear();
  
  // Próximo mês
  let proximoMes = mesAtual + 1;
  let proximoAno = anoAtual;
  
  // Se passou de dezembro, vai para janeiro do próximo ano
  if (proximoMes > 11) {
    proximoMes = 0;
    proximoAno++;
  }
  
  // Tentar usar o dia da primeira parcela
  let diaVencimento = diaPrimeiraParcela;
  
  // Verificar se o dia existe no próximo mês
  const ultimoDiaDoMes = new Date(proximoAno, proximoMes + 1, 0).getDate();
  
  // Se o dia não existe no mês (ex: 31 em fevereiro), usar o último dia do mês
  if (diaVencimento > ultimoDiaDoMes) {
    diaVencimento = ultimoDiaDoMes;
  }
  
  const proximaData = new Date(proximoAno, proximoMes, diaVencimento);
  return proximaData.toISOString().split('T')[0];
};

/**
 * Encontra a primeira parcela de um registro financeiro para usar como referência
 */
export const encontrarPrimeiraParcela = (parcelas: any[]): Date | null => {
  if (!parcelas || parcelas.length === 0) return null;
  
  // Ordenar por data de vencimento (mais antiga primeiro)
  const parcelasOrdenadas = [...parcelas].sort((a, b) => 
    new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
  );
  
  return new Date(parcelasOrdenadas[0].data_vencimento);
};