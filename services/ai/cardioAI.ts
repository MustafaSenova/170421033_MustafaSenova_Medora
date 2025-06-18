import { ComprehensiveHealthData, CardiovascularRiskPrediction } from '../../types/health';

export class CardiovascularAIService {
  private static instance: CardiovascularAIService;
  
  public static getInstance(): CardiovascularAIService {
    if (!CardiovascularAIService.instance) {
      CardiovascularAIService.instance = new CardiovascularAIService();
    }
    return CardiovascularAIService.instance;
  }

  /**
   * Kardiyovasküler risk tahminini yap
   * Python modelindeki özellik mühendisliğini taklit eder
   */
  async predictCardiovascularRisk(healthData: ComprehensiveHealthData): Promise<CardiovascularRiskPrediction> {
    try {
      // Özellik çıkarımı (Python kodundaki gibi)
      const features = this.extractFeatures(healthData);
      
      // Neural network tahmini (basitleştirilmiş)
      const riskScore = this.calculateRiskScore(features);
      
      // Risk seviyesi belirleme
      const riskLevel = this.determineRiskLevel(riskScore);
      
      // Önerileri oluştur
      const recommendations = this.generateRecommendations(features, riskLevel);
      
      return {
        riskScore,
        riskLevel,
        confidence: this.calculateConfidence(features),
        factors: features,
        recommendations,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Kardiyovasküler risk tahmini hatası:', error);
      throw error;
    }
  }

  /**
   * Sağlık verilerinden özellik çıkarımı
   */
  private extractFeatures(data: ComprehensiveHealthData) {
    // Yaş (gün cinsinden yıla çevir)
    const age = data.timestamp ? (Date.now() - data.timestamp) / (365.25 * 24 * 60 * 60 * 1000) : 30;
    const ageYears = Math.min(Math.max(age, 18), 100); // 18-100 arası sınırla
    
    // Cinsiyet (varsayılan: erkek=1, kadın=0)
    const gender = 1; // Bu veri user profile'dan gelecek
    
    // Boy-kilo ve BMI
    const height = data.height || 170; // cm
    const weight = data.weight || 70; // kg
    const bmi = weight / ((height / 100) ** 2);
    
    // Kan basıncı
    const systolic = data.bloodPressure?.systolic || 120;
    const diastolic = data.bloodPressure?.diastolic || 80;
    
    // Kolesterol ve glukoz (varsayılan normal değerler)
    const cholesterol = data.cholesterol?.total ? 
      (data.cholesterol.total > 200 ? 2 : data.cholesterol.total > 160 ? 1 : 0) : 1;
    const glucose = data.glucose ? 
      (data.glucose > 126 ? 2 : data.glucose > 100 ? 1 : 0) : 1;
    
    // Yaşam tarzı faktörleri
    const smoke = this.getSmokingScore(data.smokingStatus);
    const alcohol = this.getAlcoholScore(data.alcoholConsumption);
    const active = this.getActivityScore(data.physicalActivity, data.steps);
    
    // Python modelindeki özellik mühendisliği
    const pressureRisk = (systolic * diastolic) / 100;
    const lifestyleRisk = smoke + alcohol + (active > 0 ? 0 : 1); // Aktif değilse risk
    const metabolicRisk = cholesterol + glucose;
    
    return {
      age: this.normalizeAge(ageYears),
      gender: gender,
      bmi: this.normalizeBMI(bmi),
      bloodPressure: this.normalizeBloodPressure(systolic, diastolic),
      lifestyle: this.normalizeLifestyle(lifestyleRisk),
      metabolic: this.normalizeMetabolic(metabolicRisk)
    };
  }

  /**
   * Risk skorunu hesapla (Neural Network benzeri)
   */
  private calculateRiskScore(features: any): number {
    // Basitleştirilmiş neural network tahmini
    // Gerçek modelde bu TensorFlow.js ile yapılacak
    
    const weights = {
      age: 0.25,
      gender: 0.10,
      bmi: 0.20,
      bloodPressure: 0.25,
      lifestyle: 0.15,
      metabolic: 0.05
    };
    
    let score = 0;
    score += features.age * weights.age;
    score += features.gender * weights.gender;
    score += features.bmi * weights.bmi;
    score += features.bloodPressure * weights.bloodPressure;
    score += features.lifestyle * weights.lifestyle;
    score += features.metabolic * weights.metabolic;
    
    // Sigmoid aktivasyon fonksiyonu
    return 1 / (1 + Math.exp(-score));
  }

  /**
   * Risk seviyesini belirle
   */
  private determineRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (score < 0.25) return 'low';
    if (score < 0.5) return 'moderate';
    if (score < 0.75) return 'high';
    return 'very_high';
  }

  /**
   * Güven skorunu hesapla
   */
  private calculateConfidence(features: any): number {
    // Veri kalitesine göre güven skoru
    let confidence = 0.8; // Temel güven
    
    // Eksik veri varsa güveni azalt
    const featureCount = Object.values(features).filter(v => v !== null && v !== undefined).length;
    confidence *= featureCount / 6;
    
    return Math.max(0.5, Math.min(1.0, confidence));
  }

  /**
   * Önerileri oluştur
   */
  private generateRecommendations(features: any, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (features.bmi > 0.7) {
      recommendations.push('Kilo kontrolü için düzenli egzersiz yapın');
      recommendations.push('Sağlıklı beslenme planı uygulayın');
    }
    
    if (features.bloodPressure > 0.6) {
      recommendations.push('Kan basıncınızı düzenli kontrol ettirin');
      recommendations.push('Tuz tüketimini azaltın');
    }
    
    if (features.lifestyle > 0.5) {
      recommendations.push('Sigara ve alkol tüketimini azaltın');
      recommendations.push('Düzenli fiziksel aktivite yapın');
    }
    
    if (riskLevel === 'high' || riskLevel === 'very_high') {
      recommendations.push('Acil olarak kardiyolog ile görüşün');
      recommendations.push('Günlük ilaç kullanımınızı gözden geçirin');
    }
    
    return recommendations;
  }

  // Normalizasyon fonksiyonları
  private normalizeAge(age: number): number {
    return Math.min(1, age / 80); // 80 yaş maksimum
  }

  private normalizeBMI(bmi: number): number {
    if (bmi < 18.5) return 0.2;
    if (bmi < 25) return 0.0;
    if (bmi < 30) return 0.5;
    return 1.0;
  }

  private normalizeBloodPressure(systolic: number, diastolic: number): number {
    const systolicScore = systolic > 140 ? 1 : systolic > 130 ? 0.7 : systolic > 120 ? 0.3 : 0;
    const diastolicScore = diastolic > 90 ? 1 : diastolic > 80 ? 0.7 : diastolic > 70 ? 0.3 : 0;
    return Math.max(systolicScore, diastolicScore);
  }

  private normalizeLifestyle(score: number): number {
    return Math.min(1, score / 3); // Maksimum 3 risk faktörü
  }

  private normalizeMetabolic(score: number): number {
    return Math.min(1, score / 4); // Maksimum 4 puan
  }

  // Yaşam tarzı skorlama
  private getSmokingScore(status?: string): number {
    switch (status) {
      case 'current': return 2;
      case 'former': return 1;
      case 'never': return 0;
      default: return 0;
    }
  }

  private getAlcoholScore(consumption?: string): number {
    switch (consumption) {
      case 'heavy': return 2;
      case 'moderate': return 1;
      case 'light': return 0.5;
      case 'none': return 0;
      default: return 0;
    }
  }

  private getActivityScore(activity?: string, steps?: number): number {
    if (steps && steps > 10000) return 2;
    if (steps && steps > 5000) return 1;
    
    switch (activity) {
      case 'vigorous': return 2;
      case 'moderate': return 1;
      case 'light': return 0.5;
      case 'sedentary': return 0;
      default: return steps ? (steps > 3000 ? 0.5 : 0) : 0;
    }
  }
}

export const cardioAI = CardiovascularAIService.getInstance(); 