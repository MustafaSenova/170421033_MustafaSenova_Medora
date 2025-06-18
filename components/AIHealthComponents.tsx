import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { getAI } from '@/services/hybridAI';
import { HealthContext, AIHealthResponse, ChatMessage } from '@/types/health';

// 1. 📊 Sağlık Analizi Komponenti
export const HealthAnalysisCard = ({ healthData }: { healthData: HealthContext }) => {
  const [analysis, setAnalysis] = useState<AIHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeHealth = async () => {
    setLoading(true);
    try {
      const ai = getAI();
      const result = await ai.analyzeHealthData(healthData);
      setAnalysis(result);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      Alert.alert('Hata', 'Sağlık analizi yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00cc44';
      default: return '#666';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'high': return 'Yüksek Risk';
      case 'medium': return 'Orta Risk';
      case 'low': return 'Düşük Risk';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🤖 AI Sağlık Analizi</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={analyzeHealth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'AI Analiz Ediyor...' : 'Analiz Et'}
        </Text>
      </TouchableOpacity>

      {analysis && (
        <ScrollView style={styles.results}>
          <View style={styles.riskSection}>
            <Text style={styles.sectionTitle}>⚠️ Risk Seviyesi:</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(analysis.riskLevel) }]}>
              <Text style={styles.riskText}>{getRiskText(analysis.riskLevel)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Öneriler:</Text>
            {analysis.recommendations?.map((rec, index) => (
              <Text key={index} style={styles.recommendation}>
                • {rec}
              </Text>
            ))}
          </View>
          
          {analysis.insights && analysis.insights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Önemli Notlar:</Text>
              {analysis.insights.map((insight, index) => (
                <Text key={index} style={styles.insight}>
                  • {insight}
                </Text>
              ))}
            </View>
          )}

          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Yapılacaklar:</Text>
              {analysis.actionItems.map((item, index) => (
                <Text key={index} style={styles.actionItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// 2. 💬 Sağlık Sohbet Asistanı
export const HealthChatAssistant = ({ userContext }: { userContext?: HealthContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hoş geldin mesajı
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: '👋 Merhaba! Ben Medora sağlık asistanınızım. Sağlık konularında size yardımcı olmak için buradayım. Nasıl yardımcı olabilirim?',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const ai = getAI();
      const response = await ai.chatWithHealthAssistant(
        inputText,
        messages,
        userContext
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => (
    <View key={index} style={[
      styles.messageContainer,
      message.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.chatContainer}>
      <Text style={styles.title}>💬 Sağlık Asistanı</Text>
      
      <ScrollView style={styles.messagesContainer}>
        {messages.map(renderMessage)}
        {loading && (
          <View style={styles.loadingMessage}>
            <Text style={styles.loadingText}>🤖 Düşünüyor...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Sağlık konusunda soru sorun..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 3. 🎯 Hızlı Sağlık İpuçları
export const QuickHealthTips = () => {
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    const ai = getAI();
    const quickTips = ai.getQuickHealthTips();
    setTips(quickTips);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💡 Günlük Sağlık İpuçları</Text>
      {tips.map((tip, index) => (
        <View key={index} style={styles.tipContainer}>
          <Text style={styles.tip}>{tip}</Text>
        </View>
      ))}
    </View>
  );
};

// 4. 🚨 Acil Durum Rehberi
export const EmergencyGuide = () => {
  const [emergencyTips, setEmergencyTips] = useState<string[]>([]);

  useEffect(() => {
    const ai = getAI();
    const tips = ai.getEmergencyGuidance();
    setEmergencyTips(tips);
  }, []);

  const callEmergency = () => {
    Alert.alert(
      'Acil Durum',
      'Gerçek bir acil durum mu?\n\n112 - Acil Servis\n911 - Polis\n110 - İtfaiye',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ara', onPress: () => console.log('Emergency call') }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🚨 Acil Durum Rehberi</Text>
      
      <TouchableOpacity style={styles.emergencyButton} onPress={callEmergency}>
        <Text style={styles.emergencyButtonText}>🚨 ACİL DURUM</Text>
      </TouchableOpacity>

      {emergencyTips.map((tip, index) => (
        <View key={index} style={styles.emergencyTip}>
          <Text style={styles.emergencyTipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    maxHeight: 400,
  },
  riskSection: {
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  recommendation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  insight: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  actionItem: {
    fontSize: 14,
    color: '#00AA44',
    marginBottom: 4,
    lineHeight: 20,
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    margin: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    maxHeight: 400,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  loadingMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
  },
  tipContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emergencyTip: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  emergencyTipText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
  },
});
