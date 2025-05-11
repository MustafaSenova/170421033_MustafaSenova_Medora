/**
 * Sağlık verilerinin analizi için yardımcı fonksiyonlar
 */
import * as tf from '@tensorflow/tfjs';

// Yaşa ve cinsiyete göre normal kalp atış hızı aralıkları
interface HeartRateRange {
  min: number;
  max: number;
}

interface AgeRanges {
  [key: string]: HeartRateRange;
}

// Yetişkinler için istirahatte normal kalp atış hızı
const adultRestingHeartRate: HeartRateRange = {
  min: 60,
  max: 100,
};

// Taşikardi tespiti (kalp atış hızı > 100)
export const detectTachycardia = (heartRateBpm: number): boolean => {
  return heartRateBpm > 100;
};

// Bradikardi tespiti (kalp atış hızı < 60)
export const detectBradycardia = (heartRateBpm: number): boolean => {
  return heartRateBpm < 60;
};

// Kalp atış hızı anormallik tespiti
export const analyzeHeartRate = (heartRateBpm: number): {
  status: 'normal' | 'tachycardia' | 'bradycardia';
  message: string;
} => {
  if (detectTachycardia(heartRateBpm)) {
    return {
      status: 'tachycardia',
      message: 'Taşikardi: Kalp atış hızınız normalden yüksek.',
    };
  }

  if (detectBradycardia(heartRateBpm)) {
    return {
      status: 'bradycardia',
      message: 'Bradikardi: Kalp atış hızınız normalden düşük.',
    };
  }

  return {
    status: 'normal',
    message: 'Normal: Kalp atış hızınız normal aralıkta.',
  };
};

// Hipertansiyon tespiti
export const analyzeBloodPressure = (
  systolic: number,
  diastolic: number
): {
  status: 'normal' | 'elevated' | 'hypertension_1' | 'hypertension_2' | 'hypertensive_crisis';
  message: string;
} => {
  // Amerikan Kalp Derneği (AHA) sınıflandırması
  if (systolic < 120 && diastolic < 80) {
    return {
      status: 'normal',
      message: 'Normal kan basıncı.',
    };
  }

  if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
    return {
      status: 'elevated',
      message: 'Yüksek kan basıncı: Kan basıncınız normalin üstünde.',
    };
  }

  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      status: 'hypertension_1',
      message: 'Hipertansiyon Aşama 1: Kan basıncınız yüksek.',
    };
  }

  if (systolic >= 140 || diastolic >= 90) {
    return {
      status: 'hypertension_2',
      message: 'Hipertansiyon Aşama 2: Kan basıncınız çok yüksek.',
    };
  }

  if (systolic > 180 || diastolic > 120) {
    return {
      status: 'hypertensive_crisis',
      message: 'Hipertansif Kriz: Acil tıbbi yardım gerekebilir!',
    };
  }

  return {
    status: 'normal',
    message: 'Kan basıncı analizi yapılamadı.',
  };
};

// Vücut kitle indeksi (BMI) hesaplama
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// BMI sınıflandırma
export const analyzeBMI = (bmi: number): {
  status: 'underweight' | 'normal' | 'overweight' | 'obese';
  message: string;
} => {
  if (bmi < 18.5) {
    return {
      status: 'underweight',
      message: 'Düşük Kilo: BMI değeriniz normalin altında.',
    };
  }

  if (bmi >= 18.5 && bmi < 25) {
    return {
      status: 'normal',
      message: 'Normal Kilo: BMI değeriniz normal aralıkta.',
    };
  }

  if (bmi >= 25 && bmi < 30) {
    return {
      status: 'overweight',
      message: 'Fazla Kilo: BMI değeriniz normalin üstünde.',
    };
  }

  return {
    status: 'obese',
    message: 'Obezite: BMI değeriniz çok yüksek.',
  };
};

// Anomali tespit fonksiyonları
export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  confidence: number;
  message: string;
}

// TensorFlow.js modeli için Z-Score temelli anomali tespiti
export const detectAnomalyWithZScore = (
  data: number[], 
  threshold = 2.0
): AnomalyDetectionResult[] => {
  if (data.length < 2) {
    return [{ 
      isAnomaly: false, 
      confidence: 0, 
      message: 'Yetersiz veri: Anomali tespiti için en az 2 veri noktası gereklidir.' 
    }];
  }

  try {
    // Tensor oluştur
    const tensor = tf.tensor1d(data);
    
    // Ortalama ve standart sapma hesapla
    const mean = tensor.mean();
    const std = tensor.sub(mean).square().mean().sqrt();
    
    // Z-scores hesapla
    const meanVal = mean.dataSync()[0];
    const stdVal = std.dataSync()[0];
    
    // Belleği temizle
    tensor.dispose();
    mean.dispose();
    std.dispose();
    
    // Her veri noktası için Z-score hesapla ve anomali kontrolü yap
    return data.map(value => {
      const zScore = Math.abs((value - meanVal) / (stdVal || 1)); // Sıfıra bölünmeyi önle
      const isAnomaly = zScore > threshold;
      const confidence = Math.min(zScore / (threshold * 2), 1) * 100;
      
      return {
        isAnomaly,
        confidence,
        message: isAnomaly 
          ? `Anomali tespit edildi (güven: %${confidence.toFixed(1)})` 
          : 'Normal değer',
      };
    });
  } catch (error) {
    console.error('Anomali tespiti sırasında hata:', error);
    return [{ 
      isAnomaly: false, 
      confidence: 0, 
      message: 'Anomali analizi sırasında bir hata oluştu.' 
    }];
  }
};

// Kalp atış hızı verilerinde anomali tespiti
export const detectHeartRateAnomalies = (
  heartRates: number[]
): AnomalyDetectionResult[] => {
  return detectAnomalyWithZScore(heartRates, 2.5);
};

// Kan basıncı verilerinde anomali tespiti
export const detectBloodPressureAnomalies = (
  systolicValues: number[],
  diastolicValues: number[]
): {
  systolic: AnomalyDetectionResult[],
  diastolic: AnomalyDetectionResult[]
} => {
  return {
    systolic: detectAnomalyWithZScore(systolicValues, 2.5),
    diastolic: detectAnomalyWithZScore(diastolicValues, 2.5)
  };
};

// Trend analizi
export interface TrendAnalysisResult {
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  changeRate: number; // Yüzde olarak değişim
  message: string;
}

// Verilen sayı dizisindeki trendi analiz eder
export const analyzeTrend = (data: number[]): TrendAnalysisResult => {
  if (data.length < 3) {
    return {
      trend: 'stable',
      changeRate: 0,
      message: 'Trend analizi için yetersiz veri.'
    };
  }

  try {
    // Linear regresyon için x ve y verilerini oluştur
    const x = Array.from({ length: data.length }, (_, i) => i);
    const xTensor = tf.tensor1d(x);
    const yTensor = tf.tensor1d(data);
    
    // X ve Y değerlerini normalize et
    const xMean = xTensor.mean();
    const yMean = yTensor.mean();
    const xStd = xTensor.sub(xMean).square().mean().sqrt();
    const yStd = yTensor.sub(yMean).square().mean().sqrt();
    
    const xNorm = xTensor.sub(xMean).div(xStd);
    const yNorm = yTensor.sub(yMean).div(yStd);
    
    // Korelasyon hesapla
    const n = data.length;
    const sumXY = xNorm.mul(yNorm).sum();
    
    // Eğim hesapla
    const slope = sumXY.div(tf.scalar(n - 1));
    
    // Toplam değişim yüzdesi hesapla
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const changeRate = firstValue !== 0 ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100 : 0;
    
    // Değişkenliği hesapla
    const variability = yStd.div(yMean).mul(tf.scalar(100));
    
    // Tensörleri temizle
    xTensor.dispose();
    yTensor.dispose();
    xMean.dispose();
    yMean.dispose();
    xStd.dispose();
    yStd.dispose();
    xNorm.dispose();
    yNorm.dispose();
    sumXY.dispose();
    
    // Eğim ve değişkenlik değerlerini al
    const slopeVal = slope.dataSync()[0];
    const variabilityVal = variability.dataSync()[0] || 0;
    
    // Belleği temizle
    slope.dispose();
    variability.dispose();
    
    // Trend belirle
    let trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    let message: string;
    
    if (variabilityVal > 20) {
      trend = 'fluctuating';
      message = 'Değerlerinizde dalgalanma görülüyor.';
    } else if (Math.abs(slopeVal) < 0.1) {
      trend = 'stable';
      message = 'Değerleriniz kararlı bir seyir izliyor.';
    } else if (slopeVal > 0) {
      trend = 'increasing';
      message = `Değerlerinizde %${Math.abs(changeRate).toFixed(1)} oranında artış görülüyor.`;
    } else {
      trend = 'decreasing';
      message = `Değerlerinizde %${Math.abs(changeRate).toFixed(1)} oranında azalma görülüyor.`;
    }
    
    return {
      trend,
      changeRate,
      message
    };
  } catch (error) {
    console.error('Trend analizi sırasında hata:', error);
    return {
      trend: 'stable',
      changeRate: 0,
      message: 'Trend analizi yapılamadı.'
    };
  }
}; 