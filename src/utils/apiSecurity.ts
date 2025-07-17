// Utilitário para ofuscar e proteger chaves de API
class ApiKeyManager {
  private static instance: ApiKeyManager;
  private obfuscatedKey: string = '';

  private constructor() {
    this.initializeKey();
  }

  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  private initializeKey(): void {
    // Ofuscar a chave usando múltiplas camadas de codificação
    const envKey = import.meta.env.VITE_GROQ_API_KEY;
    if (envKey) {
      // Aplicar transformações para dificultar a extração
      this.obfuscatedKey = this.obfuscate(envKey);
    }
  }

  private obfuscate(key: string): string {
    // Múltiplas camadas de ofuscação
    const step1 = btoa(key); // Base64
    const step2 = step1.split('').reverse().join(''); // Reverter
    const step3 = this.addNoise(step2); // Adicionar ruído
    return step3;
  }

  private deobfuscate(obfuscatedKey: string): string {
    // Reverter o processo de ofuscação
    const step1 = this.removeNoise(obfuscatedKey);
    const step2 = step1.split('').reverse().join('');
    const step3 = atob(step2);
    return step3;
  }

  private addNoise(str: string): string {
    // Adicionar caracteres de ruído em posições específicas
    const noise = 'xyz123';
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str[i];
      if (i % 7 === 0 && i > 0) {
        result += noise[i % noise.length];
      }
    }
    return result;
  }

  private removeNoise(str: string): string {
    // Remover caracteres de ruído
    let result = '';
    for (let i = 0; i < str.length; i++) {
      if (i % 8 !== 7 || i === 0) {
        result += str[i];
      }
    }
    return result;
  }

  public getApiKey(): string {
    if (!this.obfuscatedKey) {
      throw new Error('API key not initialized');
    }
    return this.deobfuscate(this.obfuscatedKey);
  }

  // Método para validar se a chave está no formato correto
  public validateKey(): boolean {
    try {
      const key = this.getApiKey();
      return key.startsWith('gsk_') && key.length > 20;
    } catch {
      return false;
    }
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();