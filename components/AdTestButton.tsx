import { useAppOpenAd } from '@/hooks/useAppOpenAd';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface AdTestButtonProps {
  style?: any;
}

export default function AdTestButton({ style }: AdTestButtonProps) {
  const { showAppOpenAd, isLoading } = useAppOpenAd();

  const handleTestAd = async () => {
    try {
      const shown = await showAppOpenAd();
      if (shown) {
        Alert.alert('Success', 'App Open Ad was shown successfully!');
      } else {
        Alert.alert('Info', 'App Open Ad is not ready yet or failed to show');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to show App Open Ad');
      console.error('Ad test error:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleTestAd}
      disabled={isLoading}
    >
      <Text style={styles.buttonText}>
        {isLoading ? 'Loading Ad...' : 'Test App Open Ad'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});