// app/(tabs)/_layout.tsx
// Minimal pass-through — all state and routing is handled in app/_layout.tsx

import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
