import { HealthAIService } from './healthAI';
import { MockAIService } from './mockAI';
import { HealthContext, AIHealthResponse, ChatMessage } from '../types/health';

// API key'i async storage veya direct olarak almak için
const getApiKey = () => {
  // Öncelikle process.env'den dene
  try {
    if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
  } catch (e) {
    console.log('Process.env not available');
  }
  
  // Eğer environment variable çalışmıyorsa, buraya key'inizi ekleyebilirsiniz
  // GÜVENLIK: Production'da mutlaka environment variable kullanın!
  const HARDCODED_API_KEY = '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'; // Gerçek OpenAI key'inizi buraya yazın (sk- ile başlamalı)
  
  return HARDCODED_API_KEY;
};

/**
 * Hybrid AI Service - OpenAI ile başlar, hata durumunda mock'a geçer
 */
export class HybridAIService {
  private realAI: HealthAIService | null = null;
  private mockAI: MockAIService;
  private useRealAI: boolean = false;

  constructor(apiKey?: string, model?: string) {
    this.mockAI = new MockAIService();
    
    // API key'i önce parametre olarak, sonra function'dan al
    const finalApiKey = apiKey || getApiKey();
    console.log('🔑 API Key check:', finalApiKey?.substring(0, 10) + '...' || 'No key found');
    
    if (finalApiKey && finalApiKey !== 'your_openai_api_key_here' && finalApiKey.startsWith('sk-')) {
      try {
        this.realAI = new HealthAIService(finalApiKey, model);
        this.useRealAI = true;
        console.log('🤖 Real AI Service initialized successfully');
      } catch (error) {
        console.log('⚠️ Real AI Service failed, using Mock AI:', error);
        this.useRealAI = false;
      }
    } else {
      console.log('🎭 Using Mock AI Service (no valid API key)');
      console.log('💡 Key format check:', finalApiKey ? 'Key exists but invalid format' : 'No key provided');
      this.useRealAI = false;
    }
  }

  async analyzeHealthData(context: HealthContext): Promise<AIHealthResponse> {
    if (this.useRealAI && this.realAI) {
      try {
        console.log('🤖 Trying real AI analysis...');
        const result = await this.realAI.analyzeHealthData(context);
        console.log('✅ Real AI analysis successful');
        return result;
      } catch (error) {
        console.log('⚠️ Real AI failed, falling back to Mock AI');
        console.log('Error:', error instanceof Error ? error.message : error);
        this.useRealAI = false; // Disable for future calls
        return await this.mockAI.analyzeHealthData(context);
      }
    }
    
    console.log('🎭 Using Mock AI analysis');
    return await this.mockAI.analyzeHealthData(context);
  }

  async chatWithHealthAssistant(
    message: string, 
    context: HealthContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    if (this.useRealAI && this.realAI) {
      try {
        console.log('🤖 Trying real AI chat...');
        const result = await this.realAI.chatWithHealthAssistant(message, context, chatHistory);
        console.log('✅ Real AI chat successful');
        return result;
      } catch (error) {
        console.log('⚠️ Real AI chat failed, falling back to Mock AI');
        this.useRealAI = false;
        return await this.mockAI.chatWithHealthAssistant(message, context, chatHistory);
      }
    }
    
    console.log('🎭 Using Mock AI chat');
    return await this.mockAI.chatWithHealthAssistant(message, context, chatHistory);
  }

  async generateProactiveAlerts(context: HealthContext): Promise<string[]> {
    if (this.useRealAI && this.realAI) {
      try {
        console.log('🤖 Trying real AI alerts...');
        const result = await this.realAI.generateProactiveAlerts(context);
        console.log('✅ Real AI alerts successful');
        return result;
      } catch (error) {
        console.log('⚠️ Real AI alerts failed, falling back to Mock AI');
        this.useRealAI = false;
        return await this.mockAI.generateProactiveAlerts(context);
      }
    }
    
    console.log('🎭 Using Mock AI alerts');
    return await this.mockAI.generateProactiveAlerts(context);
  }

  async generateHealthReport(context: HealthContext): Promise<string> {
    console.log('📋 Generating comprehensive health report with Mock AI');
    return await this.mockAI.generateHealthReport(context);
  }

  getServiceType(): 'real' | 'mock' | 'hybrid' {
    if (this.useRealAI) return 'real';
    return this.realAI ? 'hybrid' : 'mock';
  }

  isUsingRealAI(): boolean {
    return this.useRealAI;
  }

  getServiceStatus(): string {
    return this.useRealAI ? 'real' : 'mock';
  }
}

// Export fonksiyonları - SORUN DÜZELTME
let globalAIInstance: HybridAIService | null = null;

/**
 * AI instance'ını başlat ve döndür
 */
export function initializeAI(apiKey?: string, model?: string): HybridAIService {
  if (!globalAIInstance) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    globalAIInstance = new HybridAIService(key, model);
  }
  return globalAIInstance;
}

/**
 * Mevcut AI instance'ını döndür
 */
export function getAI(): HybridAIService {
  if (!globalAIInstance) {
    return initializeAI();
  }
  return globalAIInstance;
}
