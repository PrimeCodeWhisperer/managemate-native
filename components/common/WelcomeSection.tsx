import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WelcomeSectionProps {
  displayName: string;
}

export default function WelcomeSection({ displayName }: WelcomeSectionProps) {
  return (
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeTitle}>Welcome back, {displayName}!</Text>
      <Text style={styles.welcomeSubtitle}>Ready to manage your shifts?</Text>
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
    color: '#000000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
