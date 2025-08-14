import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileSkeleton() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.secondary }]}> 
      <View style={[styles.avatar, { backgroundColor: theme.icon, opacity: 0.2 }]} />
      <View style={styles.textContainer}>
        <View style={[styles.line, { backgroundColor: theme.icon, opacity: 0.2, width: '60%' }]} />
        <View style={[styles.line, { backgroundColor: theme.icon, opacity: 0.2, width: '40%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  line: {
    height: 16,
    borderRadius: 8,
  },
});

