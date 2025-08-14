import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  role?: string;
  status?: string;
}

interface Props {
  shift: Shift;
  selectedDate: string;
  theme: typeof Colors.light;
}

export default function ShiftDetailCard({ shift, selectedDate, theme }: Props) {
  const formatShiftTime = (startTime: string, endTime?: string) => {
    const start = format(parseISO(`2000-01-01T${startTime}`), 'h:mm a');
    if (endTime) {
      const end = format(parseISO(`2000-01-01T${endTime}`), 'h:mm a');
      return `${start} - ${end}`;
    }
    return start;
  };

  const calculateShiftDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return '';
    const start = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <View style={[styles.shiftCard, { backgroundColor: theme.background, borderColor: theme.secondary, shadowColor: theme.shadow }]}> 
      <View style={styles.shiftCardHeader}>
        <ThemedText style={styles.shiftDate}>
          {format(parseISO(selectedDate), 'EEEE, MMMM do')}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: theme.successBackground }]}>
          <Text style={[styles.statusText, { color: theme.success }]}>
            {shift.status || 'Scheduled'}
          </Text>
        </View>
      </View>

      <View style={styles.shiftDetails}>
        <View style={styles.shiftDetailRow}>
          <View style={styles.shiftDetailLeft}>
            <Ionicons name="time-outline" size={16} color={theme.icon} />
            <View style={styles.shiftDetailText}>
              <ThemedText style={styles.shiftDetailTitle}>{shift.role || 'Shift'}</ThemedText>
              <ThemedText style={[styles.shiftDetailSubtitle, { color: theme.icon }]}> 
                {formatShiftTime(shift.start_time, shift.end_time)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.shiftDuration}> 
            {calculateShiftDuration(shift.start_time, shift.end_time)}
          </ThemedText>
        </View>

        {shift.location && (
          <View style={styles.shiftDetailRow}>
            <Ionicons name="location-outline" size={16} color={theme.icon} />
            <View style={styles.shiftDetailText}>
              <ThemedText style={styles.shiftDetailTitle}>{shift.location}</ThemedText>
              <ThemedText style={[styles.shiftDetailSubtitle, { color: theme.icon }]}> 
                Location
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.shiftDetailRow}>
          <Ionicons name="person-outline" size={16} color={theme.icon} />
          <View style={styles.shiftDetailText}>
            <ThemedText style={styles.shiftDetailTitle}>{shift.role || 'Sales Associate'}</ThemedText>
            <ThemedText style={[styles.shiftDetailSubtitle, { color: theme.icon }]}> 
              Floor duty
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.shiftActions}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]}> 
          <Text style={[styles.primaryButtonText, { color: theme.primaryForeground }]}> 
            Clock In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.secondary }]}> 
          <ThemedText style={styles.secondaryButtonText}>View Details</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shiftCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
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
  shiftDetails: {
    gap: 12,
    marginBottom: 16,
  },
  shiftDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shiftDetailText: {
    flex: 1,
  },
  shiftDetailTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  shiftDetailSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  shiftDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  shiftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

