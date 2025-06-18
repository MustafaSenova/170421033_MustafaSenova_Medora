import { HealthContext, AIHealthResponse, ChatMessage, Symptom, Activity } from '../types/health';

/**
 * Mock AI Service - Gerçek AI olmadan test için
 */
export class MockAIService {
  
  async analyzeHealthData(context: HealthContext): Promise<AIHealthResponse> {
    // Simüle edilmiş gecikme
    await this.delay(1000);
    
    const analysis = this.generateMockAnalysis(context);
    const recommendations = this.generateMockRecommendations(context);
    const riskLevel = this.assessMockRiskLevel(context);
    const insights = this.generateMockInsights(context);

    return {
      analysis,
      recommendations,
      riskLevel,
      insights,
      confidence: 0.85,
      lastUpdated: new Date().toISOString(),
      actionItems: this.generateActionItems(context),
      followUpRecommended: riskLevel !== 'low'
    };
  }

  async chatWithHealthAssistant(
    message: string, 
    chatHistory: ChatMessage[] = [],
    userContext?: HealthContext
  ): Promise<string> {
    await this.delay(500);
    
    const lowerMessage = message.toLowerCase();
    
    // Basit keyword matching
    if (lowerMessage.indexOf('kalp') >= 0 || lowerMessage.indexOf('heart') >= 0) {
      return "💓 Kalp sağlığı için düzenli egzersiz ve sağlıklı beslenme çok önemli. Stres yönetimi de kalp sağlığınızı destekler. Düzenli kontroller yaptırmanızı öneririm.";
    }
    
    if (lowerMessage.indexOf('uyku') >= 0 || lowerMessage.indexOf('sleep') >= 0) {
      return "😴 Kaliteli uyku sağlığın temeli! Günde 7-9 saat uyku hedefleyin. Uyku öncesi ekran kullanımını azaltın ve rahatlatıcı bir rutininiz olsun.";
    }
    
    if (lowerMessage.indexOf('beslenme') >= 0 || lowerMessage.indexOf('diyet') >= 0) {
      return "🥗 Dengeli beslenme için çeşitli renklerde sebze ve meyve tüketin. Bol su için, işlenmiş gıdaları sınırlayın. Küçük sık öğünler tercih edin.";
    }
    
    if (lowerMessage.indexOf('egzersiz') >= 0 || lowerMessage.indexOf('spor') >= 0) {
      return "🏃‍♂️ Haftada en az 150 dakika orta yoğunlukta egzersiz yapın. Yürüyüş, yüzme, bisiklet gibi sevdiğiniz aktiviteleri seçin. Küçük adımlarla başlayın!";
    }
    
    if (lowerMessage.indexOf('stres') >= 0) {
      return "🧘‍♀️ Stres yönetimi için nefes egzersizleri, meditasyon ve hobiler etkili. Düzenli egzersiz ve yeterli uyku da stresi azaltır. Sosyal destek almayı unutmayın.";
    }
    
    if (lowerMessage.indexOf('kilo') >= 0 || lowerMessage.indexOf('weight') >= 0) {
      return "⚖️ Sağlıklı kilo yönetimi için dengeli beslenme ve düzenli egzersiz önemli. Hızlı kilo verme diyetlerinden kaçının. Uzun vadeli yaşam tarzı değişiklikleri yapın.";
    }

    // Genel sağlık soruları
    const generalResponses = [
      "🩺 Sağlığınızla ilgili endişeleriniz varsa mutlaka bir doktorla görüşün. Size nasıl yardımcı olabilirim?",
      "💊 Düzenli kontroller ve sağlıklı yaşam tarzı sağlığın temelini oluşturur. Hangi konuda bilgi almak istiyorsunuz?",
      "🏥 Sağlık konusunda size yardımcı olmaya hazırım. Lütfen daha spesifik bir soru sorun ki size daha iyi yardım edebileyim.",
      "🤔 Bu konuda size nasıl yardımcı olabilirim? Kalp sağlığı, beslenme, egzersiz veya uyku hakkında sorularınız var mı?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  private generateMockAnalysis(context: HealthContext): string {
    let analysis = "🔍 **Sağlık Analizi Raporu**\n\n";
    
    if (context.vitals) {
      analysis += "📊 **Vital Bulgular:**\n";
      const { vitals } = context;
      
      if (vitals.heartRate) {
        if (vitals.heartRate >= 60 && vitals.heartRate <= 100) {
          analysis += "✅ Kalp atış hızınız normal aralıkta\n";
        } else {
          analysis += "⚠️ Kalp atış hızınız normal aralığın dışında\n";
        }
      }
      
      if (vitals.bloodPressure) {
        const { systolic, diastolic } = vitals.bloodPressure;
        if (systolic < 140 && diastolic < 90) {
          analysis += "✅ Kan basıncınız normal seviyede\n";
        } else {
          analysis += "⚠️ Kan basıncınız yüksek görünüyor\n";
        }
      }
      
      analysis += "\n";
    }
    
    if (context.symptoms && context.symptoms.length > 0) {
      analysis += "🩺 **Semptom Değerlendirmesi:**\n";
      const avgSeverity = context.symptoms.reduce((sum: number, s: Symptom) => sum + s.severity, 0) / context.symptoms.length;
      
      if (avgSeverity < 4) {
        analysis += "✅ Semptomlarınız hafif seviyede\n";
      } else if (avgSeverity < 7) {
        analysis += "⚠️ Semptomlarınız orta seviyede\n";
      } else {
        analysis += "🚨 Semptomlarınız yoğun seviyede\n";
      }
      analysis += "\n";
    }
    
    analysis += "💡 **Genel Değerlendirme:**\n";
    analysis += "Sağlık verileriniz değerlendirildi. Aşağıdaki önerileri takip ederek sağlığınızı destekleyebilirsiniz.";
    
    return analysis;
  }

  private generateMockRecommendations(context: HealthContext): string[] {
    const recommendations: string[] = [];
    
    // Vital değerlere göre öneriler
    if (context.vitals?.heartRate && (context.vitals.heartRate < 60 || context.vitals.heartRate > 100)) {
      recommendations.push("Kalp atış hızınız için kardiyolog kontrolü yaptırın");
      recommendations.push("Düzenli kardiyovasküler egzersiz yapın");
    }
    
    if (context.vitals?.bloodPressure) {
      const { systolic } = context.vitals.bloodPressure;
      if (systolic > 140) {
        recommendations.push("Tuz tüketiminizi azaltın");
        recommendations.push("Kan basıncınızı düzenli takip edin");
      }
    }
    
    // Genel öneriler
    recommendations.push("Günde en az 8 bardak su için");
    recommendations.push("Haftada 3-4 gün egzersiz yapın");
    recommendations.push("Günde 7-9 saat kaliteli uyku alın");
    recommendations.push("Stres yönetimi teknikleri uygulayın");
    recommendations.push("Düzenli sağlık kontrolleri yaptırın");
    
    return recommendations.slice(0, 5);
  }

  private assessMockRiskLevel(context: HealthContext): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    if (context.vitals?.heartRate && (context.vitals.heartRate < 60 || context.vitals.heartRate > 100)) {
      riskScore += 1;
    }
    
    if (context.vitals?.bloodPressure) {
      const { systolic, diastolic } = context.vitals.bloodPressure;
      if (systolic > 140 || diastolic > 90) riskScore += 2;
    }
    
    if (context.symptoms && context.symptoms.length > 0) {
      const avgSeverity = context.symptoms.reduce((sum: number, s: Symptom) => sum + s.severity, 0) / context.symptoms.length;
      if (avgSeverity > 7) riskScore += 2;
      else if (avgSeverity > 5) riskScore += 1;
    }
    
    if (riskScore >= 3) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }

  private generateMockInsights(context: HealthContext): string[] {
    const insights: string[] = [];
    
    if (context.vitals?.heartRate) {
      if (context.vitals.heartRate >= 60 && context.vitals.heartRate <= 100) {
        insights.push("Kalp atış hızınız sağlıklı aralıkta");
      }
    }
    
    if (context.activities && context.activities.length > 0) {
      const totalCalories = context.activities.reduce((sum: number, a: Activity) => sum + (a.calories || 0), 0);
      if (totalCalories > 300) {
        insights.push("Aktif bir yaşam tarzınız var, bu harika!");
      }
    }
    
    insights.push("Düzenli takip sağlığınızı destekler");
    
    return insights.slice(0, 3);
  }

  private generateActionItems(context: HealthContext): string[] {
    const actions: string[] = [];
    
    if (context.vitals?.heartRate && context.vitals.heartRate > 100) {
      actions.push("Doktor randevusu alın");
    }
    
    actions.push("Su tüketimini artırın");
    actions.push("Egzersiz rutini oluşturun");
    
    return actions;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
