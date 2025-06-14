# Samsung Health SDK Kurulum Rehberi

Samsung Galaxy Watch 7'den EKG, SpO2, kan basıncı gibi veriler alabilmek için aşağıdaki adımları takip edin.

## 📋 Gereksinimler

### Donanım
- Samsung Galaxy Watch 7 (veya Galaxy Watch4, Watch5, Watch6)
- Galaxy Watch ile uyumlu Samsung telefon
- Telefon ve saatin eşleştirilmiş olması

### Yazılım
- Android Studio
- React Native development environment
- Samsung Health uygulaması (telefonda ve saatte)

## 🔧 1. Samsung Health SDK İndirme

1. Samsung Developer Portal'a gidin: https://developer.samsung.com/health/sensor
2. "SDK Download" bölümünden Samsung Health Sensor SDK v1.3.0'ı indirin
3. İndirilen ZIP dosyasını açın
4. `samsung-health-sensor-api.aar` dosyasını bulun

## 🔧 2. AAR Dosyasını Projeye Eklemek

```bash
# Gerekli klasörleri oluştur
mkdir -p modules/react-native-samsung-health/android/libs

# AAR dosyasını kopyala
cp /path/to/samsung-health-sensor-api.aar modules/react-native-samsung-health/android/libs/
```

## 🔧 3. Android Manifest Güncellemesi

Android izinlerini güncellememiz gerekiyor:

```xml
<!-- app/src/main/AndroidManifest.xml -->
<uses-permission android:name="com.samsung.android.providers.health.permission.READ" />
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.BODY_SENSORS_BACKGROUND" />
```

## 🔧 4. Samsung Developer Console Kurulumu

### Partner Registration
1. Samsung Developer Portal'da hesap oluşturun
2. Samsung Health Partner Program'a katılın
3. Projenizi Samsung Health Partner olarak kaydedin

### SDK Policy Configuration
1. Samsung Health SDK'da policy error alırsanız:
2. Samsung Developer Console'da projenizi kaydedin
3. Samsung Health SDK tracking scope'larını tanımlayın
4. Samsung contact point ile iletişime geçin

## 🔧 5. Samsung Health App Kurulumu

### Telefonda
```bash
# Samsung Health app'in son versiyonunu yükleyin
# Galaxy Store veya Play Store'dan
```

### Saatte
```bash
# Galaxy Watch Manager ile Samsung Health app'i saate yükleyin
# Saat ayarlarından Developer Mode'u aktif edin
```

## 🔧 6. Development Mode

Galaxy Watch'da developer mode'u aktif etmek için:
1. Saat Ayarları > Saat Hakkında
2. Yazılım sürümüne 7 kez dokunun
3. Developer Options aktif olacak
4. Developer Options > ADB Debugging'i aktif edin

## 🔧 7. Projeyi Çalıştırma

### Local Package Install
```bash
# Root directory'de
npm install

# Samsung Health bridge'i yükle
cd modules/react-native-samsung-health
npm install
cd ../..
```

### Android Build
```bash
# Android için build
npm run android

# Veya direkt
npx expo run:android
```

## 🔧 8. Test Etme

### Bağlantı Testi
1. Uygulamayı açın
2. "Samsung Health'e Bağlan" butonuna basın
3. Samsung Health izinlerini onaylayın
4. Bağlantı başarılı olursa desteklenen sensörler listelenir

### EKG Testi
1. Samsung Health'e bağlı olduğunuzdan emin olun
2. "EKG Ölçümü Başlat" butonuna basın
3. Saat ekranında EKG ölçümü başlar
4. Parmakınızı saatin kenarındaki sensöre 30 saniye dokunun
5. Ölçüm tamamlanınca uygulama verilerı gösterir

### SpO2 Testi
1. "SpO2 Ölçümü Başlat" butonuna basın
2. Saati bileğinizde doğru pozisyonda takın
3. Ölçüm süresince hareketsiz durun
4. SpO2 değeri uygulamada görünür

## 🚨 Troubleshooting

### "SDK_POLICY_ERROR" Hatası
- Samsung Developer Console'da projenizi kaydedin
- Samsung contact point ile iletişime geçin
- Policy scope'larını doğru tanımlayın

### "NOT_SUPPORTED" Hatası
- Cihazınızın desteklenen sensörlere sahip olduğunu kontrol edin
- Galaxy Watch4 ve üzeri modeller gereklidir

### Bağlantı Hataları
- Samsung Health app'in güncel olduğunu kontrol edin
- Telefon ve saat eşleştirmesini kontrol edin
- Samsung Health izinlerini kontrol edin

### Build Hataları
- `samsung-health-sensor-api.aar` dosyasının doğru konumda olduğunu kontrol edin
- Android Studio'dan clean build yapın

## 📝 Notlar

- Samsung Health SDK sadece Samsung Galaxy Watch serisi ile çalışır
- Emulator desteklenmez, fiziksel cihaz gereklidir
- EKG ve SpO2 ölçümleri on-demand çalışır
- Kalp atış hızı continuous tracking destekler
- Kan basıncı için Samsung Health uygulamasından veri çekmek gerekir

## 🔗 Linkler

- [Samsung Health SDK Documentation](https://developer.samsung.com/health/sensor)
- [Samsung Developer Portal](https://developer.samsung.com)
- [Galaxy Watch Development](https://developer.samsung.com/galaxy-watch) 