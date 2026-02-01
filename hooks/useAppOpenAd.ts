import { useState } from 'react';
import { appOpenAdManager } from '../components/AdMobManager';

export function useAppOpenAd() {
  const [isLoading, setIsLoading] = useState(false);

  const showAppOpenAd = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const shown = await appOpenAdManager.showAdIfAvailable();
      return shown;
    } catch (error) {
      console.error('Error showing app open ad:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showAppOpenAd,
    isLoading,
  };
}