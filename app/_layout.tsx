import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  MobileAds
} from 'react-native-google-mobile-ads';
import { AppProvider } from '../context/AppContext';
import { useFrameworkReady } from '../hooks/useFramewrokReady';
SplashScreen.preventAutoHideAsync();
  useEffect(() => {
    const initializeAds = async () => {
      await MobileAds().initialize();
    };
    initializeAds();
  }, []);
export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <StripeProvider publishableKey="pk_test_51Riu1dE3DagpddtyiDGN1qlPJ8PxxjSJbOPF4loWv197MZUnlzlqQHpH5DboGwZYYrMY7141VHEhLJ3ufJEoGv4r00QUkgXwHA">
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AppProvider>
    </StripeProvider>
  );
}
