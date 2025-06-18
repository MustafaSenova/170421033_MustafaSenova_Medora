import { StyleSheet, View, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import SamsungHealthPanel from '@/components/SamsungHealthPanel';
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
// Samsung Health entegrasyonu
import { 
  samsungHealthService,
  SamsungHealthEcgData,
  SamsungHealthSpo2Data,
  SamsungHealthHeartRateData
} from '@/utils/samsungHealthData';
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
  
  // Samsung Health states
  const [samsungConnected, setSamsungConnected] = useState(false);
  const [samsungLoading, setSamsungLoading] = useState(false);
  const [ecgData, setEcgData] = useState<SamsungHealthEcgData[]>([]);
  const [spo2Data, setSpo2Data] = useState<SamsungHealthSpo2Data[]>([]);
  const [heartRateData, setHeartRateData] = useState<SamsungHealthHeartRateData[]>([]);
  const [supportedSensors, setSupportedSensors] = useState<string[]>([]);
  const [isMeasuring, setIsMeasuring] = useState({ ecg: false, spo2: false, heartRate: false });

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

  // Samsung Health bağlantısı
  const handleConnectSamsungHealth = async () => {
    setSamsungLoading(true);
    try {
      // Samsung Health SDK'sına bağlan
      await samsungHealthService.connect();
      setSamsungConnected(true);
      
      // Desteklenen sensörleri al
      const capabilities = await samsungHealthService.getCapabilities();
      const sensors = [];
      if (capabilities.ecgSupported) sensors.push('ECG');
      if (capabilities.spo2Supported) sensors.push('SpO2');
      if (capabilities.heartRateSupported) sensors.push('Heart Rate');
      setSupportedSensors(sensors);
      
      Alert.alert('Başarılı', 'Samsung Health\'e başarıyla bağlandı!');
      console.log('Desteklenen sensörler:', sensors);
    } catch (error) {
      console.error('Samsung Health bağlantı hatası:', error);
      Alert.alert('Hata', 'Samsung Health bağlantısında hata oluştu.');
    } finally {
      setSamsungLoading(false);
    }
  };

  // EKG ölçümü başlat/durdur
  const handleECGMeasurement = async () => {
    if (isMeasuring.ecg) {
      try {
        await samsungHealthService.stopEcgMeasurement();
        setIsMeasuring(prev => ({ ...prev, ecg: false }));
        Alert.alert('EKG Ölçümü', 'EKG ölçümü durduruldu.');
      } catch (error) {
        Alert.alert('Hata', 'EKG ölçümü durdurulamadı.');
      }
    } else {
      try {
        await samsungHealthService.startEcgMeasurement();
        setIsMeasuring(prev => ({ ...prev, ecg: true }));
        Alert.alert('EKG Ölçümü', 'EKG ölçümü başlatıldı. Saatten bekleyin...');
      } catch (error) {
        Alert.alert('Hata', 'EKG ölçümü başlatılamadı.');
      }
    }
  };

  // SpO2 ölçümü başlat/durdur
  const handleSpO2Measurement = async () => {
    if (isMeasuring.spo2) {
      try {
        await samsungHealthService.stopSpo2Measurement();
        setIsMeasuring(prev => ({ ...prev, spo2: false }));
        Alert.alert('SpO2 Ölçümü', 'SpO2 ölçümü durduruldu.');
      } catch (error) {
        Alert.alert('Hata', 'SpO2 ölçümü durdurulamadı.');
      }
    } else {
      try {
        await samsungHealthService.startSpo2Measurement();
        setIsMeasuring(prev => ({ ...prev, spo2: true }));
        Alert.alert('SpO2 Ölçümü', 'SpO2 ölçümü başlatıldı. Saatten bekleyin...');
      } catch (error) {
        Alert.alert('Hata', 'SpO2 ölçümü başlatılamadı.');
      }
    }
  };

  // Nabız ölçümü başlat/durdur
  const handleHeartRateMeasurement = async () => {
    if (isMeasuring.heartRate) {
      try {
        await samsungHealthService.stopHeartRateTracking();
        setIsMeasuring(prev => ({ ...prev, heartRate: false }));
        Alert.alert('Nabız Ölçümü', 'Nabız ölçümü durduruldu.');
      } catch (error) {
        Alert.alert('Hata', 'Nabız ölçümü durdurulamadı.');
      }
    } else {
      try {
        await samsungHealthService.startHeartRateTracking();
        setIsMeasuring(prev => ({ ...prev, heartRate: true }));
        Alert.alert('Nabız Ölçümü', 'Nabız ölçümü başlatıldı. Saatten bekleyin...');
      } catch (error) {
        Alert.alert('Hata', 'Nabız ölçümü başlatılamadı.');
      }
    }
  };

  // İlk yükleme
  useEffect(() => {
    // Uygulama başlangıcında Google Fit bağlantı durumunu kontrol et
    const checkGoogleFitConnection = async () => {
      try {
        const isAuthorized = GoogleFit.isAuthorized;
        if (isAuthorized) {
            setIsConnected(true);
            fetchData();
        }
      } catch (error) {
        console.log('Google Fit authorization check failed:', error);
      }
    };
    
    if (!USE_MOCK_DATA) {
    checkGoogleFitConnection();
    }
  }, []);

    // Samsung Health event listener'ları
  useEffect(() => {
    if (!samsungConnected) return;

    // EKG veri listener'ı
    const ecgListener = samsungHealthService.addEventListener('onEcgData', (data: SamsungHealthEcgData) => {
      console.log('EKG verisi alındı:', data);
      setEcgData(prev => [...prev, data]);
      setIsMeasuring(prev => ({ ...prev, ecg: false }));
    });

    // SpO2 veri listener'ı
    const spo2Listener = samsungHealthService.addEventListener('onSpo2Data', (data: SamsungHealthSpo2Data) => {
      console.log('SpO2 verisi alındı:', data);
      setSpo2Data(prev => [...prev, data]);
      setIsMeasuring(prev => ({ ...prev, spo2: false }));
    });

    // Nabız veri listener'ı
    const heartRateListener = samsungHealthService.addEventListener('onHeartRateData', (data: SamsungHealthHeartRateData) => {
      console.log('Nabız verisi alındı:', data);
      setHeartRateData(prev => [...prev, data]);
    });

    // Error listener'ları
    const ecgErrorListener = samsungHealthService.addEventListener('onEcgError', (error: any) => {
      console.error('EKG hatası:', error);
      setIsMeasuring(prev => ({ ...prev, ecg: false }));
      Alert.alert('EKG Hatası', 'EKG ölçümünde hata oluştu.');
    });

    const spo2ErrorListener = samsungHealthService.addEventListener('onSpo2Error', (error: any) => {
      console.error('SpO2 hatası:', error);
      setIsMeasuring(prev => ({ ...prev, spo2: false }));
      Alert.alert('SpO2 Hatası', 'SpO2 ölçümünde hata oluştu.');
    });

    const heartRateErrorListener = samsungHealthService.addEventListener('onHeartRateError', (error: any) => {
      console.error('Nabız hatası:', error);
      setIsMeasuring(prev => ({ ...prev, heartRate: false }));
      Alert.alert('Nabız Hatası', 'Nabız ölçümünde hata oluştu.');
    });

    // Cleanup function
    return () => {
      samsungHealthService.removeEventListener(ecgListener);
      samsungHealthService.removeEventListener(spo2Listener);
      samsungHealthService.removeEventListener(heartRateListener);
      samsungHealthService.removeEventListener(ecgErrorListener);
      samsungHealthService.removeEventListener(spo2ErrorListener);
      samsungHealthService.removeEventListener(heartRateErrorListener);
    };
  }, [samsungConnected]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const toggleDetailedAnalysis = () => {
    setShowDetailedAnalysis(!showDetailedAnalysis);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Kalp hızı verilerini işleme
  const getLatestHeartRate = () => {
    if (!healthData?.heartRate || healthData.heartRate.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latest = healthData.heartRate[healthData.heartRate.length - 1];
    const analysis = analyzeHeartRate(latest.value);
    
    return { 
      value: `${latest.value} bpm`,
      analysis: {
        status: analysis.status,
        message: analysis.message
      }
    };
  };

  // Kan basıncı verilerini işleme
  const getLatestBloodPressure = () => {
    if (!healthData?.bloodPressure || healthData.bloodPressure.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latest = healthData.bloodPressure[healthData.bloodPressure.length - 1];
    const analysis = analyzeBloodPressure(latest.systolic, latest.diastolic);
    
    return { 
      value: `${latest.systolic}/${latest.diastolic} mmHg`,
      analysis: {
        status: analysis.status,
        message: analysis.message
      }
    };
  };

  // Kilo verilerini işleme
  const getLatestWeight = () => {
    if (!healthData?.bodyMetrics?.weight || healthData.bodyMetrics.weight.length === 0) {
      return { value: 'Veri yok' };
    }
    
    const latest = healthData.bodyMetrics.weight[healthData.bodyMetrics.weight.length - 1];
    return { value: `${latest.value} kg` };
  };

  // Boy verilerini işleme
  const getLatestHeight = () => {
    if (!healthData?.bodyMetrics?.height || healthData.bodyMetrics.height.length === 0) {
      return { value: 'Veri yok' };
    }
    
    const latest = healthData.bodyMetrics.height[healthData.bodyMetrics.height.length - 1];
    return { value: `${latest.value * 100} cm` };
  };

  // BMI hesaplama ve analiz
  const getBMIAnalysis = () => {
    const weight = getLatestWeight();
    const height = getLatestHeight();

    if (weight.value === 'Veri yok' || height.value === 'Veri yok') {
      return { value: 'Veri yok', analysis: null };
    }

    const weightValue = parseFloat(weight.value.replace(' kg', ''));
    const heightValue = parseFloat(height.value.replace(' cm', ''));
    
    const bmi = calculateBMI(weightValue, heightValue);
    const analysis = analyzeBMI(bmi);
    
    return {
      value: bmi.toFixed(1),
      analysis: {
        status: analysis.status,
        message: analysis.message
      }
    };
  };

  // Adım verilerini al ve analiz et
  const getLatestSteps = () => {
    if (!healthData?.activityData?.steps || healthData.activityData.steps.length === 0) {
      return { value: 'Veri yok', analysis: null };
    }
    
    const latest = healthData.activityData.steps[healthData.activityData.steps.length - 1];
    const analysis = analyzeSteps(latest.value);
    
    return { 
      value: `${latest.value} adım`,
      analysis: {
        status: analysis.status,
        message: analysis.message
      }
    };
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
        <Typo size={16} fontWeight="600">{value}</Typo>
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
      case 'optimal':
      case 'normal':
      case 'excellent':
        return colors.green;
      case 'warning':
      case 'caution':
        return colors.rose;
      case 'danger':
      case 'critical':
        return colors.rose;
      default:
        return colors.textLighter;
    }
  };

  // Kalp atış hızı verileri
  const googleFitHeartRateData = getLatestHeartRate();
  // Kan basıncı verileri
  const bloodPressureData = getLatestBloodPressure();
  // BMI verileri
  const bmiData = getBMIAnalysis();
  // Steps data
  const stepsData = getLatestSteps();

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
          
          {(isConnected || samsungConnected) && (
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
        
        {/* Google Fit Bağlantı Kartı */}
        <View style={[styles.connectionCard, isConnected && styles.connectedCard]}>
          <View style={styles.connectionHeader}>
            <Icons.GoogleLogo size={verticalScale(24)} color={isConnected ? colors.green : colors.textLighter} />
            <View style={styles.connectionInfo}>
              <Typo size={16} fontWeight="600">Google Fit</Typo>
              <View style={styles.connectionStatus}>
                <View style={[styles.statusDot, isConnected && styles.connectedDot]} />
                <Typo size={14} color={isConnected ? colors.green : colors.textLighter}>
                  {isConnected ? 'Bağlı' : 'Bağlı Değil'}
            </Typo>
              </View>
            </View>
            {!isConnected && (
            <Button onPress={handleConnectGoogleFit} loading={loading} style={styles.connectButton}>
                <Typo fontWeight="600" color={colors.white} size={14}>
                  Bağlan
              </Typo>
            </Button>
            )}
            </View>
          </View>

        {/* Samsung Health Panel */}
        <SamsungHealthPanel
          isConnected={samsungConnected}
          isConnecting={samsungLoading}
          supportedSensors={supportedSensors}
          ecgData={ecgData}
          spo2Data={spo2Data}
          heartRateData={heartRateData}
          isMeasuring={isMeasuring}
          onConnect={handleConnectSamsungHealth}
          onStartECG={handleECGMeasurement}
          onStopECG={handleECGMeasurement}
          onStartSpO2={handleSpO2Measurement}
          onStopSpO2={handleSpO2Measurement}
          onStartHeartRate={handleHeartRateMeasurement}
          onStopHeartRate={handleHeartRateMeasurement}
        />

        {!isConnected && !samsungConnected && (
          <View style={styles.noConnectionInfo}>
            <Icons.Info size={verticalScale(20)} color={colors.textLighter} />
            <Typo size={14} color={colors.textLighter} style={{ marginLeft: spacingX._10, flex: 1 }}>
              Sağlık verilerinizi görmek için yukarıdaki servislerden birine bağlanın.
            </Typo>
          </View>
        )}

        {/* Sağlık Verileri */}
        {(isConnected || samsungConnected) && (
          <View style={styles.dataContainer}>
            <HealthCard 
              title="Kalp Atış Hızı" 
              value={googleFitHeartRateData.value} 
              icon={<Icons.Heart size={verticalScale(26)} color={colors.rose} weight="fill" />} 
              analysis={googleFitHeartRateData.analysis}
            />
            
            <HealthCard 
              title="Kan Basıncı" 
              value={bloodPressureData.value} 
              icon={<Icons.Drop size={verticalScale(26)} color={colors.rose} weight="fill" />} 
              analysis={bloodPressureData.analysis}
            />
            
            <HealthCard 
              title="Günlük Adım" 
              value={stepsData.value} 
              icon={<Icons.Footprints size={verticalScale(26)} color={colors.green} weight="fill" />} 
              analysis={stepsData.analysis}
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
  connectionCard: {
    backgroundColor: colors.neutral800,
    borderRadius: 12,
    padding: spacingY._15,
    marginBottom: spacingY._15,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  connectedCard: {
    borderColor: colors.green,
    backgroundColor: colors.green + '10',
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionInfo: {
    flex: 1,
    marginLeft: spacingX._15,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacingY._5,
  },
  statusDot: {
    width: verticalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
    backgroundColor: colors.textLighter,
    marginRight: spacingX._5,
  },
  connectedDot: {
    backgroundColor: colors.green,
  },
  connectButton: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
    minHeight: verticalScale(36),
    backgroundColor: colors.primary,
  },
  noConnectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral800,
    padding: spacingY._15,
    borderRadius: 12,
    marginBottom: spacingY._20,
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