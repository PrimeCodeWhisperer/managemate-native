import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CalendarDay, { CalendarDayData } from './CalendarDay';

interface Props {
  days: CalendarDayData[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  theme: typeof Colors.light;
}

export default function CalendarGrid({ days, selectedDate, onSelectDate, theme }: Props) {
  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <ThemedText key={index} style={[styles.dayHeader, { color: theme.icon }]}>
            {day}
          </ThemedText>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            selectedDate={selectedDate}
            onSelect={onSelectDate}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});

