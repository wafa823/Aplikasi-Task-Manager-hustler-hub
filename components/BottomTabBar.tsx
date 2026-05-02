import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';

interface BottomTabBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onAddTask: () => void;
}

export default function BottomTabBar({
  currentScreen,
  onNavigate,
  onAddTask,
}: BottomTabBarProps) {
  const isDashboardActive = ['dashboard', 'hub'].includes(currentScreen);
  const isProfileActive = currentScreen === 'profile';

  return (
    <View style={styles.container}>
      {/* Dashboard Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onNavigate('dashboard')}
        activeOpacity={0.7}
      >
        <Feather
          name="layout"
          size={24}
          color={isDashboardActive ? COLORS.amber : COLORS.textDim}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isDashboardActive ? COLORS.amber : COLORS.textDim },
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      {/* Center FAB */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={onAddTask}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={28} color={COLORS.bg} />
        </TouchableOpacity>
      </View>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onNavigate('profile')}
        activeOpacity={0.7}
      >
        <Feather
          name="user"
          size={24}
          color={isProfileActive ? COLORS.amber : COLORS.textDim}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isProfileActive ? COLORS.amber : COLORS.textDim },
          ]}
        >
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingHorizontal: 16,
  },
  tabButton: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fabWrapper: {
    marginTop: -32,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.bg,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
});
