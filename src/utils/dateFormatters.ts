
export const formatBirthDate = (value: string) => {
  if (!value) return "";
  
  // Remove tudo que não for dígito
  const cleanValue = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos (ddmmyyyy)
  const limitedValue = cleanValue.slice(0, 8);
  
  // Aplica a formatação dd/mm/yyyy
  if (limitedValue.length <= 2) {
    return limitedValue;
  } else if (limitedValue.length <= 4) {
    return `${limitedValue.slice(0, 2)}/${limitedValue.slice(2)}`;
  } else {
    return `${limitedValue.slice(0, 2)}/${limitedValue.slice(2, 4)}/${limitedValue.slice(4)}`;
  }
};

export const isValidBirthDate = (dateString: string): boolean => {
  if (dateString.length !== 10) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  
  // Validações básicas
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Validação mais específica usando Date
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
};

// Função para formatar data no padrão brasileiro (dd/mm/yyyy)
export const formatDateBR = (value: string) => {
  if (!value) return "";
  
  // Remove tudo que não for dígito
  const cleanValue = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos (ddmmyyyy)
  const limitedValue = cleanValue.slice(0, 8);
  
  // Aplica a formatação dd/mm/yyyy
  if (limitedValue.length <= 2) {
    return limitedValue;
  } else if (limitedValue.length <= 4) {
    return `${limitedValue.slice(0, 2)}/${limitedValue.slice(2)}`;
  } else {
    return `${limitedValue.slice(0, 2)}/${limitedValue.slice(2, 4)}/${limitedValue.slice(4)}`;
  }
};

// Função para converter data brasileira (dd/mm/yyyy) para ISO (yyyy-mm-dd)
export const convertBRToISO = (brDate: string): string => {
  if (!brDate || brDate.length !== 10) return "";
  
  const [day, month, year] = brDate.split('/');
  
  // Validar se os valores são válidos
  if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return "";
  }
  
  return `${year}-${month}-${day}`;
};

// Função para converter data ISO (yyyy-mm-dd) para brasileira (dd/mm/yyyy)
export const convertISOToBR = (isoDate: string): string => {
  if (!isoDate || isoDate.length !== 10) return "";
  
  const [year, month, day] = isoDate.split('-');
  
  // Validar se os valores são válidos
  if (!year || !month || !day || year.length !== 4 || month.length !== 2 || day.length !== 2) {
    return "";
  }
  
  return `${day}/${month}/${year}`;
};

// Função para validar data no formato brasileiro
export const isValidDateBR = (dateString: string): boolean => {
  if (dateString.length !== 10) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  
  // Validações básicas
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear() + 10) return false; // Permite datas futuras para turmas
  
  // Validação mais específica usando Date
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
};
