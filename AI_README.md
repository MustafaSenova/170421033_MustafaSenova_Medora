# 🤖 Medora AI Sağlık Asistanı

Medora uygulamasına entegre edilmiş yapay zeka destekli sağlık analizi ve danışmanlık sistemi.

## ✨ Özellikler

### 🩺 Sağlık Analizi
- Vital değerler analizi (kalp atışı, kan basıncı, vücut sıcaklığı)
- Semptom değerlendirmesi
- Risk seviyesi belirleme
- Kişiselleştirilmiş öneriler
- Aksiyon planları

### 💬 AI Sohbet Asistanı
- Doğal dil işleme ile sağlık danışmanlığı
- Kontekst-aware sohbet geçmişi
- Kişiselleştirilmiş yanıtlar
- Acil durum yönlendirmesi

### 🔄 Hybrid AI Sistemi
- **Real AI**: OpenAI GPT entegrasyonu
- **Mock AI**: Offline çalışma desteği
- Otomatik fallback mekanizması
- Her durumda çalışır garanti

## 🚀 Hızlı Başlangıç

### 1. Dosyalar Eklendi
```
medora_expo-main/
├── services/
│   ├── healthAI.ts      # OpenAI entegrasyonu
│   ├── mockAI.ts        # Offline AI servisi
│   └── hybridAI.ts      # Hybrid sistem
├── types/
│   └── health.ts        # Type tanımları
├── components/
│   └── AIHealthComponents.tsx # React Native bileşenleri
├── utils/
│   └── mockData.ts      # Test verileri
└── app/
    ├── ai-test.tsx      # Test sayfası
    └── (tabs)/
        └── ai-health.tsx # AI tab sayfası
```

### 2. Paketler Yüklendi
- ✅ `openai` - OpenAI API entegrasyonu
- ✅ `dotenv` - Environment variables
- ✅ TypeScript konfigürasyonu güncellendi

### 3. Kullanıma Hazır!

## 🎯 Kullanım

### Test Sayfası
```
/ai-test
```
- AI sistem durumunu gösterir
- Sağlık analizi testi
- Chat testi
- Mock AI ile çalışır

### AI Tab
Navigation bar'da "AI Asistan" tab'ı eklendi.

## 🔧 Konfigürasyon

### OpenAI API Key (Opsiyonel)
`.env` dosyasında:
```
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

**API Key yoksa**: Mock AI otomatik aktif olur, tüm özellikler çalışır.

## 🧩 Bileşenler

### 1. HealthAnalysisCard
```tsx
import { HealthAnalysisCard } from '@/components/AIHealthComponents';

<HealthAnalysisCard healthData={healthData} />
```

### 2. HealthChatAssistant
```tsx
import { HealthChatAssistant } from '@/components/AIHealthComponents';

<HealthChatAssistant userContext={userContext} />
```

### 3. QuickHealthTips
```tsx
import { QuickHealthTips } from '@/components/AIHealthComponents';

<QuickHealthTips />
```

### 4. EmergencyGuide
```tsx
import { EmergencyGuide } from '@/components/AIHealthComponents';

<EmergencyGuide />
```

## 💻 Kod Örnekleri

### Sağlık Verisi Analizi
```typescript
import { getAI } from '@/services/hybridAI';

const healthData: HealthContext = {
  vitals: {
    heartRate: 85,
    bloodPressure: { systolic: 130, diastolic: 85 }
  },
  symptoms: [
    { name: 'Yorgunluk', severity: 6 }
  ]
};

const ai = getAI();
const analysis = await ai.analyzeHealthData(healthData);
console.log(analysis.recommendations);
```

### Chat Asistanı
```typescript
const ai = getAI();
const response = await ai.chatWithHealthAssistant(
  'Kalp sağlığı için ne önerirsin?'
);
console.log(response);
```

## 🎭 Mock AI Özellikleri

Mock AI sistemi gerçek AI olmadan test etmenizi sağlar:

- ✅ Keyword-based chat yanıtları
- ✅ Sağlık verisi analizi simülasyonu
- ✅ Risk seviyesi hesaplama
- ✅ Öneriler ve aksiyonlar
- ✅ Hızlı ipuçları
- ✅ Acil durum rehberi

## 🔒 Güvenlik

- ❌ Tıbbi teşhis yapmaz
- ❌ İlaç reçetesi vermez
- ✅ Genel sağlık tavsiyeleri
- ✅ Acil durumda doktor yönlendirmesi
- ✅ Güvenli veri işleme

## 🚨 Önemli Notlar

1. **Tıbbi Amaç**: Bu sistem tıbbi teşhis için değildir
2. **Acil Durum**: Ciddi belirtilerde 112 arayın
3. **Doktor Kontrolü**: Düzenli doktor kontrollerinizi aksatmayın
4. **Veri Güvenliği**: Hassas bilgileri paylaşmayın

## 🧪 Test Senaryoları

Uygulamada hazır test verileri mevcut:
- Normal sağlık profili (düşük risk)
- Orta risk profili (hipertansiyon)
- Aktif profil (çok düşük risk)

## 📱 Entegrasyon

AI servisleri şu sayfalarla entegre edilebilir:
- Sağlık verisi sayfaları
- Profil sayfaları
- Randevu sayfaları
- Doktor panelleri

## 🔄 Gelecek Güncellemeler

- [ ] Daha gelişmiş semptom analizi
- [ ] Samsung Health entegrasyonu
- [ ] Sesli asistan desteği
- [ ] Çoklu dil desteği
- [ ] Doktor dashboard entegrasyonu

---

## 🎉 Hazır!

AI sistem tamamen entegre edildi ve kulıma hazır! Test sayfasından başlayabilirsiniz.

**Test için**: `/ai-test` sayfasını açın
**Geliştirme için**: Yukarıdaki bileşenleri kullanın
