// app/_layout.tsx
// Root layout — handles global providers + status bar

import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';
import { ToastProvider } from '@/components/Toast';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (min-width: 769px) {
      body {
        zoom: 0.85;
      }
    }
  `;
  document.head.appendChild(style);
}

export default function RootLayout() {
  return (
    <ToastProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <Slot />
      </View>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
