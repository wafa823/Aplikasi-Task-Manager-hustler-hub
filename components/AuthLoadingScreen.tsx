// components/AuthLoadingScreen.tsx
// Premium loading screen setelah login/register berhasil

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/constants';

interface AuthLoadingScreenProps {
  mode: 'login' | 'register';
  email: string;
}

const LOGIN_STEPS = [
  { icon: 'shield',       label: 'Memverifikasi akun...' },
  { icon: 'database',     label: 'Memuat data kamu...' },
  { icon: 'layout',       label: 'Menyiapkan workspace...' },
  { icon: 'check-circle', label: 'Selamat datang kembali!' },
];

const REGISTER_STEPS = [
  { icon: 'user-plus',    label: 'Membuat akun kamu...' },
  { icon: 'shield',       label: 'Mengamankan data...' },
  { icon: 'layout',       label: 'Menyiapkan workspace...' },
  { icon: 'check-circle', label: 'Akun siap digunakan!' },
];

// Extract username from email (e.g. "john.doe@gmail.com" → "John Doe")
function formatEmailName(email: string): string {
  const local = email.split('@')[0];
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 20);
}

export default function AuthLoadingScreen({ mode, email }: AuthLoadingScreenProps) {
  const displayName = formatEmailName(email);
  const STEPS = mode === 'login' ? LOGIN_STEPS : REGISTER_STEPS;

  // Entrance animations
  const containerFade = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.6)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const greetOpacity  = useRef(new Animated.Value(0)).current;
  const greetSlide    = useRef(new Animated.Value(24)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const barOpacity    = useRef(new Animated.Value(0)).current;
  const shimmerAnim   = useRef(new Animated.Value(0)).current;

  // Bouncing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(containerFade, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(greetOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(greetSlide, { toValue: 0, tension: 100, friction: 12, useNativeDriver: true }),
      ]),
      Animated.timing(barOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start();

    // Shimmer loop
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Step progression
    const timings = [0, 550, 1150, 1750];
    const timers = timings.map((t, i) =>
      setTimeout(() => setCurrentStep(i), t + 400)
    );

    // Bounce dots
    const bounceDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -8, duration: 280, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    bounceDot(dot1, 0);
    bounceDot(dot2, 140);
    bounceDot(dot3, 280);

    return () => timers.forEach(clearTimeout);
  }, []);

  const barW = progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const isLogin = mode === 'login';

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <LinearGradient
        colors={['#020617', '#050d1f', '#0a1628']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glows */}
      <View style={[styles.glow, {
        top: -100, left: '20%',
        backgroundColor: isLogin ? 'rgba(59,130,246,0.07)' : 'rgba(245,158,11,0.07)',
      }]} />
      <View style={[styles.glow, {
        bottom: -100, right: '10%',
        backgroundColor: isLogin ? 'rgba(168,85,247,0.05)' : 'rgba(34,197,94,0.05)',
      }]} />

      <View style={styles.inner}>
        {/* Logo mark */}
        <Animated.View style={[styles.logoWrap, {
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          borderColor: isLogin ? 'rgba(59,130,246,0.4)' : 'rgba(245,158,11,0.4)',
        }]}>
          <LinearGradient
            colors={isLogin
              ? ['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.04)']
              : ['rgba(245,158,11,0.18)', 'rgba(245,158,11,0.04)']
            }
            style={StyleSheet.absoluteFill}
          />
          <Feather
            name={isLogin ? 'log-in' : 'user-plus'}
            size={30}
            color={isLogin ? COLORS.blue : COLORS.amber}
          />
        </Animated.View>

        {/* Greeting */}
        <Animated.View style={{ opacity: greetOpacity, transform: [{ translateY: greetSlide }], alignItems: 'center' }}>
          <Text style={[styles.label, { color: isLogin ? COLORS.blue : COLORS.amber }]}>
            {isLogin ? 'MASUK KE AKUN' : 'DAFTAR AKUN BARU'}
          </Text>
          <Text style={styles.name}>{displayName} 👋</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.sub}>
            {isLogin
              ? 'Menyiapkan semua tugas dan workspace kamu...'
              : 'Menyiapkan akun dan workspace baru kamu...'}
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View style={[styles.progressWrap, { opacity: barOpacity }]}>
          <View style={styles.progressBg}>
            <Animated.View style={[
              styles.progressFill,
              { width: barW as any, backgroundColor: isLogin ? COLORS.blue : COLORS.amber }
            ]}>
              <Animated.View style={[
                styles.shimmer,
                {
                  transform: [{
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 320],
                    }),
                  }],
                },
              ]} />
            </Animated.View>
          </View>

          {/* Steps row */}
          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone   = i < currentStep;
              const accentColor = isLogin ? COLORS.blue : COLORS.amber;
              return (
                <View key={i} style={styles.stepCol}>
                  <View style={[
                    styles.stepDot,
                    isDone && { backgroundColor: accentColor, borderColor: accentColor },
                    isActive && { borderColor: accentColor, backgroundColor: isLogin ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)' },
                  ]}>
                    <Feather
                      name={(isDone ? 'check' : step.icon) as any}
                      size={10}
                      color={isDone ? COLORS.bg : isActive ? accentColor : COLORS.textDim}
                    />
                  </View>
                  {isActive && (
                    <Text style={[styles.stepLabel, { color: accentColor }]}>
                      {step.label}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Bouncing dots */}
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { transform: [{ translateY: dot }], backgroundColor: isLogin ? COLORS.blue : COLORS.amber },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 40,
  },

  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    ...Platform.select({ web: { filter: 'blur(70px)' } }),
  } as any,

  // Logo
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({ web: { boxShadow: '0 0 40px rgba(0,0,0,0.4)' } }),
  } as any,

  // Greeting
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  name: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: COLORS.textDim,
    fontSize: 12,
    marginBottom: 8,
  },
  sub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Progress
  progressWrap: { width: '100%', maxWidth: 360, gap: 16 },
  progressBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0, left: 0,
    width: 80, height: '100%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 3,
    ...Platform.select({ web: { filter: 'blur(4px)' } }),
  } as any,

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepCol: { flex: 1, alignItems: 'center', gap: 5 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Dots
  dotsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, opacity: 0.8 },
});
