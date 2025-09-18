import Button from '@/components/Button';
import GradientText from '@/components/GradientText';
import PrivacyModal from '@/components/PrivacyModal';
import { useApp } from '@/context/AppContext';
import { AuthService } from '@/lib/auth';
import { FirestoreService } from '@/lib/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  GoogleSigninButton
} from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// WebBrowser.maybeCompleteAuthSession();


GoogleSignin.configure({
  
  webClientId: "942853203229-a85mf84kj85b0oug7e1nhkoml86chemn.apps.googleusercontent.com", 
  offlineAccess: true,
});
export default function AuthScreen() {
  const devicewidth = Dimensions.get('window').width
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshGroups } = useApp();
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [userInfo,setuserInfo] = useState(null)
  const [Loader,setLoader] = useState(false)
  useEffect(() => {
  GoogleSignin.configure({
    webClientId: "942853203229-a85mf84kj85b0oug7e1nhkoml86chemn.apps.googleusercontent.com",
    offlineAccess: true,
  });
  console.log("Configured with webClientId:", "942853203229-a85mf84kj85b0oug7e1nhkoml86chemn.apps.googleusercontent.com");
}, []);

  useEffect(() => {
    AuthService.getCurrentUser().then(async (user) => {
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        router.replace('/(tabs)');
      }
    });
  }, []);

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { id_token, access_token } = response.authentication as any;
  //     handleGoogleLogin(id_token, access_token);
  //   }
  // }, [response]);



  // const handleGoogleLogin = async (idToken: string, accessToken: string) => {
  //   setLoading(true);
  //   try {
  //     const user = await AuthService.signInWithGoogle(idToken, accessToken);
  //     await AsyncStorage.setItem('user', JSON.stringify(user));

  //     // ADD THIS LOGIC HERE
  //     let groups = await FirestoreService.getUserGroups(user.id);
  //     if (groups.length === 0) {
  //       await FirestoreService.createGroup({
  //         name: ${user.displayName || 'My'}'s Group,
  //         members: [user.id],
  //         createdBy: user.id,
  //         currency: 'USD',
  //       });
  //       await refreshGroups();
  //     }

  //     await refreshGroups();
  //     router.replace('/(tabs)');
  //   } catch (error: any) {
  //     Alert.alert('Error', error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleGoogleSignin = async () => {
  console.log('calling Google Sign-In...');
  setLoader(true)
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // ✅ Get tokens
    const { idToken, user } = await GoogleSignin.signIn();
    const { accessToken } = await GoogleSignin.getTokens();

    // ✅ Authenticate with Firebase via AuthService
    const savedUser = await AuthService.signInWithGoogle(idToken!, accessToken!);

    // ✅ Save locally
    await AsyncStorage.setItem('user', JSON.stringify(savedUser));

    // ✅ Create default group & marketing consent (move this inside AuthService if you prefer central logic)
    let groups = await FirestoreService.getUserGroups(savedUser.id);
    if (groups.length === 0) {
await FirestoreService.createGroup({
  name: `${displayName}'s Group`,
  members: [user.id],
  createdBy: user.id,
  currency: 'USD',
});

      await FirestoreService.setUserMarketingConsent(savedUser.id, acceptMarketing);
      await refreshGroups();
    }

    setuserInfo(savedUser);
setLoader(false)

    // setTimeout(() => {
      router.replace('/(tabs)');
    // }, 200);

  } catch (error: any) {
    console.log('Google Sign-In error:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert('Cancelled', 'User cancelled the login flow');
setLoader(false)

    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert('In Progress', 'Sign in is in progress');
setLoader(false)

    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Error', 'Play services are not available or outdated');
setLoader(false)

    } else {
      Alert.alert('Error', error.message);
setLoader(false)

    }
  }
};





  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !displayName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (isSignUp && !acceptedPrivacy) {
      Alert.alert('Error', 'You must accept the Privacy Policy to continue.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const user = await AuthService.signUp(email, password, displayName);

        // Create a default group for the user
await FirestoreService.createGroup({
  name: `${displayName}'s Group`,
  members: [user.id],
  createdBy: user.id,
  currency: 'USD',
});

        // Store marketing consent in Firestore
        await FirestoreService.setUserMarketingConsent(
          user.id,
          acceptMarketing
        );

        await refreshGroups();
      } else {
        await AuthService.signIn(email, password);
      }

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
      setLoading(false);
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

            {isSignUp && (
              <>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                  onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: '#6366f1',
                      backgroundColor: acceptedPrivacy
                        ? '#6366f1'
                        : 'transparent',
                      marginRight: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {acceptedPrivacy && (
                      <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'Inter-Regular',
                      fontSize: 14,
                    }}
                  >
                    I have read and accept the{' '}
                    <Text
                      style={{
                        color: '#6366f1',
                        textDecorationLine: 'underline',
                      }}
                      onPress={() => setShowPrivacy(true)}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                  onPress={() => setAcceptMarketing(!acceptMarketing)}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: '#6366f1',
                      backgroundColor: acceptMarketing
                        ? '#6366f1'
                        : 'transparent',
                      marginRight: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {acceptMarketing && (
                      <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'Inter-Regular',
                      fontSize: 14,
                    }}
                  >
                    I want to receive marketing emails and future updates
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleAuth}
              loading={loading}
              style={styles.authButton}
            />
<Text style={{color:'#fff', fontSize: 16,
    fontFamily: 'Inter-Bold',alignSelf:'center',marginVertical:15}}>
  OR
</Text>
            


            {
  Loader ? 
  <ActivityIndicator size={'large'} color={'#6366f1'} /> :
       <GoogleSigninButton
              style={{width:devicewidth-15, height:48,alignSelf:'center'}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignin}
              />
}
           
          </View>
        </ScrollView>

   
        {!isSignUp && (
          <View style={styles.header}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{'\n'}
              <Text
                style={{ color: '#6366f1', textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://pyonet.com')}
              >
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                style={{ color: '#6366f1', textDecorationLine: 'underline' }}
                onPress={() => setShowPrivacy(true)}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        )}
        {showPrivacy && (
          <PrivacyModal visible={true} onClose={() => setShowPrivacy(false)} />
        )}
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
    padding: 10,
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
  footerText: {
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },
});