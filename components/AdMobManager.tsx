import { AdMobBanner, AdMobInterstitial } from 'expo-ads-admob';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const BANNER_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // Test Banner Ad Unit ID
  : 'ca-app-pub-8613339095164526/4093158170'; //real Banner Ad Unit ID

const INTERSTITIAL_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712' // Test Interstitial Ad Unit ID
  : 'ca-app-pub-8613339095164526/3230937993'; //real Interstitial Ad Unit ID

export function BannerAd() {
  return (
    <View style={styles.bannerContainer}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={BANNER_ID}
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(err) =>
          console.log('Banner error:', err)
        }
      />
    </View>
  );
}

export async function showInterstitialAd() {
  await AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);
  await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
  await AdMobInterstitial.showAdAsync();
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
});
