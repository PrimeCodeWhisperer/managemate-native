import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  role?: string;
  urgent?: boolean;
}

export default function ShiftCard({ shift }: { shift: Shift }) {
  const shiftDate = parseISO(String(shift.date));
  let dateLabel = format(shiftDate, 'MMM d');
  if (isToday(shiftDate)) {
    dateLabel = 'Today';
  } else if (isTomorrow(shiftDate)) {
    dateLabel = 'Tomorrow';
  }

  const start = format(parseISO(`2000-01-01T${shift.start_time}`), 'h:mm a');
  const end = shift.end_time
    ? format(parseISO(`2000-01-01T${shift.end_time}`), 'h:mm a')
    : '';

  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftCardContent}>
        <View style={styles.shiftInfo}>
          <View style={styles.shiftHeader}>
            <Text style={styles.shiftDate}>{dateLabel}</Text>
            {shift.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={styles.shiftTitle}>{shift.role || 'Shift'}</Text>
          <Text style={styles.shiftTime}>
            {start}
            {end ? ` - ${end}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.pickUpButton}>
          <Text style={styles.pickUpButtonText}>Pick Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftInfo: {
    flex: 1,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  urgentBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickUpButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickUpButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
