// Teste para verificar o problema de datas após correções

// Função adicionarMesesSeguro corrigida com UTC
const adicionarMesesSeguro = (dataBase, mesesParaAdicionar) => {
  // Usar UTC para evitar problemas de timezone
  const diaOriginal = dataBase.getUTCDate();
  const mesOriginal = dataBase.getUTCMonth();
  const anoOriginal = dataBase.getUTCFullYear();
  
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
  
  // Verificar se o dia original existe no novo mês usando UTC
  const ultimoDiaDoNovoMes = new Date(Date.UTC(novoAno, novoMes + 1, 0)).getUTCDate();
  const diaFinal = Math.min(diaOriginal, ultimoDiaDoNovoMes);
  
  // Retornar data em UTC
  return new Date(Date.UTC(novoAno, novoMes, diaFinal));
};

// Função criarDataDeString corrigida
const criarDataDeString = (dataString) => {
  const [ano, mes, dia] = dataString.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia)); // mes - 1 porque Date usa 0-11 para meses
};

// Função formatarDataParaISO corrigida
const formatarDataParaISO = (data) => {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(data.getUTCDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
};

console.log('=== TESTE DE DATAS CORRIGIDAS ===\n');

// Teste 1: Simular criação de parcelas a partir de 01/09/2024
console.log('🧪 Teste 1: Simular criação de 3 parcelas a partir de 01/09/2024');
const dataBase1 = criarDataDeString('2024-09-01');
console.log('Data base criada:', formatarDataParaISO(dataBase1));
for (let i = 0; i < 3; i++) {
  const dataVencimento = adicionarMesesSeguro(dataBase1, i);
  const isoString = formatarDataParaISO(dataVencimento);
  console.log(`Parcela ${i + 1}: ${isoString}`);
}
console.log('Esperado: 2024-09-01, 2024-10-01, 2024-11-01\n');

// Teste 2: Simular criação de parcelas a partir de 31/08/2024
console.log('🧪 Teste 2: Simular criação de 3 parcelas a partir de 31/08/2024');
const dataBase2 = criarDataDeString('2024-08-31');
console.log('Data base criada:', formatarDataParaISO(dataBase2));
for (let i = 0; i < 3; i++) {
  const dataVencimento = adicionarMesesSeguro(dataBase2, i);
  const isoString = formatarDataParaISO(dataVencimento);
  console.log(`Parcela ${i + 1}: ${isoString}`);
}
console.log('Esperado: 2024-08-31, 2024-09-30, 2024-10-31\n');

// Teste 3: Verificar se não há mais problemas de timezone
console.log('🧪 Teste 3: Verificar timezone');
const dataTest = criarDataDeString('2024-09-01');
console.log('Data criada de string:', formatarDataParaISO(dataTest));
console.log('toISOString():', dataTest.toISOString());
console.log('getUTCDate():', dataTest.getUTCDate());
console.log('getDate():', dataTest.getDate());

// Teste 4: Casos extremos
console.log('\n🧪 Teste 4: Casos extremos - 31 de janeiro');
const dataBase4 = criarDataDeString('2024-01-31');
for (let i = 0; i < 4; i++) {
  const dataVencimento = adicionarMesesSeguro(dataBase4, i);
  const isoString = formatarDataParaISO(dataVencimento);
  console.log(`Parcela ${i + 1}: ${isoString}`);
}
console.log('Esperado: 2024-01-31, 2024-02-29, 2024-03-31, 2024-04-30');