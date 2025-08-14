import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  role?: string;
  urgent?: boolean;
}

export default function ShiftCard({ shift }: { shift: Shift }) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
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
    <View
      style={[
        styles.shiftCard,
        { backgroundColor: theme.background, borderColor: theme.secondary, shadowColor: theme.shadow },
      ]}
    >
      <View style={styles.shiftCardContent}>
        <View style={styles.shiftInfo}>
          <View style={styles.shiftHeader}>
            <Text style={[styles.shiftDate, { color: theme.foreground }]}>{dateLabel}</Text>
            {shift.urgent && (
              <View style={[styles.urgentBadge, { backgroundColor: theme.warning }]}> 
                <Text style={[styles.urgentText, { color: theme.primaryForeground }]}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={[styles.shiftTitle, { color: theme.foreground }]}>{shift.role || 'Shift'}</Text>
          <Text style={[styles.shiftTime, { color: theme.icon }]}>
            {start}
            {end ? ` - ${end}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={[styles.pickUpButton, { backgroundColor: theme.primary }]}> 
          <Text style={[styles.pickUpButtonText, { color: theme.primaryForeground }]}>Pick Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shiftCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
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
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
  },
  pickUpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickUpButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
