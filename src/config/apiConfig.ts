// Configuração centralizada das APIs (sem incluir segredos no código)
const API_CONFIGS = {
  GROQ: {
    MODEL: 'llama3-8b-8192',
    BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.3,
  },
};

// Função para reconstruir a chave da API
// Obtém chave da GROQ via variável de ambiente (Vite)
// Defina `VITE_GROQ_API_KEY` em `.env` localmente e NUNCA commite o valor.
export const getApiKey = (): string => {
  const key = import.meta.env?.VITE_GROQ_API_KEY as string | undefined;
  if (!key) {
    console.error('GROQ API Key ausente: defina VITE_GROQ_API_KEY no .env');
    throw new Error('Configuração de API inválida: chave não definida');
  }
  return key;
};

export const getGroqConfig = () => ({
  model: API_CONFIGS.GROQ.MODEL,
  baseUrl: API_CONFIGS.GROQ.BASE_URL,
  maxTokens: API_CONFIGS.GROQ.MAX_TOKENS,
  temperature: API_CONFIGS.GROQ.TEMPERATURE
});