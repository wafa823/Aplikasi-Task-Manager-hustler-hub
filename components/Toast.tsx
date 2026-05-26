// components/Toast.tsx
// Global toast notification system — animates from bottom-right
// Supports: success, error, warning, info

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// --- TYPES ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// --- CONTEXT ---
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// --- TOAST CONFIG ---
const TOAST_CONFIG: Record<ToastType, { icon: string; accent: string; bg: string; border: string }> = {
  success: {
    icon: 'check-circle',
    accent: '#22c55e',
    bg: 'rgba(22, 34, 22, 0.97)',
    border: 'rgba(34, 197, 94, 0.3)',
  },
  error: {
    icon: 'alert-circle',
    accent: '#ef4444',
    bg: 'rgba(34, 14, 14, 0.97)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    icon: 'alert-triangle',
    accent: '#f59e0b',
    bg: 'rgba(34, 26, 10, 0.97)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  info: {
    icon: 'info',
    accent: '#3b82f6',
    bg: 'rgba(10, 20, 38, 0.97)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
};

// --- SINGLE TOAST ITEM ---
interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const translateY = useRef(new Animated.Value(0)).current; // No translation
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current; // Pop from smaller size
  const progressWidth = useRef(new Animated.Value(100)).current;
  const config = TOAST_CONFIG[toast.type];
  const duration = toast.duration ?? 3500;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
    ]).start();

    // Progress bar
    Animated.timing(progressWidth, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => dismissToast(), duration);
    return () => clearTimeout(timer);
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.8, // Shrink slightly
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(toast.id));
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: config.accent }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: `${config.accent}18` }]}>
        <Feather name={config.icon as any} size={18} color={config.accent} />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={styles.toastTitle}>{toast.title}</Text>
        {toast.message ? (
          <Text style={styles.toastMessage}>{toast.message}</Text>
        ) : null}
      </View>

      {/* Close */}
      <TouchableOpacity onPress={dismissToast} style={styles.closeBtn} activeOpacity={0.7}>
        <Feather name="x" size={14} color="rgba(255,255,255,0.4)" />
      </TouchableOpacity>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: config.accent,
            width: progressWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </Animated.View>
  );
}

// --- PROVIDER ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message, duration }]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
    zIndex: 9999,
    pointerEvents: 'box-none',
  } as any,
  toastItem: {
    width: Platform.OS === 'web' ? 340 : '100%',
    maxWidth: 380,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 0,
    overflow: 'hidden',
    gap: 10,
    // Shadow
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
      },
    }),
  } as any,
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginLeft: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  toastTitle: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  toastMessage: {
    color: 'rgba(241, 245, 249, 0.55)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    opacity: 0.7,
  },
});
