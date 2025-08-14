import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  time: string;
  placeholder: string;
  onTimeChange: (time: string) => void;
  theme: typeof Colors.light;
}

export default function TimeInputGroup({ label, time, placeholder, onTimeChange, theme }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (t: string) => {
    if (!t) return placeholder;
    const [hours, minutes] = t.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const createDateFromTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  const formatTimeForStorage = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      const timeString = formatTimeForStorage(selectedDate);
      onTimeChange(timeString); // This was missing - call the prop function!
    }
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleIOSConfirm = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.timeInputGroup}>
      <ThemedText style={styles.timeLabel}>{label}</ThemedText>
      <TouchableOpacity
        style={[styles.timeInput, { borderColor: theme.secondary, backgroundColor: theme.background }]}
        onPress={handlePress}
      >
        <ThemedText style={[styles.timeText, { color: time ? theme.foreground : theme.mutedForeground }]}>
          {formatTime(time)}
        </ThemedText>
      </TouchableOpacity>

      {showPicker && (
        <>
          <DateTimePicker
            value={createDateFromTime(time || '09:00')}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: theme.primary }]}
              onPress={handleIOSConfirm}
            >
              <ThemedText style={[styles.confirmText, { color: theme.primaryForeground }]}>Done</ThemedText>
            </TouchableOpacity>
          )}
        </>
      )}
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
    minHeight: 44,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 8,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
