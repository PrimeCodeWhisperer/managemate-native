import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  currentDate: Date;
  shiftCount: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  theme: typeof Colors.light;
}

export default function MonthNavigator({ currentDate, shiftCount, onNavigate, theme }: Props) {
  return (
    <View style={styles.monthNavigator}>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: theme.secondary }]}
        onPress={() => onNavigate('prev')}
      >
        <Ionicons name="chevron-back" size={16} color={theme.foreground} />
      </TouchableOpacity>

      <View style={styles.monthInfo}>
        <ThemedText style={styles.monthText}>{format(currentDate, 'MMMM yyyy')}</ThemedText>
        <ThemedText style={styles.shiftsCount}>{shiftCount} shifts scheduled</ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: theme.secondary }]}
        onPress={() => onNavigate('next')}
      >
        <Ionicons name="chevron-forward" size={16} color={theme.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  shiftsCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

