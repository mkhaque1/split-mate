import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { appOpenAdManager } from './AdMobManager';

interface AppOpenAdContextType {
  showAppOpenAd: () => Promise<boolean>;
  isAdLoading: boolean;
}

const AppOpenAdContext = createContext<AppOpenAdContextType | undefined>(undefined);

export function useAppOpenAdContext() {
  const context = useContext(AppOpenAdContext);
  if (!context) {
    throw new Error('useAppOpenAdContext must be used within AppOpenAdProvider');
  }
  return context;
}

interface AppOpenAdProviderProps {
  children: React.ReactNode;
  showOnAppStart?: boolean;
}

export function AppOpenAdProvider({ children, showOnAppStart = true }: AppOpenAdProviderProps) {
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [hasShownInitialAd, setHasShownInitialAd] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  const showAppOpenAd = async (): Promise<boolean> => {
    setIsAdLoading(true);
    try {
      const shown = await appOpenAdManager.showAdIfAvailable();
      return shown;
    } finally {
      setIsAdLoading(false);
    }
  };

  useEffect(() => {
    if (showOnAppStart && !hasShownInitialAd) {
      // Show app open ad after a short delay when app starts
      const timer = setTimeout(async () => {
        try {
          await showAppOpenAd();
        } catch (error) {
          console.error('Error showing app open ad:', error);
        } finally {
          setHasShownInitialAd(true);
          setIsAppReady(true);
        }
      }, 800); // Reduced delay

      return () => clearTimeout(timer);
    } else {
      // If not showing ad on start, mark as ready immediately
      setIsAppReady(true);
    }
  }, [showOnAppStart, hasShownInitialAd]);

  const contextValue: AppOpenAdContextType = {
    showAppOpenAd,
    isAdLoading,
  };

  // Don't render children until app is ready (after ad attempt)
  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <AppOpenAdContext.Provider value={contextValue}>
      {children}
      {isAdLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}
    </AppOpenAdContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});