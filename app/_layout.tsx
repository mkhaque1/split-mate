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
import { LogBox } from 'react-native';
import {
    MobileAds
} from 'react-native-google-mobile-ads';
import { AppOpenAdProvider } from '../components/AppOpenAdProvider';
import { AppProvider } from '../context/AppContext';
import { useFrameworkReady } from '../hooks/useFramewrokReady';
LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const initializeAds = async () => {
      try {
        await MobileAds().initialize();
        console.log("Ads initialized");
      } catch (e) {
        console.error("Ads init error", e);
      }
    };
    initializeAds();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <StripeProvider publishableKey="pk_live_51Riu1WCX5uApISzR8Ltiju6VwWrp2mggEOKv3mjqAv2pBWRbJ7uVZYrpTTgUm1KFoJdoqr9KOKRHJSMw3w1d3WDX007hPgaHC5">
      <AppProvider>
        <AppOpenAdProvider showOnAppStart={true}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </AppOpenAdProvider>
      </AppProvider>
    </StripeProvider>
  );
}
