import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WelcomeSectionProps {
  displayName: string;
}

export default function WelcomeSection({ displayName }: WelcomeSectionProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  return (
    <View style={styles.welcomeSection}>
      <Text style={[styles.welcomeTitle, { color: theme.foreground }]}>{displayName ? `Welcome back, ${displayName}`:`Loading...`}</Text>
      <Text style={[styles.welcomeSubtitle, { color: theme.icon }]}>Ready to manage your shifts?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
});
