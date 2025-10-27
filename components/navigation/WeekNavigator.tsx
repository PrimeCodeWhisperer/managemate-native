import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { endOfWeek, format } from 'date-fns';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  weekStart: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  theme: typeof Colors.light;
}

export default function WeekNavigator({ weekStart, onNavigate, theme }: Props) {
  return (
    <View style={styles.weekNavigator}>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: theme.secondary }]}
        onPress={() => onNavigate('prev')}
      >
        <Ionicons name="chevron-back" size={16} color={theme.foreground} />
      </TouchableOpacity>

      <View style={styles.weekInfo}>
        <ThemedText style={styles.weekText}>
          Week of {format(weekStart, 'MMM d')}-{format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'd')}
        </ThemedText>
        <ThemedText style={[styles.weekSubtext, { color: theme.icon }]}>Set your availability</ThemedText>
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
  weekNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekText: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
});
