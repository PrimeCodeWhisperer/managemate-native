import ClockButton from '@/components/cards/ClockButton';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Props {
  isClockedIn: boolean;
  onStatusChange: () => Promise<void> | void;
}

export default function TimeTrackingCard({ isClockedIn, onStatusChange }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  return (
    <View style={styles.clockSection}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.background,
            borderColor: theme.secondary,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>Time Tracking</Text>
          <View style={styles.statusContainer}>
            <FontAwesome
              name="clock-o"
              size={14}
              color={theme.icon}
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: theme.icon }]}>
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
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
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
  },
});
