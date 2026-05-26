// components/OnboardingScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';
import OnboardingLoadingScreen from '@/components/OnboardingLoadingScreen';

interface OnboardingScreenProps {
  onSave: (name: string) => void;
}

export default function OnboardingScreen({ onSave }: OnboardingScreenProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    setSubmittedName(trimmed);
    setIsLoading(true);
    // Delay actual save so loading screen plays out (~4.2s)
    setTimeout(() => {
      onSave(trimmed);
    }, 4200);
  };

  if (isLoading) {
    return <OnboardingLoadingScreen name={submittedName} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.formContainer}>
          {/* Logo Mark */}
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Feather name="layers" size={20} color={COLORS.amber} />
            </View>
            <Text style={styles.appName}>Hustler's Hub</Text>
          </View>

          {/* Superlist-style Typography */}
          <Text style={styles.title}>Siapa namamu?</Text>
          <Text style={styles.subtitle}>Yuk, personalisasi workspace kamu.</Text>

          {/* Form */}
          <View style={styles.formArea}>
            <TextInput
              style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              value={name}
              onChangeText={setName}
              placeholder="Nama kamu"
              placeholderTextColor={COLORS.textDim}
              autoFocus
              onSubmitEditing={handleSubmit}
            />

            <TouchableOpacity
              style={[styles.primaryButton, !name.trim() && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Mulai Sekarang</Text>
              <Feather name="arrow-right" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  formArea: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: COLORS.amber,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
