// Proxy para chamadas da API GROQ com segurança adicional
import { apiKeyManager } from './apiSecurity';

interface GroqRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model: string;
  temperature?: number;
  max_tokens?: number;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class GroqApiProxy {
  private static instance: GroqApiProxy;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  private constructor() {}

  public static getInstance(): GroqApiProxy {
    if (!GroqApiProxy.instance) {
      GroqApiProxy.instance = new GroqApiProxy();
    }
    return GroqApiProxy.instance;
  }

  public async createCompletion(request: GroqRequest): Promise<GroqResponse> {
    try {
      if (!apiKeyManager.validateKey()) {
        throw new Error('Invalid API configuration');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyManager.getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na chamada da API:', error);
      throw new Error('Falha na comunicação com o serviço de análise');
    }
  }
}

export const groqApiProxy = GroqApiProxy.getInstance();