import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AdEventType,
  AppOpenAd,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

// Ad Unit IDs
const BANNER_ID = __DEV__
  ? TestIds.BANNER // Test Banner Ad Unit ID
  : 'ca-app-pub-8613339095164526/4093158170'; // Real Banner Ad Unit ID

const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL // Test Interstitial Ad Unit ID
  : 'ca-app-pub-8613339095164526/3230937993'; // Real Interstitial Ad Unit ID

const APP_OPEN_ID = __DEV__
  ? TestIds.APP_OPEN // Test App Open Ad Unit ID
  : 'ca-app-pub-8613339095164526/2372138462'; // Real App Open Ad Unit ID

// App Open Ad Manager
class AppOpenAdManager {
  private appOpenAd: AppOpenAd | null = null;
  private isLoadingAd = false;
  private isShowingAd = false;

  constructor() {
    this.loadAd();
  }

  private loadAd = () => {
    if (this.isLoadingAd || this.isAdAvailable()) {
      return;
    }

    this.isLoadingAd = true;

    this.appOpenAd = AppOpenAd.createForAdRequest(APP_OPEN_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App Open Ad loaded');
      this.isLoadingAd = false;
    });

    this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('App Open Ad error:', error);
      this.isLoadingAd = false;
      this.appOpenAd = null;
    });

    this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('App Open Ad closed');
      this.isShowingAd = false;
      this.appOpenAd = null;
      this.loadAd(); // Load next ad
    });

    this.appOpenAd.load();
  };

  private isAdAvailable = (): boolean => {
    return this.appOpenAd !== null;
  };

  public showAdIfAvailable = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (this.isShowingAd) {
        console.log('App Open Ad is already showing');
        resolve(false);
        return;
      }

      if (!this.isAdAvailable()) {
        console.log('App Open Ad is not ready yet');
        this.loadAd();
        resolve(false);
        return;
      }

      this.isShowingAd = true;
      
      // Set a timeout to ensure we don't hang forever
      const timeout = setTimeout(() => {
        console.log('App Open Ad timeout');
        this.isShowingAd = false;
        resolve(false);
      }, 5000); // 5 second timeout

      // Add event listeners for this specific show attempt
      const onAdOpened = () => {
        clearTimeout(timeout);
        console.log('App Open Ad opened');
        resolve(true);
      };

      const onAdError = (error: any) => {
        clearTimeout(timeout);
        console.log('App Open Ad failed to open:', error);
        this.isShowingAd = false;
        resolve(false);
      };

      const onAdClosed = () => {
        clearTimeout(timeout);
        console.log('App Open Ad closed');
        this.isShowingAd = false;
        resolve(true);
      };

      // Add temporary listeners
      this.appOpenAd?.addAdEventListener(AdEventType.LOADED, onAdOpened);
      this.appOpenAd?.addAdEventListener(AdEventType.ERROR, onAdError);
      this.appOpenAd?.addAdEventListener(AdEventType.CLOSED, onAdClosed);

      try {
        this.appOpenAd?.show();
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error showing app open ad:', error);
        this.isShowingAd = false;
        resolve(false);
      }
    });
  };
}

// Create singleton instance
export const appOpenAdManager = new AppOpenAdManager();

// Banner Ad Component
export function BannerAdComponent() {
  return (
    <View style={styles.bannerContainer}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => console.log('Banner ad loaded')}
        onAdFailedToLoad={(error) => console.log('Banner ad error:', error)}
      />
    </View>
  );
}

// Interstitial Ad Manager
class InterstitialAdManager {
  private interstitialAd: InterstitialAd | null = null;
  private isLoaded = false;

  constructor() {
    this.loadAd();
  }

  private loadAd = () => {
    this.interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      this.isLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad error:', error);
      this.isLoaded = false;
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.isLoaded = false;
      this.loadAd(); // Load next ad
    });

    this.interstitialAd.load();
  };

  public showAd = async (): Promise<boolean> => {
    if (this.isLoaded && this.interstitialAd) {
      await this.interstitialAd.show();
      return true;
    } else {
      console.log('Interstitial ad not ready yet');
      return false;
    }
  };
}

// Create singleton instance
export const interstitialAdManager = new InterstitialAdManager();

// Hook for App Open Ads
export function useAppOpenAd() {
  const [isAdShowing, setIsAdShowing] = useState(false);

  const showAppOpenAd = async () => {
    setIsAdShowing(true);
    const shown = await appOpenAdManager.showAdIfAvailable();
    setIsAdShowing(false);
    return shown;
  };

  return {
    showAppOpenAd,
    isAdShowing,
  };
}

// Legacy function for backward compatibility
export async function showInterstitialAd() {
  return await interstitialAdManager.showAd();
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
});
