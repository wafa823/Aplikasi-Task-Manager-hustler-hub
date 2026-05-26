import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';
import OnboardingLoadingScreen from '@/components/OnboardingLoadingScreen';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  onGuestLogin: () => void;
  error: string;
}

export default function AuthScreen({ onLogin, onRegister, onGuestLogin, error }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;

  // --- ANIMATIONS ---
  const floatAnim1 = React.useRef(new Animated.Value(0)).current;
  const floatAnim2 = React.useRef(new Animated.Value(0)).current;
  
  // Transition animation for Login/Register toggle
  const formFadeAnim = React.useRef(new Animated.Value(1)).current;
  const formTranslateY = React.useRef(new Animated.Value(0)).current;

  const toggleMode = () => {
    // Fade out and slide down slightly
    Animated.parallel([
      Animated.timing(formFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 10, duration: 150, useNativeDriver: true })
    ]).start(() => {
      // Swap state while invisible
      setIsLogin(!isLogin);
      // Fade in and slide up
      Animated.parallel([
        Animated.timing(formFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start();
    });
  };

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, { toValue: 1, duration: 10000, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 0, duration: 10000, useNativeDriver: true })
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: 1, duration: 12000, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: 0, duration: 12000, useNativeDriver: true })
      ])
    ).start();
  }, [floatAnim1, floatAnim2]);

  const translateY1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [-80, 80] });
  const scale1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  
  const translateY2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [80, -80] });
  const scale2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      if (isLogin) {
        onLogin(email, password);
      } else {
        onRegister(email, password);
      }
    }, 4200);
  };

  // Inject Lusion-style Noise Grain for Web
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        .lusion-noise {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          pointer-events: none;
          z-index: 50;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `;
      document.head.appendChild(style);
      
      const noiseDiv = document.createElement('div');
      noiseDiv.className = 'lusion-noise';
      document.body.appendChild(noiseDiv);

      return () => {
        document.head.removeChild(style);
        if (document.body.contains(noiseDiv)) document.body.removeChild(noiseDiv);
      };
    }
  }, []);

  // Reset loading if there's an error (parent sets error prop)
  React.useEffect(() => {
    if (error) setIsLoading(false);
  }, [error]);

  if (isLoading) {
    // Derive display name from email prefix (e.g. john.doe@gmail.com → John Doe)
    const displayName = email
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 24);
    return <OnboardingLoadingScreen name={displayName} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Editorial Vertical Typography for Desktop */}
      {isDesktop && (
        <View style={styles.editorialWrapper} pointerEvents="none">
          <Text style={styles.editorialTextLeft}>HUSTLER'S</Text>
          <Text style={styles.editorialTextRight}>WORKSPACE</Text>
        </View>
      )}

      {/* Animated Background Orbs - Kept for subtle light, but much darker */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.glowOrb, { 
          backgroundColor: 'rgba(245, 158, 11, 0.08)', // Very subtle amber
          top: '-10%', right: '-15%', 
          transform: [{ translateY: translateY1 }, { scale: scale1 }] 
        }]} />
        <Animated.View style={[styles.glowOrb, { 
          backgroundColor: 'rgba(59, 130, 246, 0.08)', // Very subtle blue
          bottom: '-10%', left: '-15%', 
          transform: [{ translateY: translateY2 }, { scale: scale2 }] 
        }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.formContainer, { opacity: formFadeAnim, transform: [{ translateY: formTranslateY }] }]}>
          {/* Lusion-style Massive Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? 'Hustler\'s\nHub.' : 'Bergabung\nSekarang.'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Masukkan kredensialmu untuk mengakses workspace.' : 'Buat akun untuk mulai mengorganisir hidupmu.'}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Minimalist Line Inputs */}
          <View style={styles.inputGroup}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>ALAMAT EMAIL</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="kamu@contoh.com"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={Platform.OS === 'web' ? 'off' : 'off'}
                  textContentType="none"
                  importantForAutofill="no"
                />
              </View>
            </View>
            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>KATA SANDI</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.input, { paddingRight: 40 }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  secureTextEntry={!showPassword}
                  autoComplete={Platform.OS === 'web' ? 'new-password' : 'off'}
                  textContentType="none"
                  importantForAutofill="no"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Primary Action */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {isLogin ? 'Masuk' : 'Daftar Sekarang'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchModeButton} onPress={toggleMode} activeOpacity={0.6}>
            <Text style={styles.switchModeText}>
              {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest Action */}
          <TouchableOpacity style={styles.guestButton} onPress={onGuestLogin} activeOpacity={0.6}>
            <Text style={styles.guestButtonText}>Lanjut sebagai Tamu</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg, // Sync with dashboard background
    overflow: 'hidden',
  },
  editorialWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 0,
  },
  editorialTextLeft: {
    color: 'rgba(255, 255, 255, 0.02)',
    fontSize: 140,
    fontWeight: '900',
    letterSpacing: 8,
    transform: [{ rotate: '-90deg' }, { translateY: -40 }],
    width: 800, // Fixed width to allow rotation without layout breaking
    textAlign: 'center',
  },
  editorialTextRight: {
    color: 'rgba(255, 255, 255, 0.02)',
    fontSize: 140,
    fontWeight: '900',
    letterSpacing: 8,
    transform: [{ rotate: '90deg' }, { translateY: -40 }],
    width: 800,
    textAlign: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    ...Platform.select({
      web: { filter: 'blur(120px)' as any },
      default: { opacity: 0.3 },
    })
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 480, // Slightly wider for giant text
    alignSelf: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: COLORS.white,
    fontSize: 44, // Slightly smaller
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 300,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 3,
    borderColor: COLORS.red,
    gap: 8,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 32,
    gap: 20, // Add gap between email and password
  },
  inputWrapper: {
    width: '100%',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4, // Align slightly inward to match bubble
  },
  inputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    height: 52,
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.amber,
    borderRadius: 6, // Softer edges are more pleasing
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchModeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guestButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  guestButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
