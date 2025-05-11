import { StyleSheet, View, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { 
  connectGoogleFit, 
  fetchAllHealthData, 
  HeartRateResponse, 
  BloodPressureResponse, 
  WeightResponse,
  HealthDataResponse
} from '@/utils/healthData';
import { 
  analyzeHeartRate, 
  analyzeBloodPressure, 
  calculateBMI, 
  analyzeBMI, 
  detectHeartRateAnomalies,
  detectBloodPressureAnomalies,
  analyzeTrend,
  TrendAnalysisResult
} from '@/utils/healthAnalysis';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import HealthTrendsCard from '@/components/HealthTrendsCard';
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
      // Son 30 günlük tarih aralığı
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
        // burada gerçek Google Fit bağlantısını kontrol edebilirsiniz
        // Şimdilik sahte veri için geçici bir çözüm
        setIsConnected(true);
        fetchData();
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
            
            <HealthTrendsCard 
              title="Kalp Atış Hızı Analizi"
              icon={<Icons.Heart size={verticalScale(26)} color={colors.rose} weight="fill" />}
              data={getHeartRateValues()}
              trendAnalysis={getHeartRateTrend()}
              anomalyResults={getHeartRateAnomalies()}
              latestValue={heartRateData.value}
              onPress={() => {
                // Detaylı sayfaya yönlendirme eklenebilir
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
            
            <HealthTrendsCard 
              title="Vücut Kitle İndeksi (BMI)"
              icon={<Icons.ChartBar size={verticalScale(26)} color={colors.primary} weight="fill" />}
              latestValue={bmiData.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
            
            <Button onPress={fetchData} loading={loading} style={styles.refreshButton}>
              <Typo fontWeight="700" color={colors.black} size={16}>
                Verileri Güncelle
              </Typo>
            </Button>
          </View>
        ) : (
          // Standart görünüm
          <View style={styles.dataContainer}>
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
}); 