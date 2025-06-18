import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/contexts/authContext'
import * as SplashScreen from 'expo-splash-screen'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const StackLayout = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Minimum loading time'ı kaldır, hızlı başlat
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('App initialization completed');
      } catch (e) {
        console.warn('App initialization error:', e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ai-health" options={{ headerShown: false }} />
      <Stack.Screen name="ai-health-assessment" options={{ headerShown: false }} />
      <Stack.Screen name="ai-test" options={{ headerShown: false }} />
      <Stack.Screen name="appointment-detail" options={{ headerShown: false }} />
      <Stack.Screen name="doctor-detail" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout(){
  return(
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  )
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
})