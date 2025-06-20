import Button from '@/components/Button';
import GradientText from '@/components/GradientText';
import { useApp } from '@/context/AppContext';
import { AuthService } from '@/lib/auth';
import { FirestoreService } from '@/lib/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshGroups } = useApp();
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '<YOUR_EXPO_CLIENT_ID>',
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    androidClientId: '<YOUR_ANDROID_CLIENT_ID>',
    webClientId:
      '942853203229-fut3kl4fcs7o7e5g1sqj9ger0290gdhq.apps.googleusercontent.com',
  });

  // Auto-login if user is already authenticated
  useEffect(() => {
    AuthService.getCurrentUser().then(async (user) => {
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        router.replace('/(tabs)');
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.authentication as any;
      handleGoogleLogin(id_token, access_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string, accessToken: string) => {
    setLoading(true);
    try {
      const user = await AuthService.signInWithGoogle(idToken, accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // ADD THIS LOGIC HERE
      let groups = await FirestoreService.getUserGroups(user.id);
      if (groups.length === 0) {
        await FirestoreService.createGroup({
          name: `${user.displayName || 'My'}'s Group`,
          members: [user.id],
          createdBy: user.id,
          currency: 'USD',
        });
        await refreshGroups();
      }

      await refreshGroups();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !displayName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const user = await AuthService.signUp(email, password, displayName);

        // // Create a default group for the user
        await FirestoreService.createGroup({
          name: `${displayName}'s Group`,
          members: [user.id],
          createdBy: user.id,
          currency: 'USD',
        });

        await refreshGroups();
      } else {
        await AuthService.signIn(email, password);
        await refreshGroups();
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <GradientText
              style={styles.title}
              colors={['#ffffff', '#a1a1aa', '#71717a']}
            >
              SplitMate
            </GradientText>
            <Text style={styles.subtitle}>Smart Shared Expense Tracker</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.toggleContainer}>
              <Button
                title="Sign In"
                variant={!isSignUp ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setIsSignUp(false)}
                style={styles.toggleButton}
              />
              <Button
                title="Sign Up"
                variant={isSignUp ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setIsSignUp(true)}
                style={styles.toggleButton}
              />
            </View>

            <Button
              title="Continue with Google"
              onPress={() => promptAsync()}
              loading={loading}
              style={{ marginBottom: 16 }}
              disabled={!request}
            />

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#71717a"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#71717a"
                // keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#71717a"
                secureTextEntry
              />
            </View>

            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleAuth}
              loading={loading}
              style={styles.authButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#404040',
  },
  authButton: {
    marginTop: 16,
  },
});
