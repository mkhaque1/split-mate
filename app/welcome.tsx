import Button from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/logo.gif')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to SplitMate</Text>
        <Text style={styles.subtitle}>Smart Shared Expense Tracker</Text>
        <Button
          title="Get Started"
          style={styles.button}
          onPress={() => router.replace('/auth')}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: 200,
    alignSelf: 'center',
  },
});
