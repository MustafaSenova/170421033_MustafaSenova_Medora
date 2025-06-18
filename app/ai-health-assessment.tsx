import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain } from 'phosphor-react-native';
import { useAuth } from '../contexts/authContext';
import { enhancedHealthData } from '../utils/enhancedHealthData';

import ScreenWrapper from '../components/ScreenWrapper';
import { colors } from '../constants/theme';

export default function AIHealthAssessmentScreen() {
  const { user } = useAuth();
  const [isAssessing, setIsAssessing] = useState(false);
  const [lastAssessment, setLastAssessment] = useState<any>(null);

  /**
   * Yeni AI sağlık değerlendirmesi yap
   */
  const performNewAssessment = async () => {
    if (!user?.uid) return;

    try {
      setIsAssessing(true);
      
      console.log('🤖 AI sağlık değerlendirmesi başlatılıyor...');
      
      // AI sağlık değerlendirmesi yap
      const assessment = await enhancedHealthData.performAIHealthAssessment(user.uid);
      
      setLastAssessment(assessment);
      
      Alert.alert(
        'Değerlendirme Tamamlandı',
        `Genel risk skorunuz: ${Math.round(assessment.overallRiskScore * 100)}%\n\n` +
        `Kardiyovasküler Risk: ${assessment.cardiovascularRisk?.riskLevel || 'Bilinmiyor'}\n` +
        `EKG Analizi: ${assessment.ecgAnalysis?.classification || 'Bilinmiyor'}`,
        [{ text: 'Tamam' }]
      );
      
    } catch (error) {
      console.error('❌ AI sağlık değerlendirmesi hatası:', error);
      Alert.alert('Hata', 'Sağlık değerlendirmesi yapılırken bir hata oluştu.');
    } finally {
      setIsAssessing(false);
    }
  };

  const getRiskColor = (score: number): string => {
    if (score < 0.3) return colors.green;
    if (score < 0.6) return '#FFA500'; // orange
    return colors.rose;
  };

  const getRiskLevel = (score: number): string => {
    if (score < 0.3) return 'Düşük Risk';
    if (score < 0.6) return 'Orta Risk';
    return 'Yüksek Risk';
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Header */}
          <View style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Brain size={32} color={colors.primary} />
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: colors.text, 
                marginLeft: 12 
              }}>
                AI Sağlık Değerlendirmesi
              </Text>
            </View>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textLighter 
            }}>
              Yapay zeka destekli kapsamlı sağlık analizi ve risk değerlendirmesi
            </Text>
          </View>

          {/* Değerlendirme Butonu */}
          <TouchableOpacity
            onPress={performNewAssessment}
            disabled={isAssessing}
            style={{
              backgroundColor: isAssessing ? colors.neutral300 : colors.primary,
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginBottom: 20,
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: colors.white 
            }}>
              {isAssessing ? '🔄 Değerlendirme Yapılıyor...' : '🩺 Yeni Sağlık Değerlendirmesi Yap'}
            </Text>
          </TouchableOpacity>

          {/* Son Değerlendirme Sonuçları */}
          {lastAssessment && (
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: colors.text, 
                marginBottom: 15 
              }}>
                📊 Son Değerlendirme Sonuçları
              </Text>

              {/* Genel Risk Skoru */}
              <View style={{
                backgroundColor: getRiskColor(lastAssessment.overallRiskScore) + '20',
                borderRadius: 12,
                padding: 15,
                marginBottom: 15
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textLighter 
                }}>
                  Genel Risk Skoru
                </Text>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: 'bold', 
                  color: getRiskColor(lastAssessment.overallRiskScore) 
                }}>
                  {Math.round(lastAssessment.overallRiskScore * 100)}%
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: getRiskColor(lastAssessment.overallRiskScore) 
                }}>
                  {getRiskLevel(lastAssessment.overallRiskScore)}
                </Text>
              </View>

              {/* Kardiyovasküler Risk */}
              {lastAssessment.cardiovascularRisk && (
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    ❤️ Kardiyovasküler Risk
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.neutral100, 
                    padding: 12, 
                    borderRadius: 8 
                  }}>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      Risk Seviyesi: 
                      <Text style={{ fontWeight: 'bold' }}>
                        {lastAssessment.cardiovascularRisk.riskLevel.toUpperCase()}
                      </Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      Güven Skoru: 
                      <Text style={{ fontWeight: 'bold' }}>
                        {Math.round(lastAssessment.cardiovascularRisk.confidence * 100)}%
                      </Text>
                    </Text>
                  </View>
                </View>
              )}

              {/* EKG Analizi */}
              {lastAssessment.ecgAnalysis && (
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    📈 EKG Analizi
                  </Text>
                  <View style={{ 
                    backgroundColor: colors.neutral100, 
                    padding: 12, 
                    borderRadius: 8 
                  }}>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      Sınıflandırma: 
                      <Text style={{ fontWeight: 'bold' }}>
                        {lastAssessment.ecgAnalysis.classification}
                      </Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      Anomali Skoru: 
                      <Text style={{ fontWeight: 'bold' }}>
                        {Math.round(lastAssessment.ecgAnalysis.anomalyScore * 100)}%
                      </Text>
                    </Text>
                  </View>
                </View>
              )}

              {/* Öncelikli Uyarılar */}
              {lastAssessment.priorityAlerts && lastAssessment.priorityAlerts.length > 0 && (
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    ⚠️ Öncelikli Uyarılar
                  </Text>
                  {lastAssessment.priorityAlerts.slice(0, 3).map((alert: string, index: number) => (
                    <View key={index} style={{
                      backgroundColor: colors.rose + '10',
                      borderLeftWidth: 3,
                      borderLeftColor: colors.rose,
                      padding: 10,
                      marginBottom: 5,
                      borderRadius: 6
                    }}>
                      <Text style={{ fontSize: 14, color: colors.rose }}>
                        {alert}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Önerilen Eylemler */}
              {lastAssessment.actionItems && lastAssessment.actionItems.length > 0 && (
                <View>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: 8 
                  }}>
                    ✅ Önerilen Eylemler
                  </Text>
                  {lastAssessment.actionItems.slice(0, 5).map((action: string, index: number) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 6
                    }}>
                      <Text style={{ 
                        fontSize: 14, 
                        color: colors.primary, 
                        marginRight: 8 
                      }}>
                        •
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: colors.text, 
                        flex: 1 
                      }}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={{ 
                fontSize: 12, 
                color: colors.textLighter, 
                marginTop: 15 
              }}>
                Değerlendirme Tarihi: {new Date(lastAssessment.timestamp).toLocaleString('tr-TR')}
              </Text>
            </View>
          )}

          {/* Bilgi Kartları */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: colors.text, 
              marginBottom: 15 
            }}>
              🧠 AI Modelleri
            </Text>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: colors.text 
              }}>
                1. Kardiyovasküler Risk Modeli
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: colors.textLighter 
              }}>
                Yaş, cinsiyet, BMI, kan basıncı ve yaşam tarzı faktörlerini analiz eder
              </Text>
            </View>
            
            <View>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: colors.text 
              }}>
                2. EKG Analiz Modeli
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: colors.textLighter 
              }}>
                MIT-BIH veritabanı ile eğitilmiş, kalp ritmi anomalilerini tespit eder
              </Text>
            </View>
          </View>

          {/* Boş durum */}
          {!lastAssessment && (
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 16,
              padding: 40,
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Brain size={48} color={colors.textLighter} />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: colors.text, 
                marginTop: 16, 
                marginBottom: 8 
              }}>
                Henüz Değerlendirme Yok
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: colors.textLighter, 
                textAlign: 'center' 
              }}>
                İlk AI sağlık değerlendirmenizi yapmak için yukarıdaki butona tıklayın.
                Sistem kapsamlı sağlık verilerinizi analiz edecek ve risk değerlendirmesi yapacak.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
} 