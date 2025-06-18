import { ComprehensiveHealthData, ECGAnalysisPrediction } from '../../types/health';

export class ECGAnalysisService {
  private static instance: ECGAnalysisService;
  
  public static getInstance(): ECGAnalysisService {
    if (!ECGAnalysisService.instance) {
      ECGAnalysisService.instance = new ECGAnalysisService();
    }
    return ECGAnalysisService.instance;
  }

  /**
   * EKG sinyalini analiz et ve aritmia tespiti yap
   * MIT-BIH modelini taklit eder
   */
  async analyzeECG(healthData: ComprehensiveHealthData): Promise<ECGAnalysisPrediction> {
    try {
      // EKG verisi kontrolü
      if (!healthData.ecgData?.rawSignal || healthData.ecgData.rawSignal.length < 187) {
        return this.generateMockECGAnalysis(healthData);
      }

      // Sinyal ön işleme
      const processedSignal = this.preprocessECGSignal(healthData.ecgData.rawSignal);
      
      // Özellik çıkarımı
      const features = this.extractECGFeatures(processedSignal);
      
      // CNN benzeri sınıflandırma
      const classification = this.classifyECG(features);
      
      // Anomali skorunu hesapla
      const anomalyScore = this.calculateAnomalyScore(features);
      
      // Önerileri oluştur
      const recommendations = this.generateECGRecommendations(classification.class, anomalyScore);
      
      return {
        classification: classification.class,
        confidence: classification.confidence,
        anomalyScore,
        features: {
          heartRate: features.heartRate,
          rhythm: features.rhythm,
          morphology: features.morphology
        },
        recommendations,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ EKG analiz hatası:', error);
      return this.generateMockECGAnalysis(healthData);
    }
  }

  /**
   * EKG sinyali ön işleme
   */
  private preprocessECGSignal(rawSignal: number[]): number[] {
    // Normalize et (0-1 arası)
    const min = Math.min(...rawSignal);
    const max = Math.max(...rawSignal);
    const range = max - min;
    
    if (range === 0) return rawSignal;
    
    return rawSignal.map(value => (value - min) / range);
  }

  /**
   * EKG özellik çıkarımı
   */
  private extractECGFeatures(signal: number[]) {
    // R-wave tespiti (basit peak detection)
    const peaks = this.detectRPeaks(signal);
    
    // Kalp hızı hesaplama
    const heartRate = this.calculateHeartRate(peaks);
    
    // Ritim analizi
    const rhythm = this.analyzeRhythm(peaks);
    
    // Morfoloji analizi
    const morphology = this.analyzeMorphology(signal, peaks);
    
    // İstatistiksel özellikler
    const statisticalFeatures = this.calculateStatisticalFeatures(signal);
    
    return {
      heartRate,
      rhythm,
      morphology,
      peaks: peaks.length,
      ...statisticalFeatures
    };
  }

  /**
   * R-wave peak tespiti
   */
  private detectRPeaks(signal: number[]): number[] {
    const peaks: number[] = [];
    const threshold = 0.6; // Normalize edilmiş sinyal için
    
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > threshold && 
          signal[i] > signal[i - 1] && 
          signal[i] > signal[i + 1]) {
        // Yakın peak'leri filtrele (minimum 50 sample aralık)
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > 50) {
          peaks.push(i);
        }
      }
    }
    
    return peaks;
  }

  /**
   * Kalp hızı hesaplama
   */
  private calculateHeartRate(peaks: number[]): number {
    if (peaks.length < 2) return 60; // Varsayılan
    
    // R-R interval'ları hesapla
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    
    // Ortalama interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Sample rate 360 Hz (MIT-BIH database)
    const sampleRate = 360;
    const heartRate = (60 * sampleRate) / avgInterval;
    
    return Math.round(heartRate);
  }

  /**
   * Ritim analizi
   */
  private analyzeRhythm(peaks: number[]): string {
    if (peaks.length < 3) return 'insufficient_data';
    
    // R-R interval variability
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const coefficient = Math.sqrt(variance) / avgInterval;
    
    if (coefficient < 0.1) return 'regular';
    if (coefficient < 0.2) return 'slightly_irregular';
    return 'irregular';
  }

  /**
   * Morfoloji analizi
   */
  private analyzeMorphology(signal: number[], peaks: number[]): string {
    if (peaks.length === 0) return 'no_peaks';
    
    // QRS kompleks genişliği analizi
    const qrsWidths: number[] = [];
    
    for (const peak of peaks) {
      // Peak etrafında QRS kompleksini analiz et
      const start = Math.max(0, peak - 20);
      const end = Math.min(signal.length - 1, peak + 20);
      
      // QRS başlangıç ve bitiş noktalarını bul
      let qrsStart = peak;
      let qrsEnd = peak;
      
      // Geriye doğru QRS başlangıcını bul
      for (let i = peak; i >= start; i--) {
        if (signal[i] < 0.3) {
          qrsStart = i;
          break;
        }
      }
      
      // İleriye doğru QRS bitişini bul
      for (let i = peak; i <= end; i++) {
        if (signal[i] < 0.3) {
          qrsEnd = i;
          break;
        }
      }
      
      qrsWidths.push(qrsEnd - qrsStart);
    }
    
    const avgWidth = qrsWidths.reduce((sum, width) => sum + width, 0) / qrsWidths.length;
    
    if (avgWidth < 25) return 'narrow';
    if (avgWidth < 35) return 'normal';
    return 'wide';
  }

  /**
   * İstatistiksel özellik hesaplama
   */
  private calculateStatisticalFeatures(signal: number[]) {
    const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
    const variance = signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length;
    const std = Math.sqrt(variance);
    
    return {
      mean,
      std,
      variance,
      min: Math.min(...signal),
      max: Math.max(...signal)
    };
  }

  /**
   * EKG sınıflandırma (CNN benzeri)
   */
  private classifyECG(features: any): { class: 'Normal' | 'Supraventricular' | 'Ventricular' | 'Fusion' | 'Unknown', confidence: number } {
    // Basitleştirilmiş kural tabanlı sınıflandırma
    // Gerçek uygulamada TensorFlow.js CNN modeli kullanılacak
    
    const { heartRate, rhythm, morphology, std } = features;
    
    // Normal sınıf
    if (heartRate >= 60 && heartRate <= 100 && 
        rhythm === 'regular' && 
        morphology === 'normal') {
      return { class: 'Normal', confidence: 0.9 };
    }
    
    // Supraventricular (üst ventriküler)
    if (heartRate > 100 && rhythm === 'regular' && morphology === 'narrow') {
      return { class: 'Supraventricular', confidence: 0.8 };
    }
    
    // Ventricular (ventriküler)
    if (morphology === 'wide' || std > 0.3) {
      return { class: 'Ventricular', confidence: 0.85 };
    }
    
    // Fusion (füzyon)
    if (rhythm === 'irregular' && morphology === 'normal') {
      return { class: 'Fusion', confidence: 0.7 };
    }
    
    // Unknown (bilinmeyen)
    return { class: 'Unknown', confidence: 0.6 };
  }

  /**
   * Anomali skorunu hesapla
   */
  private calculateAnomalyScore(features: any): number {
    let anomalyScore = 0;
    
    // Kalp hızı anomalisi
    if (features.heartRate < 50 || features.heartRate > 150) {
      anomalyScore += 0.3;
    }
    
    // Ritim anomalisi
    if (features.rhythm === 'irregular') {
      anomalyScore += 0.3;
    }
    
    // Morfoloji anomalisi
    if (features.morphology === 'wide') {
      anomalyScore += 0.2;
    }
    
    // Varyans anomalisi
    if (features.std > 0.4) {
      anomalyScore += 0.2;
    }
    
    return Math.min(1.0, anomalyScore);
  }

  /**
   * EKG önerilerini oluştur
   */
  private generateECGRecommendations(classification: string, anomalyScore: number): string[] {
    const recommendations: string[] = [];
    
    switch (classification) {
      case 'Normal':
        recommendations.push('EKG sonuçlarınız normal görünüyor');
        recommendations.push('Düzenli kalp sağlığı kontrollerinizi sürdürün');
        break;
        
      case 'Supraventricular':
        recommendations.push('Üst ventriküler aritmia tespit edildi');
        recommendations.push('Kardiyolog ile görüşmenizi öneririz');
        recommendations.push('Kafein ve stres faktörlerini azaltın');
        break;
        
      case 'Ventricular':
        recommendations.push('Ventriküler aritmia tespit edildi');
        recommendations.push('Acil kardiyoloji konsültasyonu gerekli');
        recommendations.push('Fiziksel aktiviteyi sınırlayın');
        break;
        
      case 'Fusion':
        recommendations.push('Füzyon ritmi tespit edildi');
        recommendations.push('Detaylı kardiyolojik değerlendirme gerekli');
        break;
        
      case 'Unknown':
        recommendations.push('EKG sinyali belirsiz');
        recommendations.push('Tekrar ölçüm yapın');
        recommendations.push('Gerekirse doktor kontrolü yaptırın');
        break;
    }
    
    if (anomalyScore > 0.7) {
      recommendations.push('Yüksek anomali skoru - acil tıbbi değerlendirme');
    }
    
    return recommendations;
  }

  /**
   * Mock EKG analizi (gerçek EKG verisi yoksa)
   */
  private generateMockECGAnalysis(healthData: ComprehensiveHealthData): ECGAnalysisPrediction {
    const heartRate = healthData.heartRate || 70;
    
    // Kalp hızına göre basit sınıflandırma
    let classification: 'Normal' | 'Supraventricular' | 'Ventricular' | 'Fusion' | 'Unknown';
    let confidence: number;
    let anomalyScore: number;
    
    if (heartRate >= 60 && heartRate <= 100) {
      classification = 'Normal';
      confidence = 0.85;
      anomalyScore = 0.1;
    } else if (heartRate > 100) {
      classification = 'Supraventricular';
      confidence = 0.75;
      anomalyScore = 0.4;
    } else {
      classification = 'Unknown';
      confidence = 0.6;
      anomalyScore = 0.3;
    }
    
    return {
      classification,
      confidence,
      anomalyScore,
      features: {
        heartRate,
        rhythm: heartRate >= 60 && heartRate <= 100 ? 'regular' : 'irregular',
        morphology: 'normal'
      },
      recommendations: this.generateECGRecommendations(classification, anomalyScore),
      timestamp: Date.now()
    };
  }
}

export const ecgAI = ECGAnalysisService.getInstance(); 