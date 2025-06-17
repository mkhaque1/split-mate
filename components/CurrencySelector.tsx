import { LinearGradient } from 'expo-linear-gradient';
import { Check, X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencySelectorProps {
  visible: boolean;
  currencies: Currency[];
  selectedCurrency: string;
  onSelect: (currency: string) => void;
  onClose: () => void;
}

export default function CurrencySelector({
  visible,
  currencies,
  selectedCurrency,
  onSelect,
  onClose,
}: CurrencySelectorProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Currency</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {currencies.map((currency) => (
            <Pressable
              key={currency.code}
              style={[
                styles.currencyItem,
                selectedCurrency === currency.code && styles.selectedItem,
              ]}
              onPress={() => onSelect(currency.code)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <View style={styles.currencyDetails}>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
              </View>

              {selectedCurrency === currency.code && (
                <Check size={20} color="#6366f1" />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#262626',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  selectedItem: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    width: 40,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
});
