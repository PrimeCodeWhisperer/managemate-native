import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  time?: string;
  placeholder: string;
  onPress: () => void;
  theme: typeof Colors.light;
}

export default function TimeInputGroup({ label, time, placeholder, onPress, theme }: Props) {
  const formatTime = (t: string) => {
    const [hours, minutes] = t.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.timeInputGroup}>
      <ThemedText style={styles.timeLabel}>{label}</ThemedText>
      <TouchableOpacity
        style={[styles.timeInput, { borderColor: theme.secondary }]}
        onPress={onPress}
      >
        <ThemedText>{time ? formatTime(time) : placeholder}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  timeInputGroup: {
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
});
