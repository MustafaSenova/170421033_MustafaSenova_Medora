import { StyleSheet, View, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { 
  HealthDataResponse
} from '@/utils/healthData';

// Development flag - mock data kullanmak için true yapın
const USE_MOCK_DATA = false;

// Mock data için geçici import
import { 
  mockFetchHealthData,
  mockConnectGoogleFit
} from '@/utils/mockHealthData';
// Gerçek Google Fit fonksiyonları
import { 
  connectGoogleFit as realConnectGoogleFit,
  fetchAllHealthData as realFetchAllHealthData
} from '@/utils/healthData';
// Import GoogleFit for authorization check
import GoogleFit from 'react-native-google-fit';

// Development moduna göre fonksiyonları seç
const connectGoogleFit = USE_MOCK_DATA ? mockConnectGoogleFit : realConnectGoogleFit;

// Unified fetchAllHealthData wrapper
const fetchAllHealthData = async (startDate?: string, endDate?: string) => {
  if (USE_MOCK_DATA) {
    return await mockFetchHealthData();
  } else {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required for real Google Fit API');
    }
    return await realFetchAllHealthData(startDate, endDate);
  }
};

import { 
  analyzeHeartRate, 
  analyzeBloodPressure, 
  calculateBMI, 
  analyzeBMI, 
  detectHeartRateAnomalies,
  detectBloodPressureAnomalies,
  analyzeTrend,
  TrendAnalysisResult,
  analyzeSteps,
  analyzeSleep,
  analyzeWaterIntake,
  analyzeCalories,
  analyzeExerciseWeekly
} from '@/utils/healthAnalysis';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import HealthTrendsCard from '@/components/HealthTrendsCard';
import HealthChart from '@/components/HealthChart';
import * as Haptics from 'expo-haptics';

const HealthDataScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<HealthDataResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // Google Fit bağlantısını sağlama
  const handleConnectGoogleFit = async () => {
    setLoading(true);
    try {
      const result = await connectGoogleFit();
      if (result.success) {
        setIsConnected(true);
        fetchData();
      } else {
        Alert.alert('Bağlantı Hatası', result.message || 'Google Fit ile bağlantı kurulamadı.');
      }
    } catch (error) {
      console.error('Google Fit bağlantı hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Son 30 günlük verileri çekme
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Tarih parametrelerini hazırla (mock data için kullanılmayacak ama gerekmez)
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const result = await fetchAllHealthData(startDate, endDate);
      
      if (result.success && result.data) {
        setHealthData(result.data);
      } else {
        Alert.alert('Veri Çekme Hatası', result.message || 'Veriler alınamadı.');
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      Alert.alert('Hata', 'Veriler alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    // Uygulama başlangıcında Google Fit bağlantı durumunu kontrol et
    const checkGoogleFitConnection = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Mock modda otomatik olarak bağlı kabul et
          setIsConnected(true);
          fetchData();
        } else {
          // burada gerçek Google Fit bağlantısını kontrol edebilirsiniz
          const isConnected = await GoogleFit.isAuthorized;
          if (isConnected) {
            setIsConnected(true);
            fetchData();
          }
        }
      } catch (error) {
        console.error('Google Fit bağlantı kontrolü hatası:', error);
      }
    };
    
    checkGoogleFitConnection();
  }, []);

  // Yenileme işlemi
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Detaylı analiz görünümünü aç/kapat
  const toggleDetailedAnalysis = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDetailedAnalysis(!showDetailedAnalysis);
  };

  // Kalp hızı verilerini işleme
  const getLatestHeartRate = () => {
    if (!healthData?.heartRate || healthData.heartRate.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    // En son kalp atış hızı verisini al
    const latestData = [...healthData.heartRate]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', analysis: null };
    }

    const analysis = analyzeHeartRate(latestData.value);
    return { 
      value: `${latestData.value} BPM`, 
      analysis: analysis
    };
  };

  // Kan basıncı verilerini işleme
  const getLatestBloodPressure = () => {
    if (!healthData?.bloodPressure || healthData.bloodPressure.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    // En son kan basıncı verisini al
    const latestData = [...healthData.bloodPressure]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', analysis: null };
    }

    const analysis = analyzeBloodPressure(latestData.systolic, latestData.diastolic);
    return { 
      value: `${latestData.systolic}/${latestData.diastolic} mmHg`, 
      analysis: analysis
    };
  };

  // Kilo verilerini işleme
  const getLatestWeight = () => {
    if (!healthData?.bodyMetrics?.weight || healthData.bodyMetrics.weight.length === 0) {
      return { value: 'Veri yok', weight: null };
    }
    
    // En son kilo verisini al
    const latestData = [...healthData.bodyMetrics.weight]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', weight: null };
    }

    return { 
      value: `${latestData.value.toFixed(1)} kg`, 
      weight: latestData.value
    };
  };

  // Boy verilerini işleme
  const getLatestHeight = () => {
    if (!healthData?.bodyMetrics?.height || healthData.bodyMetrics.height.length === 0) {
      return { value: 'Veri yok', height: null };
    }
    
    // En son boy verisini al
    const latestData = [...healthData.bodyMetrics.height]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', height: null };
    }

    const heightCm = latestData.value * 100;
    
    return { 
      value: `${heightCm.toFixed(1)} cm`, 
      height: heightCm
    };
  };

  // BMI hesaplama ve analiz
  const getBMIAnalysis = () => {
    const weightData = getLatestWeight();
    const heightData = getLatestHeight();

    if (!weightData.weight || !heightData.height) {
      return { value: 'Veri yok', analysis: null };
    }

    const bmiValue = calculateBMI(weightData.weight, heightData.height);
    const analysis = analyzeBMI(bmiValue);

    return {
      value: `${bmiValue.toFixed(1)}`,
      analysis: analysis
    };
  };

  // Kalp hızı trendini analiz et
  const getHeartRateTrend = (): TrendAnalysisResult | undefined => {
    if (!healthData?.heartRate || healthData.heartRate.length < 3) {
      return undefined;
    }

    // Son 7 gün içindeki verileri alıp sırala
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.heartRate
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 3) {
      return undefined;
    }

    const heartRateValues = recentData.map(item => item.value);
    return analyzeTrend(heartRateValues);
  };

  // Kalp hızı anomalilerini tespit et
  const getHeartRateAnomalies = () => {
    if (!healthData?.heartRate || healthData.heartRate.length < 2) {
      return undefined;
    }

    // Son 7 gün içindeki verileri alıp sırala
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.heartRate
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 2) {
      return undefined;
    }

    const heartRateValues = recentData.map(item => item.value);
    return detectHeartRateAnomalies(heartRateValues);
  };

  // Kan basıncı trendini analiz et
  const getBloodPressureTrend = (): TrendAnalysisResult | undefined => {
    if (!healthData?.bloodPressure || healthData.bloodPressure.length < 3) {
      return undefined;
    }

    // Son 7 gün içindeki verileri alıp sırala
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.bloodPressure
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 3) {
      return undefined;
    }

    // Sistolik değerleri kullanarak trend analizi yap
    const systolicValues = recentData.map(item => item.systolic);
    return analyzeTrend(systolicValues);
  };

  // Kilo trendini analiz et
  const getWeightTrend = (): TrendAnalysisResult | undefined => {
    if (!healthData?.bodyMetrics?.weight || healthData.bodyMetrics.weight.length < 3) {
      return undefined;
    }

    // Son 30 gün içindeki verileri alıp sırala
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentData = healthData.bodyMetrics.weight
      .filter(item => new Date(item.endDate) > thirtyDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 3) {
      return undefined;
    }

    const weightValues = recentData.map(item => item.value);
    return analyzeTrend(weightValues);
  };

  // Kalp atış hızı verilerini dizi olarak al
  const getHeartRateValues = (): number[] | undefined => {
    if (!healthData?.heartRate || healthData.heartRate.length < 2) {
      return undefined;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.heartRate
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 2) {
      return undefined;
    }

    return recentData.map(item => item.value);
  };

  // Kan basıncı verilerini dizi olarak al (sistolik)
  const getBloodPressureValues = (): number[] | undefined => {
    if (!healthData?.bloodPressure || healthData.bloodPressure.length < 2) {
      return undefined;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.bloodPressure
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 2) {
      return undefined;
    }

    return recentData.map(item => item.systolic);
  };

  // Kilo verilerini dizi olarak al
  const getWeightValues = (): number[] | undefined => {
    if (!healthData?.bodyMetrics?.weight || healthData.bodyMetrics.weight.length < 2) {
      return undefined;
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentData = healthData.bodyMetrics.weight
      .filter(item => new Date(item.endDate) > thirtyDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    if (recentData.length < 2) {
      return undefined;
    }

    return recentData.map(item => item.value);
  };

  // Adım verilerini al ve analiz et
  const getLatestSteps = () => {
    if (!healthData?.activityData?.steps || healthData.activityData.steps.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latestData = [...healthData.activityData.steps]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', analysis: null };
    }

    const analysis = analyzeSteps(latestData.value);
    return { 
      value: `${latestData.value.toLocaleString()} adım`, 
      analysis: analysis
    };
  };

  // Uyku verilerini al ve analiz et
  const getLatestSleep = () => {
    if (!healthData?.activityData?.sleep || healthData.activityData.sleep.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latestData = [...healthData.activityData.sleep]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', analysis: null };
    }

    const hours = Math.floor(latestData.duration / 60);
    const minutes = latestData.duration % 60;
    const analysis = analyzeSleep(latestData.duration, latestData.quality);
    
    return { 
      value: `${hours}s ${minutes}d`, 
      analysis: analysis,
      quality: latestData.quality
    };
  };

  // Su tüketimi verilerini al ve analiz et
  const getLatestWaterIntake = () => {
    if (!healthData?.activityData?.waterIntake || healthData.activityData.waterIntake.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latestData = [...healthData.activityData.waterIntake]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', analysis: null };
    }

    const analysis = analyzeWaterIntake(latestData.volume);
    return { 
      value: `${(latestData.volume / 1000).toFixed(1)} L`, 
      analysis: analysis
    };
  };

  // Kalori verilerini al ve analiz et
  const getLatestCalories = () => {
    if (!healthData?.activityData?.calories || healthData.activityData.calories.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latestData = [...healthData.activityData.calories]
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
    
    if (!latestData) {
      return { value: 'Veri yok', analysis: null };
    }

    const analysis = analyzeCalories(latestData.value);
    return { 
      value: `${latestData.value.toLocaleString()} kcal`, 
      analysis: analysis
    };
  };

  // Haftalık egzersiz süresi analizi
  const getWeeklyExercise = () => {
    if (!healthData?.activityData?.exercises || healthData.activityData.exercises.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyExercises = healthData.activityData.exercises
      .filter(item => new Date(item.endDate) > sevenDaysAgo);
    
    const totalMinutes = weeklyExercises.reduce((sum, exercise) => sum + exercise.duration, 0);
    const analysis = analyzeExerciseWeekly(totalMinutes);
    
    return { 
      value: `${totalMinutes} dakika`, 
      analysis: analysis,
      exerciseCount: weeklyExercises.length
    };
  };

  // Grafik için veri dizileri
  const getStepsValues = (): number[] | undefined => {
    if (!healthData?.activityData?.steps || healthData.activityData.steps.length < 2) {
      return undefined;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.activityData.steps
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    return recentData.map(item => item.value);
  };

  const getSleepValues = (): number[] | undefined => {
    if (!healthData?.activityData?.sleep || healthData.activityData.sleep.length < 2) {
      return undefined;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.activityData.sleep
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    return recentData.map(item => item.duration / 60); // saat cinsinden
  };

  const getWaterValues = (): number[] | undefined => {
    if (!healthData?.activityData?.waterIntake || healthData.activityData.waterIntake.length < 2) {
      return undefined;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.activityData.waterIntake
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    return recentData.map(item => item.volume / 1000); // litre cinsinden
  };

  const getCaloriesValues = (): number[] | undefined => {
    if (!healthData?.activityData?.calories || healthData.activityData.calories.length < 2) {
      return undefined;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentData = healthData.activityData.calories
      .filter(item => new Date(item.endDate) > sevenDaysAgo)
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    return recentData.map(item => item.value);
  };

  // Sağlık parametrelerini kart olarak gösterme komponenti
  const HealthCard = ({ 
    title, 
    value, 
    icon, 
    analysis = null 
  }: { 
    title: string; 
    value: string; 
    icon: JSX.Element;
    analysis?: { status: string; message: string } | null;
  }) => (
    <View style={styles.healthCard}>
      <View style={styles.cardIcon}>{icon}</View>
      <View style={styles.cardContent}>
        <Typo size={14} color={colors.textLighter}>{title}</Typo>
        <Typo size={20} fontWeight="700">{value}</Typo>
        {analysis && (
          <Typo 
            size={12} 
            color={getStatusColor(analysis.status)}
            style={styles.analysisText}
          >
            {analysis.message}
          </Typo>
        )}
      </View>
    </View>
  );

  // Durum rengini belirleme
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'normal':
        return colors.green;
      case 'tachycardia':
      case 'bradycardia':
      case 'elevated':
      case 'hypertension_1':
      case 'hypertension_2':
      case 'hypertensive_crisis':
      case 'underweight':
      case 'overweight':
      case 'obese':
        return colors.rose;
      default:
        return colors.textLighter;
    }
  };

  // Kalp atış hızı verileri
  const heartRateData = getLatestHeartRate();
  // Kan basıncı verileri
  const bloodPressureData = getLatestBloodPressure();
  // BMI verileri
  const bmiData = getBMIAnalysis();
  // Yeni metrikler
  const stepsData = getLatestSteps();
  const sleepData = getLatestSleep();
  const waterData = getLatestWaterIntake();
  const caloriesData = getLatestCalories();
  const exerciseData = getWeeklyExercise();

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Typo size={24} fontWeight="800" style={styles.title}>
            Sağlık Verilerim
          </Typo>
          
          {isConnected && (
            <TouchableOpacity 
              style={styles.analysisToggle}
              onPress={toggleDetailedAnalysis}
            >
              <Typo size={14} color={colors.textLighter}>
                {showDetailedAnalysis ? 'Özet Görünüm' : 'Detaylı Analiz'}
              </Typo>
              {showDetailedAnalysis ? (
                <Icons.ArrowsIn size={verticalScale(16)} color={colors.textLighter} />
              ) : (
                <Icons.ArrowsOut size={verticalScale(16)} color={colors.textLighter} />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {!isConnected ? (
          <View style={styles.connectContainer}>
            <Typo size={16} color={colors.textLighter} style={styles.infoText}>
              Sağlık verilerinizi görmek için Google Fit'e bağlanın.
            </Typo>
            <Button onPress={handleConnectGoogleFit} loading={loading} style={styles.connectButton}>
              <Typo fontWeight="700" color={colors.black} size={18}>
                Google Fit'e Bağlan
              </Typo>
            </Button>
          </View>
        ) : showDetailedAnalysis ? (
          // Detaylı analiz görünümü
          <View style={styles.dataContainer}>
            <Typo size={18} fontWeight="700" style={styles.sectionTitle}>
              Sağlık Verileri Analizi
            </Typo>
            
            {/* Temel Sağlık Metrikleri */}
            <HealthTrendsCard 
              title="Kalp Atış Hızı Analizi"
              icon={<Icons.Heart size={verticalScale(26)} color={colors.rose} weight="fill" />}
              data={getHeartRateValues()}
              trendAnalysis={getHeartRateTrend()}
              anomalyResults={getHeartRateAnomalies()}
              latestValue={heartRateData.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
            
            <HealthTrendsCard 
              title="Kan Basıncı Analizi"
              icon={<Icons.Drop size={verticalScale(26)} color={colors.rose} weight="fill" />}
              data={getBloodPressureValues()}
              trendAnalysis={getBloodPressureTrend()}
              latestValue={bloodPressureData.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
            
            <HealthTrendsCard 
              title="Kilo Takibi"
              icon={<Icons.Scales size={verticalScale(26)} color={colors.primary} weight="fill" />}
              data={getWeightValues()}
              trendAnalysis={getWeightTrend()}
              latestValue={getLatestWeight().value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />

            {/* Aktivite Grafikleri */}
            <Typo size={16} fontWeight="700" style={styles.activitySectionTitle}>
              Aktivite Grafikleri
            </Typo>

            {getStepsValues() && (
              <HealthChart
                title="Günlük Adım Sayısı"
                data={getStepsValues()!}
                type="bar"
                color={colors.green}
                unit=" adım"
                target={10000}
                showValues
              />
            )}

            {getSleepValues() && (
              <HealthChart
                title="Uyku Süresi"
                data={getSleepValues()!}
                type="line"
                color={colors.primary}
                unit=" saat"
                target={8}
                showValues
              />
            )}

            {getWaterValues() && (
              <HealthChart
                title="Su Tüketimi"
                data={getWaterValues()!}
                type="bar"
                color={colors.secondary}
                unit=" L"
                target={2.5}
                showValues
              />
            )}

            {getCaloriesValues() && (
              <HealthChart
                title="Günlük Kalori"
                data={getCaloriesValues()!}
                type="line"
                color={colors.rose}
                unit=" kcal"
                showValues
              />
            )}

            {/* Hedef Kartları */}
            <Typo size={16} fontWeight="700" style={styles.targetSectionTitle}>
              Günlük Hedefler
            </Typo>

            {getStepsValues() && (
              <HealthChart
                title="Adım Hedefi"
                data={getStepsValues()!}
                type="progress"
                color={colors.green}
                unit=" adım"
                target={10000}
              />
            )}

            {getWaterValues() && (
              <HealthChart
                title="Su İçme Hedefi"
                data={getWaterValues()!}
                type="progress"
                color={colors.secondary}
                unit=" L"
                target={2.5}
              />
            )}
            
            <Button onPress={fetchData} loading={loading} style={styles.refreshButton}>
              <Typo fontWeight="700" color={colors.black} size={16}>
                Verileri Güncelle
              </Typo>
            </Button>
          </View>
        ) : (
          // Standart görünüm
          <View style={styles.dataContainer}>
            {/* Özet Kart */}
            <View style={styles.summaryCard}>
              <Typo size={18} fontWeight="700" style={styles.summaryTitle}>
                Sağlık Durumu Özeti
              </Typo>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Icons.Heart size={verticalScale(18)} color={colors.rose} weight="fill" />
                  <Typo size={11} color={colors.textLighter}>Kalp Atışı</Typo>
                  <Typo size={13} fontWeight="600">{heartRateData.value}</Typo>
                </View>
                <View style={styles.summaryItem}>
                  <Icons.Drop size={verticalScale(18)} color={colors.rose} weight="fill" />
                  <Typo size={11} color={colors.textLighter}>Kan Basıncı</Typo>
                  <Typo size={13} fontWeight="600">{bloodPressureData.value}</Typo>
                </View>
                <View style={styles.summaryItem}>
                  <Icons.Footprints size={verticalScale(18)} color={colors.green} weight="fill" />
                  <Typo size={11} color={colors.textLighter}>Adım</Typo>
                  <Typo size={13} fontWeight="600">{stepsData.value.split(' ')[0]}</Typo>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Icons.MoonStars size={verticalScale(18)} color={colors.primary} weight="fill" />
                  <Typo size={11} color={colors.textLighter}>Uyku</Typo>
                  <Typo size={13} fontWeight="600">{sleepData.value}</Typo>
                </View>
                <View style={styles.summaryItem}>
                  <Icons.Drop size={verticalScale(18)} color={colors.secondary} weight="fill" />
                  <Typo size={11} color={colors.textLighter}>Su</Typo>
                  <Typo size={13} fontWeight="600">{waterData.value}</Typo>
                </View>
                <View style={styles.summaryItem}>
                  <Icons.ChartBar size={verticalScale(18)} color={colors.primary} weight="fill" />
                  <Typo size={11} color={colors.textLighter}>BMI</Typo>
                  <Typo size={13} fontWeight="600">{bmiData.value}</Typo>
                </View>
              </View>
            </View>

            <HealthCard 
              title="Kalp Atış Hızı" 
              value={heartRateData.value} 
              icon={<Icons.Heart size={verticalScale(26)} color={colors.rose} weight="fill" />} 
              analysis={heartRateData.analysis}
            />
            
            <HealthCard 
              title="Kan Basıncı" 
              value={bloodPressureData.value} 
              icon={<Icons.Drop size={verticalScale(26)} color={colors.rose} weight="fill" />} 
              analysis={bloodPressureData.analysis}
            />
            
            <HealthCard 
              title="Kilo" 
              value={getLatestWeight().value} 
              icon={<Icons.Scales size={verticalScale(26)} color={colors.primary} weight="fill" />} 
            />
            
            <HealthCard 
              title="Boy" 
              value={getLatestHeight().value} 
              icon={<Icons.Ruler size={verticalScale(26)} color={colors.primary} weight="fill" />} 
            />

            <HealthCard 
              title="Vücut Kitle İndeksi (BMI)" 
              value={bmiData.value} 
              icon={<Icons.ChartBar size={verticalScale(26)} color={colors.primary} weight="fill" />} 
              analysis={bmiData.analysis}
            />

            {/* Aktivite Metrikleri */}
            <HealthCard 
              title="Günlük Adım" 
              value={stepsData.value} 
              icon={<Icons.Footprints size={verticalScale(26)} color={colors.green} weight="fill" />} 
              analysis={stepsData.analysis}
            />

            <HealthCard 
              title="Uyku" 
              value={sleepData.value} 
              icon={<Icons.MoonStars size={verticalScale(26)} color={colors.primary} weight="fill" />} 
              analysis={sleepData.analysis}
            />

            <HealthCard 
              title="Su Tüketimi" 
              value={waterData.value} 
              icon={<Icons.Drop size={verticalScale(26)} color={colors.secondary} weight="fill" />} 
              analysis={waterData.analysis}
            />

            <HealthCard 
              title="Kalori" 
              value={caloriesData.value} 
              icon={<Icons.Fire size={verticalScale(26)} color={colors.rose} weight="fill" />} 
              analysis={caloriesData.analysis}
            />

            <HealthCard 
              title="Haftalık Egzersiz" 
              value={exerciseData.value} 
              icon={<Icons.Barbell size={verticalScale(26)} color={colors.green} weight="fill" />} 
              analysis={exerciseData.analysis}
            />
            
            <Button onPress={fetchData} loading={loading} style={styles.refreshButton}>
              <Typo fontWeight="700" color={colors.black} size={16}>
                Verileri Güncelle
              </Typo>
            </Button>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HealthDataScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._20,
  },
  title: {
    flex: 1,
  },
  analysisToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
    backgroundColor: colors.neutral800,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: spacingY._15,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacingY._20,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: spacingY._10,
  },
  connectButton: {
    width: '100%',
    maxWidth: 250,
  },
  dataContainer: {
    gap: spacingY._15,  
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral800,
    borderRadius: 12,
    padding: spacingY._15,
    paddingHorizontal: spacingX._20,
  },
  cardIcon: {
    marginRight: spacingX._15,
  },
  cardContent: {
    flex: 1,
  },
  analysisText: {
    marginTop: spacingY._5,
  },
  refreshButton: {
    marginTop: spacingY._20,
  },
  summaryCard: {
    backgroundColor: colors.neutral800,
    borderRadius: 12,
    padding: spacingY._15,
    marginBottom: spacingY._15,
  },
  summaryTitle: {
    marginBottom: spacingY._15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._10,
  },
  summaryItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingY._5,
    flex: 1,
  },
  activitySectionTitle: {
    marginBottom: spacingY._15,
    marginTop: spacingY._20,
  },
  targetSectionTitle: {
    marginBottom: spacingY._15,
    marginTop: spacingY._20,
  },
}); 