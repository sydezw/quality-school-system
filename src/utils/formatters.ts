
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

export const formatarFormaPagamento = (forma: string): string => {
  const formas: Record<string, string> = {
    'boleto': 'Boleto',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito', 
    'pix': 'PIX',
    'dinheiro': 'Dinheiro',
    'transferencia': 'Transferência',
    'outro': 'Outro'
  };
  return formas[forma] || forma;
};

// Função para formatar valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para formatar datas
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Para datas no formato YYYY-MM-DD (do banco), criar a data sem problemas de timezone
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11 para meses
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
    
    // Para outros formatos de data
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};
