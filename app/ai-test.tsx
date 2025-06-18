import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { getAI } from '../services/hybridAI';
import { HealthContext } from '../types/health';

export default function AITestScreen() {
  const [status, setStatus] = useState('Başlatılıyor...');
  const [analysis, setAnalysis] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    const ai = getAI();
    setStatus(`AI Durumu: ${ai.getServiceStatus()}`);
  }, []);

  const testHealthAnalysis = async () => {
    try {
      setAnalysis('Analiz ediliyor...');
      
      const testData: HealthContext = {
        vitals: {
          heartRate: 85,
          bloodPressure: { systolic: 130, diastolic: 85 },
          temperature: 36.8
        },
        symptoms: [
          { name: 'Yorgunluk', severity: 6 },
          { name: 'Baş ağrısı', severity: 4 }
        ]
      };

      const ai = getAI();
      const result = await ai.analyzeHealthData(testData);
      
      setAnalysis(`
📊 Analiz Sonucu:
Risk Seviyesi: ${result.riskLevel}
Güven: ${result.confidence}

Öneriler:
${result.recommendations.map(r => `• ${r}`).join('\n')}

Önemli Notlar:
${result.insights.map(i => `• ${i}`).join('\n')}
      `);
    } catch (error) {
      setAnalysis(`Hata: ${error}`);
    }
  };

  const testChat = async () => {
    try {
      setChatResponse('AI yanıtlıyor...');
      
      const ai = getAI();
      const response = await ai.chatWithHealthAssistant('Kalp sağlığı için ne önerirsin?');
      
      setChatResponse(response);
    } catch (error) {
      setChatResponse(`Chat Hatası: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 AI Test Ekranı</Text>
      
      <View style={styles.section}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={testHealthAnalysis}>
        <Text style={styles.buttonText}>🩺 Sağlık Analizi Testi</Text>
      </TouchableOpacity>

      {analysis ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{analysis}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={testChat}>
        <Text style={styles.buttonText}>💬 Chat Testi</Text>
      </TouchableOpacity>

      {chatResponse ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{chatResponse}</Text>
        </View>
      ) : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Bilgi</Text>
        <Text style={styles.infoText}>
          • Mock AI aktif (OpenAI key yok)
          • Gerçek AI için .env dosyasına API key ekleyin
          • Test verileri ile çalışır
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#e6f3ff',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
  },
});
