// Teste para identificar o problema de formatação de datas

console.log('=== TESTE DE FORMATAÇÃO DE DATAS ===\n');

// Simulando datas que vêm do banco de dados (formato ISO)
const datasISO = [
  '2024-09-01', // 01/09/2024
  '2024-10-01', // 01/10/2024
  '2024-11-01', // 01/11/2024
  '2024-12-01', // 01/12/2024
  '2025-01-01'  // 01/01/2025
];

console.log('🧪 Teste 1: Como o frontend formata datas ISO usando new Date().toLocaleDateString()');
datasISO.forEach((dataISO, index) => {
  const dataObj = new Date(dataISO);
  const formatadaToLocaleDateString = dataObj.toLocaleDateString('pt-BR');
  console.log(`Parcela ${index + 1}: ISO "${dataISO}" -> toLocaleDateString: "${formatadaToLocaleDateString}"`);
});

console.log('\n🧪 Teste 2: Problema de timezone - new Date() com string ISO');
datasISO.forEach((dataISO, index) => {
  const dataObj = new Date(dataISO);
  console.log(`ISO: ${dataISO}`);
  console.log(`  -> new Date(): ${dataObj}`);
  console.log(`  -> getDate(): ${dataObj.getDate()}`);
  console.log(`  -> getMonth(): ${dataObj.getMonth() + 1}`);
  console.log(`  -> getFullYear(): ${dataObj.getFullYear()}`);
  console.log(`  -> toLocaleDateString('pt-BR'): ${dataObj.toLocaleDateString('pt-BR')}`);
  console.log('');
});

console.log('🧪 Teste 3: Formatação correta usando split (como no formatters.ts)');
datasISO.forEach((dataISO, index) => {
  // Método correto do formatters.ts
  const [year, month, day] = dataISO.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const formatadaCorreta = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
  
  // Método problemático usado em alguns componentes
  const dataObjProblematica = new Date(dataISO);
  const formatadaProblematica = dataObjProblematica.toLocaleDateString('pt-BR');
  
  console.log(`Parcela ${index + 1}:`);
  console.log(`  ISO: ${dataISO}`);
  console.log(`  Método CORRETO: ${formatadaCorreta}`);
  console.log(`  Método PROBLEMÁTICO: ${formatadaProblematica}`);
  console.log(`  Diferença: ${formatadaCorreta !== formatadaProblematica ? '❌ SIM' : '✅ NÃO'}`);
  console.log('');
});

console.log('=== CONCLUSÃO ===');
console.log('O problema está na formatação de datas ISO usando new Date(isoString).toLocaleDateString()');
console.log('Isso causa problemas de timezone que alteram o dia.');
console.log('Solução: Usar o método do formatters.ts que faz split da string ISO.');