import OpenAI from 'openai';
import { HealthContext, AIHealthResponse, ChatMessage } from '../types/health';

export class HealthAIService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.model = model;
  }

  /**
   * Faz 1: Basit sağlık verisi analizi
   */
  async analyzeHealthData(context: HealthContext): Promise<AIHealthResponse> {
    try {
      const prompt = this.buildHealthAnalysisPrompt(context);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Sen uzman bir sağlık asistanısın. Sağlık verilerini analiz edip basit, anlaşılır öneriler veriyorsun. Tıbbi teşhis koymuyorsun, sadece genel sağlık tavsiyeleri veriyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseHealthResponse(response, context);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Sağlık analizi yapılamadı');
    }
  }

  /**
   * Faz 2: Akıllı sohbet sistemi
   */
  async chatWithHealthAssistant(
    message: string, 
    chatHistory: ChatMessage[] = [],
    userContext?: HealthContext
  ): Promise<string> {
    try {
      const systemPrompt = this.buildChatSystemPrompt(userContext);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || 'Üzgünüm, şu anda cevap veremiyorum.';
    } catch (error) {
      console.error('Chat Error:', error);
      throw new Error('Sohbet yanıtı alınamadı');
    }
  }

  private buildHealthAnalysisPrompt(context: HealthContext): string {
    const { vitals, symptoms, demographics, activities } = context;
    
    let prompt = `Sağlık verilerini analiz et ve Türkçe öneriler ver:\n\n`;
    
    if (vitals) {
      prompt += `📊 Vital Değerler:\n`;
      if (vitals.heartRate) prompt += `- Kalp Atışı: ${vitals.heartRate} bpm\n`;
      if (vitals.bloodPressure) prompt += `- Kan Basıncı: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg\n`;
      if (vitals.temperature) prompt += `- Vücut Sıcaklığı: ${vitals.temperature}°C\n`;
      if (vitals.oxygenSaturation) prompt += `- Oksijen Saturasyonu: ${vitals.oxygenSaturation}%\n`;
      if (vitals.weight) prompt += `- Kilo: ${vitals.weight} kg\n`;
      if (vitals.height) prompt += `- Boy: ${vitals.height} cm\n`;
      prompt += `\n`;
    }

    if (symptoms && symptoms.length > 0) {
      prompt += `🩺 Belirtiler:\n`;
      symptoms.forEach(symptom => {
        prompt += `- ${symptom.name} (Şiddet: ${symptom.severity}/10)\n`;
      });
      prompt += `\n`;
    }

    if (activities && activities.length > 0) {
      prompt += `🏃‍♂️ Aktiviteler:\n`;
      activities.forEach(activity => {
        prompt += `- ${activity.type}: ${activity.duration} dakika, ${activity.calories} kalori\n`;
      });
      prompt += `\n`;
    }

    if (demographics) {
      prompt += `👤 Demografik Bilgiler:\n`;
      if (demographics.age) prompt += `- Yaş: ${demographics.age}\n`;
      if (demographics.gender) prompt += `- Cinsiyet: ${demographics.gender}\n`;
      if (demographics.conditions) prompt += `- Mevcut Durumlar: ${demographics.conditions.join(', ')}\n`;
      prompt += `\n`;
    }

    prompt += `Lütfen bu verileri analiz et ve şunları sağla:
1. Genel sağlık durumu değerlendirmesi
2. Basit, uygulanabilir öneriler
3. Dikkat edilmesi gereken noktalar
4. Önerilen yaşam tarzı değişiklikleri

Not: Tıbbi teşhis koymuyorsun, sadece genel sağlık tavsiyeleri veriyorsun.`;

    return prompt;
  }

  private buildChatSystemPrompt(userContext?: HealthContext): string {
    let systemPrompt = `Sen Medora sağlık asistanısın. Sağlık konularında yardımcı oluyorsun. 

Özellikler:
- Türkçe konuşuyorsun
- Dostça ve profesyonel yaklaşımın var
- Tıbbi teşhis koymuyorsun
- Acil durumlar için doktora başvurmasını öneriyorsun
- Genel sağlık bilgisi ve öneriler veriyorsun
- Emoji kullanarak daha samimi oluyorsun

`;

    if (userContext) {
      systemPrompt += `Kullanıcının mevcut sağlık durumu:
${userContext.demographics?.age ? `- Yaş: ${userContext.demographics.age}` : ''}
${userContext.demographics?.gender ? `- Cinsiyet: ${userContext.demographics.gender}` : ''}
${userContext.demographics?.conditions ? `- Mevcut durumlar: ${userContext.demographics.conditions.join(', ')}` : ''}

Bu bilgileri göz önünde bulundurarak kişiselleştirilmiş tavsiyeler ver.`;
    }

    return systemPrompt;
  }

  private parseHealthResponse(response: string, context: HealthContext): AIHealthResponse {
    // Basit parsing - gerçek uygulamada daha sofistike olabilir
    const recommendations = this.extractRecommendations(response);
    const riskLevel = this.assessRiskLevel(context);
    const insights = this.extractInsights(response);

    return {
      analysis: response,
      recommendations,
      riskLevel,
      insights,
      confidence: 0.8,
      lastUpdated: new Date().toISOString()
    };
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.includes('öner') || line.includes('tavsiye') || line.includes('•') || line.includes('-')) {
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine.length > 10) {
          recommendations.push(cleanLine);
        }
      }
    }

    return recommendations.slice(0, 5); // En fazla 5 öneri
  }

  private assessRiskLevel(context: HealthContext): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Vital değerleri kontrolü
    if (context.vitals) {
      const { heartRate, bloodPressure, temperature } = context.vitals;
      
      if (heartRate && (heartRate < 60 || heartRate > 100)) riskScore += 1;
      if (bloodPressure && (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90)) riskScore += 2;
      if (temperature && (temperature < 36 || temperature > 37.5)) riskScore += 1;
    }

    // Semptom şiddeti
    if (context.symptoms) {
      const avgSeverity = context.symptoms.reduce((sum, s) => sum + s.severity, 0) / context.symptoms.length;
      if (avgSeverity > 7) riskScore += 2;
      else if (avgSeverity > 5) riskScore += 1;
    }

    if (riskScore >= 3) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }

  private extractInsights(response: string): string[] {
    const insights: string[] = [];
    const sentences = response.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 20 && 
          (cleanSentence.includes('önemli') || 
           cleanSentence.includes('dikkat') || 
           cleanSentence.includes('normal'))) {
        insights.push(cleanSentence);
      }
    }

    return insights.slice(0, 3);
  }
}
