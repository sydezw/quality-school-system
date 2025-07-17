// Configuração centralizada e ofuscada das APIs
const API_CONFIGS = {
  // Configuração ofuscada da GROQ API
  GROQ: {
    // Chave dividida em partes para dificultar extração
    KEY_PARTS: [
      'Z3NrX2NEWHFUdG5sbko0OXJLTmliZVpQV0dkeWIzRllWak9WSHpwc1hZN1hqZ25ZSWs4QWlySnQ=',
    ],
    MODEL: 'llama3-8b-8192',
    BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.3
  }
};

// Função para reconstruir a chave da API
export const getApiKey = (): string => {
  try {
    // Decodificar e reconstruir a chave
    const encodedKey = API_CONFIGS.GROQ.KEY_PARTS[0];
    const decodedKey = atob(encodedKey);
    return decodedKey;
  } catch (error) {
    console.error('Erro ao decodificar chave da API');
    throw new Error('Configuração de API inválida');
  }
};

export const getGroqConfig = () => ({
  model: API_CONFIGS.GROQ.MODEL,
  baseUrl: API_CONFIGS.GROQ.BASE_URL,
  maxTokens: API_CONFIGS.GROQ.MAX_TOKENS,
  temperature: API_CONFIGS.GROQ.TEMPERATURE
});