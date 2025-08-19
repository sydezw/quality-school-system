// Utilitários para cálculos de datas das turmas

// Função para calcular a data de fim baseada na data de início, total de aulas e dias da semana
export const calculateEndDate = (
  startDate: string,
  totalClasses: number,
  weekDays: string[],
  horario?: string // Parâmetro opcional para verificar diferença de horário
): string => {
  if (!startDate || !totalClasses || weekDays.length === 0) {
    return '';
  }

  const start = new Date(startDate);
  const daysOfWeek = {
    'Domingo': 0,
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6
  };

  // Converter dias da semana para números
  const classDays = weekDays.map(day => daysOfWeek[day as keyof typeof daysOfWeek]).filter(day => day !== undefined);
  
  if (classDays.length === 0) {
    return '';
  }

  // Verificar se há diferença de 2 horas no horário
  let isDuasHoras = false;
  if (horario) {
    const horarioParts = horario.split('-');
    if (horarioParts.length === 2) {
      const inicio = horarioParts[0].trim();
      const fim = horarioParts[1].trim();
      
      // Converter horários para minutos
      const [inicioHora, inicioMin] = inicio.split(':').map(Number);
      const [fimHora, fimMin] = fim.split(':').map(Number);
      
      const inicioMinutos = inicioHora * 60 + (inicioMin || 0);
      const fimMinutos = fimHora * 60 + (fimMin || 0);
      
      // Verificar se a diferença é de 2 horas (120 minutos)
      const diferencaMinutos = fimMinutos - inicioMinutos;
      isDuasHoras = diferencaMinutos === 120;
    }
  }

  // Se há diferença de 2 horas e são 36 aulas, cada dia vale como 2 dias
  let aulasParaCalcular = totalClasses;
  if (isDuasHoras && totalClasses === 36) {
    aulasParaCalcular = Math.ceil(totalClasses / 2); // 36 aulas / 2 = 18 dias de aula
  }

  let classCount = 0;
  let currentDate = new Date(start);
  
  // Se a data de início não for um dia de aula, avançar para o próximo dia de aula
  while (!classDays.includes(currentDate.getDay())) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Para 1 aula total, a data de fim é a própria data de início (após ajuste para dia válido)
  if (aulasParaCalcular === 1) {
    return currentDate.toISOString().split('T')[0];
  }
  
  // Contar a primeira aula
  classCount = 1;
  
  // Calcular as aulas restantes
  while (classCount < aulasParaCalcular) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    if (classDays.includes(currentDate.getDay())) {
      classCount++;
    }
  }
  
  return currentDate.toISOString().split('T')[0];
};

// Função para parsear dias da semana de string para array
export const parseDaysOfWeek = (daysString: string): string[] => {
  if (!daysString) return [];
  
  return daysString
    .split(' e ')
    .map(day => day.trim())
    .filter(day => day.length > 0);
};

// Função para calcular a Páscoa (algoritmo de Gauss)
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

// Função para verificar se uma data é feriado brasileiro
export const isHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Feriados fixos brasileiros (nacionais)
  const fixedHolidays = [
    '01-01', // Confraternização Universal (Ano Novo)
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalhador
    '09-07', // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida (Padroeira do Brasil)
    '11-02', // Finados
    '11-15', // Proclamação da República
    '12-25', // Natal
    '12-24', // Véspera de Natal (amplamente observado)
    '12-31', // Véspera de Ano Novo (amplamente observado)
    '06-24', // São João (feriado em muitas regiões)
    '10-15', // Dia do Professor (feriado escolar nacional)
    '04-22', // Descobrimento do Brasil (alguns estados)
    '11-20', // Consciência Negra (feriado nacional desde 2024)
  ];
  
  const dateString = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  if (fixedHolidays.includes(dateString)) {
    return true;
  }
  
  // Feriados móveis baseados na Páscoa
  const easter = calculateEaster(year);
  const easterTime = easter.getTime();
  const currentTime = date.getTime();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  // Carnaval - Segunda e Terça-feira (48 e 47 dias antes da Páscoa)
  const carnivalMonday = new Date(easterTime - 48 * dayInMs);
  const carnivalTuesday = new Date(easterTime - 47 * dayInMs);
  // Sexta-feira Santa (2 dias antes da Páscoa)
  const goodFriday = new Date(easterTime - 2 * dayInMs);
  // Páscoa (domingo)
  const easterSunday = new Date(easterTime);
  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(easterTime + 60 * dayInMs);
  
  const mobileHolidays = [carnivalMonday, carnivalTuesday, goodFriday, easterSunday, corpusChristi];
  
  return mobileHolidays.some(holiday => 
    holiday.getDate() === day && 
    holiday.getMonth() === month - 1 && 
    holiday.getFullYear() === year
  );
};

// Função para verificar se um feriado realmente afeta as aulas programadas
const doesHolidayAffectClasses = (
  holidayDate: Date,
  startDate: Date,
  totalClasses: number,
  classDays: number[]
): boolean => {
  let classCount = 0;
  let currentDate = new Date(startDate);
  
  // Avançar para o primeiro dia de aula se necessário
  while (!classDays.includes(currentDate.getDay())) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Verificar se o feriado está dentro do período das aulas programadas
  while (classCount < totalClasses) {
    if (classDays.includes(currentDate.getDay())) {
      // Se chegamos na data do feriado e ainda temos aulas para dar
      if (currentDate.getTime() === holidayDate.getTime()) {
        return true; // Este feriado afeta as aulas
      }
      classCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return false; // Este feriado não afeta as aulas programadas
};

// Função para recalcular data de fim considerando feriados automaticamente
export const calculateEndDateWithHolidays = (
  startDate: string,
  totalClasses: number,
  weekDays: string[],
  horario?: string // Parâmetro opcional para verificar diferença de horário
): { endDate: string; holidaysFound: Date[] } => {
  if (!startDate || !totalClasses || weekDays.length === 0) {
    return { endDate: '', holidaysFound: [] };
  }

  const start = new Date(startDate);
  const daysOfWeek = {
    'Domingo': 0,
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6
  };

  const classDays = weekDays.map(day => daysOfWeek[day as keyof typeof daysOfWeek]).filter(day => day !== undefined);
  
  if (classDays.length === 0) {
    return { endDate: '', holidaysFound: [] };
  }

  // Verificar se há diferença de 2 horas no horário
  let isDuasHoras = false;
  if (horario) {
    const horarioParts = horario.split('-');
    if (horarioParts.length === 2) {
      const inicio = horarioParts[0].trim();
      const fim = horarioParts[1].trim();
      
      // Converter horários para minutos
      const [inicioHora, inicioMin] = inicio.split(':').map(Number);
      const [fimHora, fimMin] = fim.split(':').map(Number);
      
      const inicioMinutos = inicioHora * 60 + (inicioMin || 0);
      const fimMinutos = fimHora * 60 + (fimMin || 0);
      
      // Verificar se a diferença é de 2 horas (120 minutos)
      const diferencaMinutos = fimMinutos - inicioMinutos;
      isDuasHoras = diferencaMinutos === 120;
    }
  }

  // Se há diferença de 2 horas e são 36 aulas, cada dia vale como 2 dias
  let aulasParaCalcular = totalClasses;
  if (isDuasHoras && totalClasses === 36) {
    aulasParaCalcular = Math.ceil(totalClasses / 2); // 36 aulas / 2 = 18 dias de aula
  }

  let classCount = 0;
  let currentDate = new Date(start);
  const holidaysFound: Date[] = [];
  
  // Se a data de início não for um dia de aula, avançar para o próximo dia de aula
  while (!classDays.includes(currentDate.getDay())) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Verificar se a própria data de início é um feriado
  if (isHoliday(currentDate) && classDays.includes(currentDate.getDay())) {
    const startHoliday = new Date(currentDate);
    holidaysFound.push(startHoliday);
  }
  
  // Contar aulas e detectar feriados que realmente afetam as aulas programadas
  while (classCount < aulasParaCalcular) {
    if (classDays.includes(currentDate.getDay())) {
      if (isHoliday(currentDate)) {
        // Feriado detectado em dia de aula programada
        const holidayDate = new Date(currentDate);
        
        // Verificar se este feriado realmente afeta as aulas programadas
        if (doesHolidayAffectClasses(holidayDate, start, aulasParaCalcular, classDays)) {
          // Verificar se já não temos este feriado na lista (evitar duplicatas)
          const alreadyExists = holidaysFound.some(h => 
            h.getTime() === holidayDate.getTime()
          );
          if (!alreadyExists) {
            holidaysFound.push(holidayDate);
          }
        }
      } else {
        // Dia normal de aula - contar
        classCount++;
      }
    }
    
    // Se ainda não completamos todas as aulas, avançar para o próximo dia
    if (classCount < aulasParaCalcular) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  // Agora currentDate está na data da última aula
  // Adicionar os dias de feriado ao final para compensar
  const holidayCount = holidaysFound.length;
  for (let i = 0; i < holidayCount; i++) {
    // Avançar para o próximo dia de aula após a data final
    do {
      currentDate.setDate(currentDate.getDate() + 1);
    } while (!classDays.includes(currentDate.getDay()));
  }
  
  return {
    endDate: currentDate.toISOString().split('T')[0],
    holidaysFound
  };
};

// Função para formatar data para exibição
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

// Função para calcular duração em semanas
export const calculateDurationInWeeks = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.ceil(diffDays / 7);
};