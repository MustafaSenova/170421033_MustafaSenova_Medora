import { HealthAIService } from './healthAI';
import { MockAIService } from './mockAI';
import { HealthContext, AIHealthResponse, ChatMessage } from '../types/health';

/**
 * Hybrid AI Service - OpenAI ile başlar, hata durumunda mock'a geçer
 */
export class HybridAIService {
  private realAI: HealthAIService | null = null;
  private mockAI: MockAIService;
  private useRealAI: boolean = false;

  constructor(apiKey?: string, model?: string) {
    this.mockAI = new MockAIService();
    
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      try {
        this.realAI = new HealthAIService(apiKey, model);
        this.useRealAI = true;
        console.log('🤖 Real AI Service initialized');
      } catch (error) {
        console.log('⚠️ Real AI Service failed, using Mock AI');
        this.useRealAI = false;
      }
    } else {
      console.log('🎭 Using Mock AI Service (no API key)');
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
    chatHistory: ChatMessage[] = [],
    userContext?: HealthContext
  ): Promise<string> {
    if (this.useRealAI && this.realAI) {
      try {
        console.log('🤖 Trying real AI chat...');
        const result = await this.realAI.chatWithHealthAssistant(message, chatHistory, userContext);
        console.log('✅ Real AI chat successful');
        return result;
      } catch (error) {
        console.log('⚠️ Real AI chat failed, falling back to Mock AI');
        console.log('Error:', error instanceof Error ? error.message : error);
        this.useRealAI = false;
        return await this.mockAI.chatWithHealthAssistant(message, chatHistory, userContext);
      }
    }
    
    console.log('🎭 Using Mock AI chat');
    return await this.mockAI.chatWithHealthAssistant(message, chatHistory, userContext);
  }

  // Quick health tips without AI
  getQuickHealthTips(): string[] {
    return [
      "💧 Günde en az 8 bardak su için",
      "🚶‍♂️ Günde 10.000 adım atmaya çalışın",
      "😴 7-9 saat kaliteli uyku alın",
      "🥗 Günde 5 porsiyon meyve-sebze tüketin",
      "🧘‍♀️ Stres yönetimi için nefes egzersizi yapın"
    ];
  }

  // Emergency health guidance
  getEmergencyGuidance(): string[] {
    return [
      "🚨 Göğüs ağrısı: Hemen 112'yi arayın",
      "🤒 Yüksek ateş (39°C+): Doktor başvurusu",
      "💔 Kalp çarpıntısı: Dinlenin, geçmezse doktor",
      "🤢 Şiddetli mide bulantısı: Sıvı tüketin",
      "😵 Baş dönmesi: Oturun, su için"
    ];
  }

  // Health status check
  isServiceAvailable(): boolean {
    return true; // Mock AI her zaman mevcut
  }

  getServiceStatus(): string {
    if (this.useRealAI) {
      return '🤖 OpenAI Aktif';
    } else {
      return '🎭 Mock AI Aktif';
    }
  }
}

// Singleton instance for global use
let hybridAI: HybridAIService | null = null;

export const initializeAI = (apiKey?: string): HybridAIService => {
  if (!hybridAI) {
    hybridAI = new HybridAIService(apiKey);
  }
  return hybridAI;
};

export const getAI = (): HybridAIService => {
  if (!hybridAI) {
    hybridAI = new HybridAIService(); // Mock AI as fallback
  }
  return hybridAI;
};
