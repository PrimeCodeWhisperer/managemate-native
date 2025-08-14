import { Colors } from '@/constants/Colors';
import { DayAvailability } from '@/hooks/useAvailability';
import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  day: Date;
  availability: DayAvailability;
  onPress: () => void;
  theme: typeof Colors.light;
}

export default function DayAvailabilityCard({ day, availability, onPress, theme }: Props) {
  const dayName = format(day, 'EEEE');
  const dayDate = format(day, 'MMM d');

  const renderTimeSlots = () => {
    if (!availability.available || !availability.timeSlots || availability.timeSlots.length === 0) {
      return (
        <View style={styles.unavailableContainer}>
          <FontAwesome name="times-circle" size={16} color={theme.muted} style={styles.unavailableIcon} />
          <Text style={[styles.unavailableText, { color: theme.mutedForeground }]}>
            Not available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timeSlotsContainer}>
        <FontAwesome name="clock-o" size={16} color={theme.success} style={styles.timeIcon} />
        <View style={styles.timeSlots}>
          {availability.timeSlots.map((slot, index) => (
            <Text key={index} style={[styles.timeSlotText, { color: theme.foreground }]}>
              {slot.start} - {slot.end}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: theme.background,
          borderColor: theme.secondary,
          shadowColor: theme.shadow,
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.dayInfo}>
            <Text style={[styles.dayName, { color: theme.foreground }]}>{dayName}</Text>
            <Text style={[styles.dayDate, { color: theme.icon }]}>{dayDate}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: availability.available ? theme.successBackground : theme.muted }
          ]}>
            <Text style={[
              styles.statusText,
              { color: availability.available ? theme.success : theme.mutedForeground }
            ]}>
              {availability.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        
        <View style={styles.content}>
          {renderTimeSlots()}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    minHeight: 24,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeSlots: {
    flex: 1,
    gap: 4,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unavailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unavailableIcon: {
    marginRight: 4,
  },
  unavailableText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
