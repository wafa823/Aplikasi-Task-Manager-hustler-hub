// components/OnboardingLoadingScreen.tsx
// Premium cinematic loading screen after onboarding name entry

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

interface OnboardingLoadingScreenProps {
  name: string;
}

const STEPS = [
  { icon: 'user-check', label: 'Menyimpan profil kamu...' },
  { icon: 'layout',     label: 'Menyiapkan workspace...' },
  { icon: 'zap',        label: 'Mengaktifkan semua fitur...' },
  { icon: 'check-circle', label: 'Semua siap! ✨' },
];

export default function OnboardingLoadingScreen({ name }: OnboardingLoadingScreenProps) {
  // --- Entrance animations ---
  const containerFade  = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.6)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const greetOpacity   = useRef(new Animated.Value(0)).current;
  const greetSlide     = useRef(new Animated.Value(20)).current;
  const progressWidth  = useRef(new Animated.Value(0)).current;
  const progressOpacity= useRef(new Animated.Value(0)).current;
  const stepsOpacity   = useRef(new Animated.Value(0)).current;

  // --- Shimmer on progress bar ---
  const shimmerAnim    = useRef(new Animated.Value(0)).current;

  // --- Particles / dots ---
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Sequence:
    // 0ms   – fade in whole screen
    // 150ms – logo scales in
    // 400ms – greeting slides up
    // 650ms – progress bar appears & fills
    // 700ms – steps appear
    Animated.sequence([
      Animated.timing(containerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 100, friction: 9, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(greetOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(greetSlide, { toValue: 0, tension: 90, friction: 13, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(progressOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(stepsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 3600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start();

    // Shimmer loop
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Step progression — 4 steps spread over ~3.5s
    const timings = [0, 900, 1900, 2900];
    const timers = timings.map((t, i) =>
      setTimeout(() => setCurrentStep(i), t + 700)
    );

    // Dot bounce loop
    const bounceDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -8, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    bounceDot(dot1, 0);
    bounceDot(dot2, 150);
    bounceDot(dot3, 300);

    return () => timers.forEach(clearTimeout);
  }, []);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <LinearGradient
        colors={['#020617', '#050d1f', '#0a1628']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.inner}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <LinearGradient
            colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']}
            style={styles.logoGradient}
          />
          <View style={styles.logoRing}>
            <Feather name="layers" size={32} color={COLORS.amber} />
          </View>
        </Animated.View>

        {/* Greeting */}
        <Animated.View style={{ opacity: greetOpacity, transform: [{ translateY: greetSlide }], alignItems: 'center' }}>
          <Text style={styles.welcomeLabel}>SELAMAT DATANG</Text>
          <Text style={styles.welcomeName}>{name} 👋</Text>
          <Text style={styles.welcomeSub}>Hustler's Hub sedang mempersiapkan segalanya untukmu</Text>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View style={[styles.progressWrap, { opacity: progressOpacity }]}>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: progressBarWidth as any }]}>
              {/* Shimmer overlay */}
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 300],
                      }),
                    }],
                  },
                ]}
              />
            </Animated.View>
          </View>

          {/* Steps */}
          <Animated.View style={[styles.stepsRow, { opacity: stepsOpacity }]}>
            {STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone   = i < currentStep;
              return (
                <View key={i} style={styles.stepItem}>
                  <View style={[
                    styles.stepDot,
                    isDone && styles.stepDotDone,
                    isActive && styles.stepDotActive,
                  ]}>
                    <Feather
                      name={isDone ? 'check' : (step.icon as any)}
                      size={10}
                      color={isDone ? COLORS.bg : isActive ? COLORS.amber : COLORS.textDim}
                    />
                  </View>
                  {isActive && (
                    <Text style={styles.stepLabel}>{step.label}</Text>
                  )}
                </View>
              );
            })}
          </Animated.View>
        </Animated.View>

        {/* Bouncing dots */}
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ translateY: dot }] }]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 40,
  },

  // Ambient glows
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(245,158,11,0.06)',
    ...Platform.select({ web: { filter: 'blur(60px)' } }),
  } as any,
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59,130,246,0.05)',
    ...Platform.select({ web: { filter: 'blur(80px)' } }),
  } as any,

  // Logo
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    ...Platform.select({
      web: { boxShadow: '0 0 40px rgba(245,158,11,0.2)' },
    }),
  } as any,
  logoGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  logoRing: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Greeting
  welcomeLabel: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Progress
  progressWrap: {
    width: '100%',
    maxWidth: 360,
    gap: 16,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.amber,
    borderRadius: 3,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 3,
    ...Platform.select({ web: { filter: 'blur(4px)' } }),
  } as any,

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: COLORS.amber,
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  stepDotDone: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber,
  },
  stepLabel: {
    color: COLORS.amber,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Bouncing dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.amber,
    opacity: 0.7,
  },
});
