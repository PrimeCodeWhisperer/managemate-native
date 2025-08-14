import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DayAvailability } from '@/hooks/useAvailability';

interface Props {
  day: Date;
  availability: DayAvailability;
  onPress: () => void;
  theme: typeof Colors.light;
}

export default function DayAvailabilityCard({ day, availability, onPress, theme }: Props) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
    };

  const getAvailabilityText = () => {
    if (!availability?.available) {
      return { text: 'Not available', color: theme.icon };
    }
    if (availability.startTime && availability.endTime) {
      return {
        text: `Available: ${formatTime(availability.startTime)} - ${formatTime(availability.endTime)}`,
        color: theme.success,
      };
    }
    return { text: 'Available', color: theme.success };
  };

  const info = getAvailabilityText();

  return (
    <TouchableOpacity
      style={[
        styles.dayCard,
        {
          backgroundColor: theme.background,
          borderColor: theme.secondary,
          shadowColor: theme.shadow,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.dayCardContent}>
        <View style={styles.dayCardLeft}>
          <View style={styles.dayDate}>
            <Text style={[styles.dayAbbrev, { color: theme.icon }]}>
              {format(day, 'EEE').toUpperCase()}
            </Text>
            <ThemedText style={styles.dayNumber}>{format(day, 'd')}</ThemedText>
          </View>
          <View style={styles.dayInfo}>
            <ThemedText style={styles.dayName}>{format(day, 'EEEE')}</ThemedText>
            <Text style={[styles.availabilityText, { color: info.color }]}>{info.text}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayDate: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  dayAbbrev: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
  },
  availabilityText: {
    fontSize: 14,
    marginTop: 2,
  },
});
