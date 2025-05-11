# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Google Fit Entegrasyonu

Uygulama, Google Fit API'sini kullanarak Android cihazlardaki sağlık verilerine erişir. Entegrasyonu tamamlamak için aşağıdaki adımları takip edin:

### Google Cloud Console Yapılandırması

1. [Google Cloud Console](https://console.cloud.google.com/)'a giriş yapın.
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin.
3. Sol menüden "API ve Hizmetler" > "Panel"i seçin.
4. "API ve Hizmetler Etkinleştir" butonuna tıklayın.
5. "Fitness API"yi aratın ve etkinleştirin.
6. Sol menüden "API ve Hizmetler" > "Kimlik Bilgileri"ni seçin.
7. "Kimlik Bilgisi Oluştur" > "OAuth istemci kimliği"ni seçin.
8. Uygulama türünü "Android" olarak seçin.
9. Uygulamanıza bir isim verin.
10. Paket adını girin (app.json dosyasındaki "package" değeri: "com.medora.app").
11. SHA-1 sertifika parmak izini girin (aşağıda nasıl alınacağı anlatılmıştır).
12. "Oluştur" butonuna tıklayın.

### SHA-1 Sertifika Parmak İzi Alma

Geliştirme için debug sertifikasının SHA-1 parmak izini almak için:

#### Windows

```bash
cd %USERPROFILE%\.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### macOS/Linux

```bash
cd ~/.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Google Fit API İstemci Kimliğini Ayarlama

1. Google Cloud Console'dan aldığınız OAuth istemci kimliğini kopyalayın.
2. `utils/healthData.ts` dosyasında `options` nesnesine ekleyin:

```typescript
const options = {
  scopes: [
    Scopes.FITNESS_ACTIVITY_READ,
    Scopes.FITNESS_BODY_READ,
    Scopes.FITNESS_HEART_RATE_READ,
    Scopes.FITNESS_BLOOD_PRESSURE_READ,
  ],
  clientId: 'BURAYA_OAUTH_ISTEMCI_KIMLIGINI_EKLEYIN',
};
```

### Uygulama Yapılandırması

Aşağıdaki izinlerin `app.json` dosyasında eklendiğinden emin olun:

```json
"android": {
  "permissions": [
    "android.permission.ACTIVITY_RECOGNITION",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.BODY_SENSORS"
  ]
}
```
