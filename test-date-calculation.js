// Teste para verificar se a correção do fuso horário funcionou

const calculateEndDateWithHolidays = (
  startDate,
  totalClasses,
  weekDays
) => {
  if (!startDate || !totalClasses || weekDays.length === 0) {
    return { endDate: '', holidaysFound: [] };
  }

  // Criar data evitando problemas de fuso horário
  const [year, month, day] = startDate.split('-').map(Number);
  const start = new Date(year, month - 1, day); // month é 0-indexed
  const daysOfWeek = {
    'Domingo': 0,
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6
  };

  const classDays = weekDays.map(day => daysOfWeek[day]).filter(day => day !== undefined);
  
  if (classDays.length === 0) {
    return { endDate: '', holidaysFound: [] };
  }

  let aulasParaCalcular = totalClasses;
  let classCount = 0;
  let currentDate = new Date(start);
  const holidaysFound = [];
  
  console.log('Data de início original:', startDate);
  console.log('Data de início como objeto:', start);
  console.log('Dia da semana da data de início:', currentDate.getDay());
  console.log('Dias de aula permitidos:', classDays);
  
  // Se a data de início não for um dia de aula, avançar para o próximo dia de aula
  while (!classDays.includes(currentDate.getDay())) {
    currentDate.setDate(currentDate.getDate() + 1);
    console.log('Avançando para próximo dia de aula:', currentDate.toISOString().split('T')[0]);
  }
  
  console.log('Data ajustada para dia de aula:', currentDate.toISOString().split('T')[0]);
  
  // Para 1 aula total, a data de fim é a própria data de início (após ajuste para dia válido)
  if (aulasParaCalcular === 1) {
    const result = currentDate.toISOString().split('T')[0];
    console.log('Resultado para 1 aula:', result);
    return {
      endDate: result,
      holidaysFound: []
    };
  }
};

console.log('=== TESTE APÓS CORREÇÃO ===');
console.log('\n--- Teste 1: 18/08/2025 (segunda-feira) com aulas às segundas ---');
const result1 = calculateEndDateWithHolidays('2025-08-18', 1, ['Segunda']);
console.log('Resultado:', result1);

console.log('\n--- Teste 2: 17/08/2025 (domingo) com aulas às segundas ---');
const result2 = calculateEndDateWithHolidays('2025-08-17', 1, ['Segunda']);
console.log('Resultado:', result2);

console.log('\n--- Teste 3: 20/10/2025 com aulas às segundas ---');
const result3 = calculateEndDateWithHolidays('2025-10-20', 1, ['Segunda']);
console.log('Resultado:', result3);

console.log('\n=== VERIFICAÇÃO FINAL ===');
console.log('Agora 18/08/2025 deveria:');
console.log('- Ser reconhecido como segunda-feira');
console.log('- Para 1 aula às segundas, retornar 18/08/2025');
console.log('- Não avançar para 19/08/2025');