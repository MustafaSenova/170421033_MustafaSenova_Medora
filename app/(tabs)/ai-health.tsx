import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/authContext';
import { getAI } from '../../services/hybridAI';
import { HealthContext, ChatMessage } from '../../types/health';
import { colors } from '../../constants/theme';
import { scale, verticalScale } from '../../utils/styling';
import * as Icons from 'phosphor-react-native';
import { router } from 'expo-router';

// Helper functions
const wp = (percentage: number) => scale(percentage * 3.75);
const hp = (percentage: number) => verticalScale(percentage * 8.12);

// Theme object
const theme = {
  colors: {
    primary: colors.primary,
    primaryLight: colors.primaryLight + '20',
    background: colors.neutral900,
    surface: colors.neutral800,
    text: colors.text,
    textSecondary: colors.neutral400,
    border: colors.neutral700,
    white: colors.white,
    success: colors.green
  }
};

interface DisplayChatMessage extends ChatMessage {
  isLoading?: boolean;
}

export default function AIHealthScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisplayChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Hoş geldin mesajı
  useEffect(() => {
    const welcomeMessage: DisplayChatMessage = {
      id: '1',
      role: 'assistant',
      content: `Merhaba ${user?.firstName || 'Kullanıcı'}! 👋\n\nBen sağlık asistanınızım. Size şu konularda yardımcı olabilirim:\n\n• Sağlık verilerinizi analiz etmek\n• Sağlık tavsiyesi vermek\n• Semptomlarınızı değerlendirmek\n• İlaç ve tedavi hakkında bilgi vermek\n\nNasıl yardımcı olabilirim?`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [user]);

  // Mesaj gönderme
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: DisplayChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    const loadingMessage: DisplayChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Düşünüyorum...',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Basit sağlık context'i oluştur
      const healthContext: HealthContext = {
        demographics: {
          age: 30,
          gender: 'male'
        }
      };

      const ai = getAI();
      const response = await ai.chatWithHealthAssistant(
        inputText.trim(), 
        healthContext, 
        messages.filter(m => !m.isLoading).slice(-5) // Son 5 mesajı context olarak gönder
      );

      // Loading mesajını gerçek yanıtla değiştir
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading ? {
            ...msg,
            content: response,
            isLoading: false
          } : msg
        )
      );
      
    } catch (error) {
      console.error('AI yanıt hatası:', error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading ? {
            ...msg,
            content: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
            isLoading: false
          } : msg
        )
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Hızlı sorular
  const quickQuestions = [
    "Kalp sağlığı için ne önerirsin?",
    "Beslenme tavsiyesi ver",  
    "Egzersiz programı öner",
    "Stres yönetimi hakkında bilgi ver"
  ];

  const askQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icons.Robot size={24} color={theme.colors.primary} weight="fill" />
          <Text style={styles.headerTitle}>AI Sağlık Asistanı</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.assessmentButton}
            onPress={() => router.push('/ai-health-assessment')}
          >
            <Icons.Brain size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.assessmentButtonText}>Değerlendirme</Text>
          </TouchableOpacity>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.statusText}>Aktif</Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.assistantIcon}>
                <Icons.Robot size={20} color={theme.colors.primary} weight="fill" />
              </View>
            )}
            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText
              ]}>
                {message.content}
              </Text>
              {message.isLoading && (
                <View style={styles.loadingDots}>
                  <Text style={styles.loadingText}>●●●</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={styles.quickQuestionsTitle}>Hızlı Sorular:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestionButton}
                onPress={() => askQuickQuestion(question)}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Sağlık hakkında bir soru sorun..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Icons.PaperPlaneTilt 
              size={20} 
              color={(!inputText.trim() || isLoading) ? theme.colors.textSecondary : theme.colors.white} 
              weight="fill" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assessmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: wp(4),
    gap: hp(1),
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: hp(0.5),
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    marginLeft: wp(15),
  },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: theme.colors.white,
  },
  assistantText: {
    color: theme.colors.text,
  },
  loadingDots: {
    marginTop: 4,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  quickQuestionsContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: hp(1),
  },
  quickQuestionButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: 12,
    marginRight: wp(2),
  },
  quickQuestionText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  inputRow: {
    flexDirection: 'row',
    padding: wp(4),
    gap: wp(2),
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    maxHeight: hp(12),
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
});
