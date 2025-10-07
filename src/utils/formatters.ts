
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

export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Aplica a máscara XXX.XXX.XXX-XX
  if (cleanCPF.length === 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf; // Retorna o valor original se não tiver 11 dígitos
};

// Função para converter números em valores por extenso
export const numberToWords = (value: number): string => {
  if (value === 0) return 'zero';
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  const convertGroup = (num: number): string => {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    
    let result = '';
    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;
    
    if (c > 0) {
      result += centenas[c];
      if (d > 0 || u > 0) result += ' e ';
    }
    
    if (d === 1 && u > 0) {
      result += especiais[u];
    } else {
      if (d > 0) {
        result += dezenas[d];
        if (u > 0) result += ' e ';
      }
      if (u > 0 && d !== 1) {
        result += unidades[u];
      }
    }
    
    return result;
  };
  
  let integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);
  
  let result = '';
  
  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000);
    result += convertGroup(millions);
    result += millions === 1 ? ' milhão' : ' milhões';
    
    const remainder = integerPart % 1000000;
    if (remainder > 0) {
      result += remainder < 100 ? ' e ' : ', ';
    }
    
    integerPart = remainder;
  }
  
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    result += convertGroup(thousands) + ' mil';
    
    const remainder = integerPart % 1000;
    if (remainder > 0) {
      result += remainder < 100 ? ' e ' : ', ';
    }
    
    integerPart = remainder;
  }
  
  if (integerPart > 0) {
    result += convertGroup(integerPart);
  }
  
  // Adicionar centavos se houver
  if (decimalPart > 0) {
    result += ' reais e ' + convertGroup(decimalPart);
    result += decimalPart === 1 ? ' centavo' : ' centavos';
  } else {
    result += ' reais';
  }
  
  return result.trim();
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
