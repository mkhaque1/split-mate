import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getAnalytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Get env variables from Constants with fallbacks
const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = Constants.expoConfig?.extra || {};

// Fallback configuration if env variables are not available
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || 'AIzaSyC2bY-dI12BDtLj9-bqHLdDTiwNGALkJ6c',
  authDomain: FIREBASE_AUTH_DOMAIN || 'split-mate-app-1f212.firebaseapp.com',
  projectId: FIREBASE_PROJECT_ID || 'split-mate-app-1f212',
  storageBucket: FIREBASE_STORAGE_BUCKET || 'split-mate-app-1f212.firebasestorage.app',
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || '942853203229',
  appId: FIREBASE_APP_ID || '1:942853203229:android:145e5ecee3020c97e32df4',
  // Only include measurementId if it's available and not a placeholder
  ...(FIREBASE_MEASUREMENT_ID && FIREBASE_MEASUREMENT_ID !== 'G-XXXXXXXXXX' ? { measurementId: FIREBASE_MEASUREMENT_ID } : {}),
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log('Analytics not available (normal in development):', e.message);
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const firestore = getFirestore(app);
export { app, auth, db, firestore };

