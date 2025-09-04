/**
 * Testes para as funções de manipulação de datas
 * Foca especialmente nos casos problemáticos dos dias 1 e 31
 */

import { adicionarMesesSeguro, calcularDiferencaEmMeses, formatarDataParaISO } from './dateUtils';

// Função auxiliar para criar datas de forma consistente
const criarData = (ano: number, mes: number, dia: number): Date => {
  return new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11
};

// Função auxiliar para formatar data para comparação
const formatarData = (data: Date): string => {
  return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
};

console.log('=== TESTES DE CORREÇÃO DOS PROBLEMAS DE DATAS ===\n');

// Teste 1: Problema relatado - dia 01/09 com 5 parcelas
console.log('🧪 Teste 1: Primeiro vencimento 01/09/2024, 5 parcelas');
const dataBase1 = criarData(2024, 9, 1); // 01/09/2024
const parcelas1 = [];
for (let i = 0; i < 5; i++) {
  const novaData = adicionarMesesSeguro(dataBase1, i);
  parcelas1.push(formatarData(novaData));
}
console.log('Resultado:', parcelas1);
console.log('Esperado: ["01/09/2024", "01/10/2024", "01/11/2024", "01/12/2024", "01/01/2025"]\n');

// Teste 2: Problema relatado - dia 31/08 com 5 parcelas
console.log('🧪 Teste 2: Primeiro vencimento 31/08/2024, 5 parcelas');
const dataBase2 = criarData(2024, 8, 31); // 31/08/2024
const parcelas2 = [];
for (let i = 0; i < 5; i++) {
  const novaData = adicionarMesesSeguro(dataBase2, i);
  parcelas2.push(formatarData(novaData));
}
console.log('Resultado:', parcelas2);
console.log('Esperado: ["31/08/2024", "30/09/2024", "31/10/2024", "30/11/2024", "31/12/2024"]');
console.log('Nota: Setembro e novembro têm apenas 30 dias, então 31 vira 30\n');

// Teste 3: Caso extremo - 31 de janeiro (mês com 31 dias) para fevereiro (28/29 dias)
console.log('🧪 Teste 3: Primeiro vencimento 31/01/2024, 3 parcelas (ano bissexto)');
const dataBase3 = criarData(2024, 1, 31); // 31/01/2024
const parcelas3 = [];
for (let i = 0; i < 3; i++) {
  const novaData = adicionarMesesSeguro(dataBase3, i);
  parcelas3.push(formatarData(novaData));
}
console.log('Resultado:', parcelas3);
console.log('Esperado: ["31/01/2024", "29/02/2024", "31/03/2024"]');
console.log('Nota: Fevereiro 2024 tem 29 dias (ano bissexto), então 31 vira 29\n');

// Teste 4: Caso extremo - 31 de janeiro em ano não bissexto
console.log('🧪 Teste 4: Primeiro vencimento 31/01/2023, 3 parcelas (ano não bissexto)');
const dataBase4 = criarData(2023, 1, 31); // 31/01/2023
const parcelas4 = [];
for (let i = 0; i < 3; i++) {
  const novaData = adicionarMesesSeguro(dataBase4, i);
  parcelas4.push(formatarData(novaData));
}
console.log('Resultado:', parcelas4);
console.log('Esperado: ["31/01/2023", "28/02/2023", "31/03/2023"]');
console.log('Nota: Fevereiro 2023 tem 28 dias (ano não bissexto), então 31 vira 28\n');

// Teste 5: Transição de ano
console.log('🧪 Teste 5: Primeiro vencimento 31/10/2024, 4 parcelas (transição de ano)');
const dataBase5 = criarData(2024, 10, 31); // 31/10/2024
const parcelas5 = [];
for (let i = 0; i < 4; i++) {
  const novaData = adicionarMesesSeguro(dataBase5, i);
  parcelas5.push(formatarData(novaData));
}
console.log('Resultado:', parcelas5);
console.log('Esperado: ["31/10/2024", "30/11/2024", "31/12/2024", "31/01/2025"]\n');

// Teste 6: Verificar se a função não altera a data original
console.log('🧪 Teste 6: Verificar imutabilidade da data original');
const dataOriginal = criarData(2024, 9, 1);
const dataOriginalFormatada = formatarData(dataOriginal);
const novaDataTeste = adicionarMesesSeguro(dataOriginal, 1);
const dataOriginalAposOperacao = formatarData(dataOriginal);
console.log('Data original antes:', dataOriginalFormatada);
console.log('Nova data criada:', formatarData(novaDataTeste));
console.log('Data original depois:', dataOriginalAposOperacao);
console.log('Imutabilidade preservada:', dataOriginalFormatada === dataOriginalAposOperacao ? '✅' : '❌\n');

console.log('=== TESTES CONCLUÍDOS ===');
console.log('\n💡 Para executar este teste, rode: npx ts-node src/utils/dateUtils.test.ts');
console.log('📝 Ou adicione ao seu sistema de testes preferido (Jest, Vitest, etc.)');