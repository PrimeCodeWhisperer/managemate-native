import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CalendarDayData {
  day: number;
  date: string;
  isCurrentMonth: boolean;
  hasShift: boolean;
}

interface Props {
  day: CalendarDayData;
  selectedDate: string;
  onSelect: (date: string) => void;
  theme: typeof Colors.light;
}

export default function CalendarDay({ day, selectedDate, onSelect, theme }: Props) {
  const isSelected = selectedDate === day.date;

  return (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        day.hasShift && { backgroundColor: theme.foreground },
        isSelected && [styles.selectedDay, { borderColor: theme.success }],
        !day.isCurrentMonth && styles.otherMonthDay,
      ]}
      onPress={() => day.isCurrentMonth && onSelect(day.date)}
    >
      <Text
        style={[
          styles.calendarDayText,
          { color: theme.foreground },
          day.hasShift && { color: theme.background },
          isSelected && styles.selectedDayText,
          !day.isCurrentMonth && { color: theme.muted },
        ]}
      >
        {day.day}
      </Text>
      {day.hasShift && (
        <View
          style={[
            styles.shiftDot,
            { backgroundColor: theme.background },
            isSelected && { backgroundColor: theme.foreground },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  calendarDay: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  selectedDay: {
    borderWidth: 2,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
  },
  selectedDayText: {
    fontWeight: '600',
  },
  shiftDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

