import GradientText from '@/components/GradientText'; // Use your existing GradientText component
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const plans = [
  { key: 'monthly', label: 'Monthly', price: '$2.99 / Monthly' },
  { key: 'annual', label: 'Annual', price: '$15.99 / Annual' },
  { key: 'lifetime', label: 'Lifetime', price: '$25.99 / Lifetime' },
];

const Subscribe = ({ onClose }: { onClose: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<
    'monthly' | 'annual' | 'lifetime'
  >('lifetime');

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
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
              ⭐⭐⭐⭐⭐ 1000+ download 🌍
            </Text>
          </View>

          {/* Title with gradient */}
          <GradientText
            style={styles.title}
            colors={['#000', '#000', '#a166f1']}
          >
            Remove Ads
          </GradientText>
          <Text style={styles.subtitle}>Unlock Pro Features 🔒</Text>

          {/* Description */}
          <Text style={styles.description}>
            We appreciate your contribution to our effort. You can get a pro
            membership and support the app 🙌
          </Text>

          {/* Pricing Options */}
          {plans.map(({ key, label, price }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.planButton,
                selectedPlan === key
                  ? styles.planButtonSelected
                  : styles.planButtonUnselected,
              ]}
              onPress={() =>
                setSelectedPlan(key as 'monthly' | 'annual' | 'lifetime')
              }
            >
              <Text style={styles.planLabel}>{label}</Text>
              <Text style={styles.planPrice}>{price}. Cancel anytime</Text>
            </TouchableOpacity>
          ))}

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => console.log(`Selected: ${selectedPlan}`)}
          >
            <LinearGradient
              colors={['#7366f1', '#a25caf']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
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
    color: '#18181b',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  planPrice: {
    color: '#18181b',
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
