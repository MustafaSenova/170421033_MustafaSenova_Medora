# Samsung Health SDK Kurulum Talimatları

## 🚨 ÖNEMLİ: SDK Kurulumu

Samsung Health entegrasyonu için AAR dosyasının manuel olarak kopyalanması gerekiyor:

### 1. AAR Dosyasını Kopyalayın

Chat'teki `samsung-health-sensor-api-v1.3.0.aar` dosyasını aşağıdaki klasöre kopyalayın:

```
modules/react-native-samsung-health/android/libs/samsung-health-sensor-api-v1.3.0.aar
```

**PowerShell komutları:**
```powershell
# Libs klasörünü oluşturun (eğer yoksa)
mkdir modules\react-native-samsung-health\android\libs

# AAR dosyasını chat'ten indirip bu klasöre kopyalayın
# Dosya boyutu yaklaşık ~1MB olmalı
```

### 2. Projeyi Temizleyin ve Yeniden Build Edin

```bash
# Android build cache'ini temizleyin
cd android && ./gradlew clean && cd ..

# Expo build cache'ini temizleyin
npx expo run:android --clear
```

## 📱 Cihaz Gereksinimleri

### Samsung Galaxy Watch 7 Kurulumu

1. **Samsung Health Uygulaması**: Telefonunuzda güncel sürümü yüklü olmalı
2. **Galaxy Watch Manager**: Watch'ı telefonla eşleştirin
3. **Developer Mode**: Watch'ta geliştirici modunu aktifleştirin
4. **Bluetooth Bağlantısı**: Watch ile telefon arasında aktif bağlantı

### Developer Mode Aktifleştirme (Galaxy Watch)

1. Watch'ta **Settings** > **About Watch** > **Software** gidin
2. **Software version**'a 5-7 kez dokunun
3. "Developer mode turned on" mesajını görün
4. **Settings** > **Developer options** menüsü artık görünecek

## 🔧 Test Etme

### 1. Bağlantı Testi

```javascript
import { samsungHealthService } from './utils/samsungHealthData';

// Servise bağlan
await samsungHealthService.connect();

// Cihaz yeteneklerini kontrol et
const capabilities = await samsungHealthService.getCapabilities();
console.log('Samsung Health Capabilities:', capabilities);
```

### 2. ECG Ölçümü

```javascript
// ECG ölçümünü başlat
await samsungHealthService.startEcgMeasurement();

// ECG verilerini dinle
samsungHealthService.addListener('onEcgData', (data) => {
  console.log('ECG Data:', data);
});
```

### 3. SpO2 Ölçümü

```javascript
// SpO2 ölçümünü başlat
await samsungHealthService.startSpo2Measurement();

// SpO2 verilerini dinle
samsungHealthService.addListener('onSpo2Data', (data) => {
  console.log('SpO2 Data:', data);
});
```

## 🏥 Sağlık Verileri

### ECG (Elektrokardiyogram)
- **Veri Tipi**: `SamsungHealthEcgData`
- **İçerik**: EKG dalga formu, zaman damgası, durum
- **Süre**: Yaklaşık 30 saniye ölçüm

### SpO2 (Kan Oksijen Saturasyonu)
- **Veri Tipi**: `SamsungHealthSpo2Data`
- **İçerik**: Oksijen yüzdesi, zaman damgası, durum
- **Süre**: Yaklaşık 15 saniye ölçüm

### Heart Rate (Kalp Atışı)
- **Veri Tipi**: `SamsungHealthHeartRateData`
- **İçerik**: BPM, IBI değerleri, zaman damgası
- **Süre**: Sürekli izleme

## 🛠️ Troubleshooting

### "SDK not installed" Hatası
- AAR dosyasının doğru konumda olduğunu kontrol edin
- Projeyi temizleyip yeniden build edin

### "Service connection failed" Hatası
- Samsung Health uygulamasının yüklü olduğunu kontrol edin
- Galaxy Watch'ın telefona bağlı olduğunu kontrol edin
- Bluetooth bağlantısını kontrol edin

### "Tracker not supported" Hatası
- Galaxy Watch 7'nin ECG/SpO2 özelliklerini desteklediğini kontrol edin
- Watch'ın güncel firmware'e sahip olduğunu kontrol edin

## 📚 API Referansı

### SamsungHealthService Metodları

```typescript
// Bağlantı
connect(): Promise<void>
disconnect(): Promise<void>
getCapabilities(): Promise<SamsungHealthCapabilities>

// ECG
startEcgMeasurement(): Promise<void>
stopEcgMeasurement(): Promise<void>

// SpO2
startSpo2Measurement(): Promise<void>  
stopSpo2Measurement(): Promise<void>

// Heart Rate
startHeartRateTracking(): Promise<void>
stopHeartRateTracking(): Promise<void>

// User Profile
setUserProfile(weight: number, height: number, age: number, gender: number): Promise<void>

// Event Listeners
addListener<T>(eventType: SamsungHealthEventType, listener: (data: T) => void): EmitterSubscription
removeEventListener(subscription: EmitterSubscription): void
```

### Event Types

- `onEcgData`: ECG verileri alındığında
- `onEcgError`: ECG hatası oluştuğunda
- `onSpo2Data`: SpO2 verileri alındığında
- `onSpo2Error`: SpO2 hatası oluştuğunda
- `onHeartRateData`: Kalp atışı verileri alındığında
- `onHeartRateError`: Kalp atışı hatası oluştuğunda

## 🔐 İzinler

Aşağıdaki izinler AndroidManifest.xml'de tanımlanmıştır:

```xml
<uses-permission android:name="com.samsung.android.providers.health.permission.READ" />
<uses-permission android:name="com.samsung.android.providers.health.permission.WRITE" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.BODY_SENSORS_BACKGROUND" />
```

## ✅ Kurulum Tamamlandı

SDK dosyası doğru konuma kopyalandıktan sonra:

1. ✅ Samsung Health Module kullanıma hazır
2. ✅ ECG, SpO2, Heart Rate trackingleri aktif
3. ✅ Real-time veri akışı çalışıyor
4. ✅ Expo React Native entegrasyonu tamamlandı

**Galaxy Watch 7 ile sağlık verilerinizi artık uygulamanızda kullanabilirsiniz! 🎉** 