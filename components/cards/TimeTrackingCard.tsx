import ClockButton from '@/components/cards/ClockButton';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  isClockedIn: boolean;
  onStatusChange: () => Promise<void> | void;
}

export default function TimeTrackingCard({ isClockedIn, onStatusChange }: Props) {
  return (
    <View style={styles.clockSection}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Time Tracking</Text>
          <View style={styles.statusContainer}>
            <FontAwesome name="clock-o" size={14} color="#6B7280" style={styles.statusIcon} />
            <Text style={styles.statusText}>
              {isClockedIn ? 'Clocked in' : 'Not clocked in'}
            </Text>
          </View>
        </View>
        <ClockButton isClockedIn={isClockedIn} onStatusChange={onStatusChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clockSection: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
