import { HealthContext, AIHealthResponse, ChatMessage } from '../types/health';

/**
 * Mock AI Service - OpenAI quota dolduğunda veya test için kullanılır
 * Gerçek AI yanıtlarına benzer akıllı yanıtlar üretir
 */
export class MockAIService {
  
  /**
   * Sağlık verisi analizi (Mock)
   */
  async analyzeHealthData(context: HealthContext): Promise<AIHealthResponse> {
    const { userProfile, currentMetrics } = context;
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    const alerts: string[] = [];
    
    // Kalp atışı analizi
    if (currentMetrics.heartRate && currentMetrics.heartRate.length > 0) {
      const latest = currentMetrics.heartRate[currentMetrics.heartRate.length - 1];
      if (latest.value > 100) {
        insights.push('Kalp atış hızınız normalin üstünde.');
        recommendations.push('Derin nefes alıp biraz dinlenmeyi deneyin.');
        alerts.push('Yüksek kalp atışı tespit edildi');
      } else if (latest.value < 60) {
        insights.push('Kalp atış hızınız normalin altında.');
        recommendations.push('Düzenli egzersiz yapıp kardiyoloji kontrolü yaptırın.');
      } else {
        insights.push('Kalp atış hızınız normal aralıkta.');
        recommendations.push('Mevcut aktivite düzeyinizi koruyun.');
      }
    }

    // Kan basıncı analizi
    if (currentMetrics.bloodPressure && currentMetrics.bloodPressure.length > 0) {
      const latest = currentMetrics.bloodPressure[currentMetrics.bloodPressure.length - 1];
      if (latest.systolic >= 140 || latest.diastolic >= 90) {
        insights.push('Kan basıncınız yüksek seviyede.');
        recommendations.push('Tuz tüketimini azaltın ve doktora başvurun.');
        alerts.push('Hipertansiyon riski');
      } else if (latest.systolic >= 130 || latest.diastolic >= 80) {
        insights.push('Kan basıncınız hafif yüksek.');
        recommendations.push('Düzenli egzersiz ve sağlıklı beslenme önerilir.');
      } else {
        insights.push('Kan basıncınız ideal seviyede.');
      }
    }

    // Uyku analizi
    if (currentMetrics.sleep && currentMetrics.sleep.length > 0) {
      const latest = currentMetrics.sleep[currentMetrics.sleep.length - 1];
      const hours = latest.duration / 60;
      if (hours < 6) {
        insights.push('Uyku süreniz yetersiz.');
        recommendations.push('Günde en az 7-8 saat uyumaya çalışın.');
        alerts.push('Yetersiz uyku süresi');
      } else if (hours >= 7 && hours <= 9) {
        insights.push('Uyku süreniz ideal aralıkta.');
        recommendations.push('Mevcut uyku rutininizi koruyun.');
      }
    }

    // Aktivite analizi
    if (currentMetrics.activity && currentMetrics.activity.length > 0) {
      const latest = currentMetrics.activity[currentMetrics.activity.length - 1];
      if (latest.steps < 5000) {
        recommendations.push('Günlük adım sayınızı artırmaya çalışın.');
      } else if (latest.steps >= 10000) {
        insights.push('Harika! Günlük adım hedefinizi aşıyorsunuz.');
      }
    }

    // Risk değerlendirmesi
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    const riskFactors: string[] = [];

    if (alerts.length > 2) {
      riskLevel = 'high';
      riskFactors.push('Birden fazla sağlık parametresi dikkat gerektiriyor');
    } else if (alerts.length > 0) {
      riskLevel = 'moderate';
      riskFactors.push('Bazı parametreler takip gerektiriyor');
    }

    if (userProfile.age > 50) {
      riskFactors.push('Yaş faktörü');
    }

    return {
      insights: insights.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
      alerts: alerts.slice(0, 2),
      riskAssessment: {
        level: riskLevel,
        factors: riskFactors
      },
      confidence: 0.85
    };
  }

  /**
   * Sohbet sistemi (Mock)
   */
  async chatWithHealthAssistant(
    message: string, 
    context: HealthContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    const lowerMessage = message.toLowerCase();
    const { currentMetrics } = context;

    // Kalp atışı soruları
    if (lowerMessage.includes('kalp') || lowerMessage.includes('nabız')) {
      const heartRate = currentMetrics.heartRate?.[currentMetrics.heartRate.length - 1]?.value;
      if (heartRate) {
        if (heartRate > 100) {
          return `Kalp atış hızınız ${heartRate} BPM ile normalin üstünde. Biraz dinlenip derin nefes almayı deneyin. Eğer devam ederse doktora başvurun.`;
        } else if (heartRate < 60) {
          return `Kalp atış hızınız ${heartRate} BPM ile normalin altında. Bu sporcular için normal olabilir, ancak kontrole gidin.`;
        } else {
          return `Kalp atış hızınız ${heartRate} BPM ile normal aralıkta. Endişe etmenize gerek yok!`;
        }
      }
      return 'Kalp atış hızı veriniz bulunmuyor. Ölçüm yapmanızı öneririm.';
    }

    // Kan basıncı soruları
    if (lowerMessage.includes('kan basıncı') || lowerMessage.includes('tansiyon')) {
      const bp = currentMetrics.bloodPressure?.[currentMetrics.bloodPressure.length - 1];
      if (bp) {
        if (bp.systolic >= 140 || bp.diastolic >= 90) {
          return `Kan basıncınız ${bp.systolic}/${bp.diastolic} ile yüksek. Doktora başvurmanızı ve tuz tüketimini azaltmanızı öneririm.`;
        } else {
          return `Kan basıncınız ${bp.systolic}/${bp.diastolic} ile normal seviyede. Harika!`;
        }
      }
      return 'Kan basıncı veriniz bulunmuyor. Ölçüm yaptırmanızı öneririm.';
    }

    // Uyku soruları
    if (lowerMessage.includes('uyku') || lowerMessage.includes('yorgun')) {
      const sleep = currentMetrics.sleep?.[currentMetrics.sleep.length - 1];
      if (sleep) {
        const hours = sleep.duration / 60;
        if (hours < 6) {
          return `${hours.toFixed(1)} saat uyku yetersiz. Günde 7-8 saat uyumaya çalışın. Bu yorgunluğun sebebi olabilir.`;
        } else {
          return `${hours.toFixed(1)} saat uyku iyi. Yorgunluk başka sebeplerden olabilir. Su içmeyi unutmayın!`;
        }
      }
      return 'Uyku veriniz bulunmuyor. Uyku kalitenizi takip etmenizi öneririm.';
    }

    // Genel sağlık soruları
    if (lowerMessage.includes('nasılım') || lowerMessage.includes('durum')) {
      const analysis = await this.analyzeHealthData(context);
      const positive = analysis.insights.filter(i => i.includes('normal') || i.includes('ideal')).length;
      
      if (positive >= 2) {
        return 'Genel sağlık durumunuz iyi görünüyor! Mevcut rutininizi koruyun.';
      } else if (analysis.alerts.length > 0) {
        return 'Bazı parametreleriniz dikkat gerektiriyor. Detaylı analizi kontrol edin ve gerekirse doktora başvurun.';
      } else {
        return 'Sağlık verileriniz normal aralıkta. Düzenli takip yapmaya devam edin.';
      }
    }

    // Motivasyon ve destek
    if (lowerMessage.includes('motivasyon') || lowerMessage.includes('öneri')) {
      const tips = [
        'Günlük 10.000 adım atmaya çalışın!',
        'Düzenli su içmeyi unutmayın - günde 2-3 litre ideal.',
        'Stres yönetimi için derin nefes egzersizleri yapın.',
        'Kaliteli uyku için akşam rutini oluşturun.',
        'Düzenli egzersiz hem fiziksel hem mental sağlığa iyi gelir.'
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    // Varsayılan yanıt
    return 'Size nasıl yardımcı olabilirim? Kalp atışı, kan basıncı, uyku veya genel sağlık durumunuz hakkında sorular sorabilirsiniz.';
  }

  /**
   * Proaktif uyarılar (Mock)
   */
  async generateProactiveAlerts(context: HealthContext): Promise<string[]> {
    const { currentMetrics } = context;
    const alerts: string[] = [];

    // Kalp atışı uyarıları
    if (currentMetrics.heartRate && currentMetrics.heartRate.length >= 3) {
      const recent = currentMetrics.heartRate.slice(-3);
      const avgHR = recent.reduce((sum, hr) => sum + hr.value, 0) / recent.length;
      
      if (avgHR > 90) {
        alerts.push('Son kalp atışlarınız yüksek - dinlenmeye odaklanın');
      }
    }

    // Uyku uyarıları
    if (currentMetrics.sleep && currentMetrics.sleep.length >= 2) {
      const recent = currentMetrics.sleep.slice(-2);
      const avgSleep = recent.reduce((sum, s) => sum + s.duration, 0) / (recent.length * 60);
      
      if (avgSleep < 6.5) {
        alerts.push('Uyku süreniz yetersiz - erken yatmaya çalışın');
      }
    }

    // Aktivite uyarıları
    if (currentMetrics.activity && currentMetrics.activity.length > 0) {
      const latest = currentMetrics.activity[currentMetrics.activity.length - 1];
      
      if (latest.steps < 3000) {
        alerts.push('Bugün az hareket ettiniz - kısa yürüyüş yapın');
      }
    }

    return alerts;
  }

  /**
   * Kapsamlı sağlık raporu (Bonus)
   */
  async generateHealthReport(context: HealthContext): Promise<string> {
    const analysis = await this.analyzeHealthData(context);
    const { userProfile } = context;
    
    let report = `🏥 ${userProfile.age} Yaş Sağlık Raporu\n\n`;
    
    report += `📊 GENEL DURUM\n`;
    analysis.insights.forEach(insight => {
      report += `• ${insight}\n`;
    });
    
    report += `\n💡 ÖNERİLER\n`;
    analysis.recommendations.forEach(rec => {
      report += `• ${rec}\n`;
    });
    
    if (analysis.alerts.length > 0) {
      report += `\n⚠️ DİKKAT NOKTALAR\n`;
      analysis.alerts.forEach(alert => {
        report += `• ${alert}\n`;
      });
    }
    
    report += `\n📈 RİSK DEĞERLENDİRMESİ\n`;
    report += `Risk Seviyesi: ${analysis.riskAssessment?.level.toUpperCase()}\n`;
    if (analysis.riskAssessment?.factors.length) {
      analysis.riskAssessment.factors.forEach(factor => {
        report += `• ${factor}\n`;
      });
    }
    
    report += `\n✅ Bu rapor AI tarafından oluşturulmuştur. Tıbbi karar için doktorunuza başvurun.`;
    
    return report;
  }
}
