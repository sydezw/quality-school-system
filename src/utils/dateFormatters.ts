
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
