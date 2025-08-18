import GradientText from '@/components/GradientText';
import { useApp } from '@/context/AppContext';
import { FirestoreService } from '@/lib/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type PlanKey = 'monthly' | 'annual' | 'lifetime';

const plans: { key: PlanKey; label: string; price: string }[] = [
  { key: 'monthly', label: 'Monthly', price: '$2.99 / Monthly' },
  { key: 'annual', label: 'Annual', price: '$15.99 / Annual' },
  { key: 'lifetime', label: 'Lifetime', price: '$25.99 / Lifetime' },
];

const Subscribe = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('lifetime');
  
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { setIsPro, setUserSelectedPlan, user } = useApp();

  const url = 'https://split-node-server.vercel.app/create-subscription-session';
  // const url = 'http://192.168.100.11:3000/create-subscription-session'

  const handleContinue = async () => {
    if (!user?.email) {
      Alert.alert("Error", "No user email found. Please log in again.");
      return;
    }
    await handlePayment();
  };

  const handlePayment = async () => {
    setLoading(true);
    console.log('Starting payment for plan:', selectedPlan);

    try {
      // Step 1: Create payment intent on server
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, email: user.email }),
      });

      if (!response.ok) throw new Error('Failed to create payment session');

      const data = await response.json();
      console.log('Stripe response:', data);

      const { paymentIntent: clientSecret, ephemeralKey, customer } = data;

      // Step 2: Init payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'SplitMate',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
      });

      if (initError) throw initError;

      // Step 3: Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) throw paymentError;

      // Step 4: Save plan in Firestore
      const now = new Date();
      const planExpiry =
        selectedPlan === 'monthly'
          ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : selectedPlan === 'annual'
          ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : 'lifetime';

      const planObj = plans.find((p) => p.key === selectedPlan)!;
      const userPlan = {
        Plan: selectedPlan,
        label: planObj.label,
        price: planObj.price,
        start: now.toISOString(),
        expiry: planExpiry,
      };

      await FirestoreService.UpdatePlan(
        user.id,
        true,
        selectedPlan,
        userPlan.start,
        userPlan.expiry,
        userPlan
      );

      setIsPro(true);
      setUserSelectedPlan(userPlan);

      Alert.alert('Payment Successful', 'Thank you for subscribing!', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (err: any) {
      console.error('Payment failed:', err);
      Alert.alert(
        'Payment Error',
        err?.message || 'Something went wrong during payment.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#a1a1aa', '#a166f1', '#000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modal}
        >
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>#1 Split App</Text>
            <Text style={styles.headerSubtitle}>
              ⭐⭐⭐⭐⭐ 1000+ downloads 🌍
            </Text>
          </View>

          {/* Title */}
          <GradientText
            style={styles.title}
            colors={['#000', '#000', '#a166f1']}
          >
            Remove Ads
          </GradientText>
          <Text style={styles.subtitle}>Unlock Pro Features 🔒</Text>

          {/* Description */}
          <Text style={styles.description}>
            We appreciate your contribution 🙌 Get Pro to support the app.
          </Text>

          {/* Pricing Options */}
          {plans.map(({ key, label, price }) => {
            const selected = selectedPlan === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.planButton,
                  selected ? styles.planButtonSelected : styles.planButtonUnselected,
                ]}
                onPress={() => setSelectedPlan(key)}
              >
                <Text
                  style={[
                    styles.planLabel,
                    { color: selected ? '#18181b' : '#fff' },
                  ]}
                >
                  {label}
                </Text>
                <Text
                  style={[
                    styles.planPrice,
                    { color: selected ? '#18181b' : '#ddd' },
                  ]}
                >
                  {price}. Cancel anytime
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={loading}
          >
            <LinearGradient
              colors={['#7366f1', '#a25caf']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Processing...' : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 24,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  planButton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  planButtonSelected: {
    backgroundColor: '#fff',
    borderColor: '#6366f1',
  },
  planButtonUnselected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#a1a1aa',
  },
  planLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  continueButton: {
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});

export default Subscribe;
