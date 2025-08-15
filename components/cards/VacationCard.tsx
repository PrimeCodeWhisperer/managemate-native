import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';

export default function VacationCard() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return (
    <View
      style={[
        styles.vacationCard,
        { backgroundColor: theme.background, borderColor: theme.secondary, shadowColor: theme.shadow },
      ]}
    >
      <View style={styles.vacationContent}>
        <FontAwesome name="umbrella" size={48} color={theme.muted} style={styles.vacationIcon} />
        <Text style={[styles.vacationTitle, { color: theme.foreground }]}>No upcoming vacations</Text>
        <Text style={[styles.vacationSubtitle, { color: theme.icon }]}>Plan your time off and submit vacation requests</Text>
        <Link href="/vacations" asChild>
          <TouchableOpacity style={[styles.vacationButton, { backgroundColor: theme.primary }]}> 
            <Text style={[styles.vacationButtonText, { color: theme.primaryForeground }]}>Request Vacation</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vacationCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vacationContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacationIcon: {
    marginBottom: 16,
  },
  vacationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  vacationSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  vacationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  vacationButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
