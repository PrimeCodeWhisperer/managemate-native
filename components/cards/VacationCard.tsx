import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VacationCard() {
  return (
    <View style={styles.vacationCard}>
      <View style={styles.vacationContent}>
        <FontAwesome name="umbrella" size={48} color="#D1D5DB" style={styles.vacationIcon} />
        <Text style={styles.vacationTitle}>No upcoming vacations</Text>
        <Text style={styles.vacationSubtitle}>Plan your time off and submit vacation requests</Text>
        <TouchableOpacity style={styles.vacationButton}>
          <Text style={styles.vacationButtonText}>Request Vacation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vacationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
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
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  vacationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  vacationButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  vacationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
