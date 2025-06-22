
export const formatCPF = (value: string) => {
  if (!value) return "";
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  } else if (cleanValue.length <= 9) {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  } else {
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
  }
};

export const formatCEP = (value: string) => {
  if (!value) return "";
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 5) {
    return cleanValue;
  } else {
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
  }
};

export const formatPhone = (value: string) => {
  if (!value) return "";
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 2) {
    return cleanValue;
  } else if (cleanValue.length <= 7) {
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  } else {
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
  }
};

// Alias para compatibilidade
export const formatPhoneNumber = formatPhone;
